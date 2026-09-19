// main-db.js
import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { app, ipcMain } from "electron";

let db = null;
let derivedKey = null; // Stored exclusively in Main process RAM

const ALGORITHM = "aes-256-gcm";
const SALT_SIZE = 16;
const CANARY_RECORD_ID = "__vault_sentinel__";
const CANARY_PLAINTEXT = "CANARY_OK";

function getOrCreateInstallationSalt() {
  const saltPath = path.join(app.getPath("userData"), "salt.bin");

  if (fs.existsSync(saltPath)) {
    return fs.readFileSync(saltPath);
  }

  const userDataDir = path.dirname(saltPath);
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const newSalt = crypto.randomBytes(SALT_SIZE);
  fs.writeFileSync(saltPath, newSalt);
  return newSalt;
}

function deriveKey(passphrase) {
  const salt = getOrCreateInstallationSalt();
  return crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");
}

function encrypt(text) {
  const textToEncrypt = text ?? "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  let encrypted = cipher.update(textToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { ciphertext: encrypted, iv: iv.toString("hex"), tag };
}

function decrypt(ciphertext, ivHex, tagHex) {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      derivedKey,
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt clip payload:", err.message);
    return "[Encrypted Content - Decryption Failed]";
  }
}

export function initSqliteIpc() {
  ipcMain.handle("sqlite-init", async (event, passphrase) => {
    try {
      if (!passphrase || typeof passphrase !== "string") {
        return { success: false, error: "Passphrase is required." };
      }

      // Close previous instance if re-initializing
      if (db) {
        try { db.close(); } catch (_) {}
        db = null;
      }

      derivedKey = deriveKey(passphrase);
      const dbPath = path.join(app.getPath("userData"), "glyphboard.db");

      db = new Database(dbPath);
      db.pragma("journal_mode = WAL");

      // 1. Base table creation
      db.exec(`
        CREATE TABLE IF NOT EXISTS clips (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          language TEXT,
          content TEXT,
          iv TEXT,
          tag TEXT,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      // 2. Migration safety: check if description column exists for pre-existing tables
      const columns = db.prepare("PRAGMA table_info(clips)").all();
      const hasDescription = columns.some((col) => col.name === "description");
      if (!hasDescription) {
        db.exec("ALTER TABLE clips ADD COLUMN description TEXT DEFAULT ''");
      }

      // 3. Canary verification: ensures passphrase is correct for existing databases
      const canaryRow = db.prepare("SELECT * FROM clips WHERE id = ?").get(CANARY_RECORD_ID);

      if (canaryRow) {
        const decryptedCanary = decrypt(canaryRow.content, canaryRow.iv, canaryRow.tag);
        if (decryptedCanary !== CANARY_PLAINTEXT) {
          derivedKey = null;
          db.close();
          db = null;
          return { success: false, error: "Incorrect passphrase." };
        }
      } else {
        // First run: write the verification canary
        const { ciphertext, iv, tag } = encrypt(CANARY_PLAINTEXT);
        const stmt = db.prepare(`
          INSERT INTO clips (id, title, description, language, content, iv, tag, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          CANARY_RECORD_ID,
          "__SYSTEM__",
          "",
          "text",
          ciphertext,
          iv,
          tag,
          Date.now(),
          Date.now()
        );
      }

      return { success: true };
    } catch (err) {
      console.error("SQLite Init Error:", err);
      derivedKey = null;
      if (db) {
        try { db.close(); } catch (_) {}
        db = null;
      }
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("sqlite-add-clip", async (event, clip) => {
    if (!db || !derivedKey) throw new Error("Database not initialized or unlocked");
    const { ciphertext, iv, tag } = encrypt(clip.content || "");
    const stmt = db.prepare(`
      INSERT INTO clips (id, title, description, language, content, iv, tag, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      clip.id,
      clip.title || "",
      clip.description || "",
      clip.language || "text",
      ciphertext,
      iv,
      tag,
      clip.createdAt || Date.now(),
      clip.updatedAt || Date.now()
    );

    // Return the string ID directly so callers don't accidentally render raw objects
    return clip.id;
  });

  ipcMain.handle("sqlite-get-all-clips", async () => {
    if (!db || !derivedKey) return [];
    // Filter out the internal sentinel record so it never appears in the UI
    const rows = db.prepare(
      "SELECT * FROM clips WHERE id != ? ORDER BY updated_at DESC"
    ).all(CANARY_RECORD_ID);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      language: row.language,
      content: decrypt(row.content, row.iv, row.tag),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  });

  ipcMain.handle("sqlite-update-clip", async (event, clip) => {
    if (!db || !derivedKey) throw new Error("Database not initialized or unlocked");
    const { ciphertext, iv, tag } = encrypt(clip.content || "");
    const stmt = db.prepare(`
      UPDATE clips
      SET title = ?, description = ?, language = ?, content = ?, iv = ?, tag = ?, updated_at = ?
      WHERE id = ? AND id != ?
    `);
    stmt.run(
      clip.title || "",
      clip.description || "",
      clip.language || "text",
      ciphertext,
      iv,
      tag,
      Date.now(),
      clip.id,
      CANARY_RECORD_ID
    );
    return clip.id;
  });

  ipcMain.handle("sqlite-delete-clip", async (event, id) => {
    if (!db) return { success: false };
    db.prepare("DELETE FROM clips WHERE id = ? AND id != ?").run(id, CANARY_RECORD_ID);
    return { success: true };
  });

  ipcMain.handle("sqlite-clear-clips", async () => {
    if (db) {
      // Clear user clips while preserving the canary
      db.prepare("DELETE FROM clips WHERE id != ?").run(CANARY_RECORD_ID);
    }
    return { success: true };
  });

  ipcMain.handle("sqlite-purge-database", async () => {
    try {
      if (db) {
        db.pragma("wal_checkpoint(TRUNCATE)");
        db.close();
        db = null;
      }
      derivedKey = null;
      const userData = app.getPath("userData");
      const filesToWipe = [
        "glyphboard.db",
        "glyphboard.db-wal",
        "glyphboard.db-shm",
        "salt.bin",
      ];

      for (const file of filesToWipe) {
        const fullPath = path.join(userData, file);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return { success: true };
    } catch (err) {
      console.error("Purge DB Error:", err);
      return { success: false, error: err.message };
    }
  });
}