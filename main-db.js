// main-db.js
import initSqlJs from "sql.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { app, ipcMain } from "electron";

let SQL = null;
let db = null;
let derivedKey = null; // Maintained exclusively in process RAM

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

function encryptText(text) {
  const textToEncrypt = text ?? "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  let encrypted = cipher.update(textToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { ciphertext: encrypted, iv: iv.toString("hex"), tag };
}

function decryptText(ciphertext, ivHex, tagHex) {
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

// Persists the in-memory SQLite state to an AES-256-GCM encrypted file on disk
function persistDatabase() {
  if (!db || !derivedKey) return;
  const dbFilePath = path.join(app.getPath("userData"), "glyphboard.enc");
  
  const binaryArray = db.export();
  const bufferData = Buffer.from(binaryArray);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([cipher.update(bufferData), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Layout: [12 bytes IV][16 bytes TAG][Encrypted DB Payload]
  const envelope = Buffer.concat([iv, tag, encrypted]);
  fs.writeFileSync(dbFilePath, envelope);
}

// Loads and decrypts the database file into memory
function loadEncryptedDatabase(key) {
  const dbFilePath = path.join(app.getPath("userData"), "glyphboard.enc");
  if (!fs.existsSync(dbFilePath)) return null;

  const envelope = fs.readFileSync(dbFilePath);
  if (envelope.length < 28) {
    throw new Error("Corrupted database envelope.");
  }

  const iv = envelope.subarray(0, 12);
  const tag = envelope.subarray(12, 28);
  const encryptedData = envelope.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return new SQL.Database(new Uint8Array(decrypted));
}

export function initSqliteIpc() {
  ipcMain.handle("sqlite-init", async (event, passphrase) => {
    try {
      if (!passphrase || typeof passphrase !== "string") {
        return { success: false, error: "Passphrase is required." };
      }

      if (!SQL) {
        SQL = await initSqlJs();
      }

      if (db) {
        try { db.close(); } catch (_) {}
        db = null;
      }

      const tempDerivedKey = deriveKey(passphrase);
      const dbFilePath = path.join(app.getPath("userData"), "glyphboard.enc");

      if (fs.existsSync(dbFilePath)) {
        try {
          db = loadEncryptedDatabase(tempDerivedKey);
        } catch (err) {
          return { success: false, error: "Incorrect passphrase or corrupted database." };
        }
      } else {
        db = new SQL.Database();
      }

      derivedKey = tempDerivedKey;

      // 1. Base table creation
      db.run(`
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

      // 2. Migration safety: check if description column exists
      const tableInfo = db.exec("PRAGMA table_info(clips)");
      const columns = tableInfo.length > 0 ? tableInfo[0].values.map(col => col[1]) : [];
      if (!columns.includes("description")) {
        db.run("ALTER TABLE clips ADD COLUMN description TEXT DEFAULT ''");
      }

      // 3. Zero-knowledge canary sentinel check
      const canaryStmt = db.prepare("SELECT * FROM clips WHERE id = :id");
      canaryStmt.bind({ ":id": CANARY_RECORD_ID });
      
      let hasCanary = canaryStmt.step();
      let canaryRow = hasCanary ? canaryStmt.getAsObject() : null;
      canaryStmt.free();

      if (canaryRow) {
        const decryptedCanary = decryptText(canaryRow.content, canaryRow.iv, canaryRow.tag);
        if (decryptedCanary !== CANARY_PLAINTEXT) {
          derivedKey = null;
          db.close();
          db = null;
          return { success: false, error: "Incorrect passphrase." };
        }
      } else {
        const { ciphertext, iv, tag } = encryptText(CANARY_PLAINTEXT);
        db.run(
          `INSERT INTO clips (id, title, description, language, content, iv, tag, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [CANARY_RECORD_ID, "__SYSTEM__", "", "text", ciphertext, iv, tag, Date.now(), Date.now()]
        );
      }

      persistDatabase();
      return { success: true };
    } catch (err) {
      console.error("SQLite/WASM Init Error:", err);
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
    const { ciphertext, iv, tag } = encryptText(clip.content || "");
    
    db.run(
      `INSERT INTO clips (id, title, description, language, content, iv, tag, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clip.id,
        clip.title || "",
        clip.description || "",
        clip.language || "text",
        ciphertext,
        iv,
        tag,
        clip.createdAt || Date.now(),
        clip.updatedAt || Date.now()
      ]
    );

    persistDatabase();
    return clip.id;
  });

  ipcMain.handle("sqlite-get-all-clips", async () => {
    if (!db || !derivedKey) return [];

    const stmt = db.prepare("SELECT * FROM clips WHERE id != :canaryId ORDER BY updated_at DESC");
    stmt.bind({ ":canaryId": CANARY_RECORD_ID });

    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id,
        title: row.title,
        description: row.description || "",
        language: row.language,
        content: decryptText(row.content, row.iv, row.tag),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    stmt.free();
    return results;
  });

  ipcMain.handle("sqlite-update-clip", async (event, clip) => {
    if (!db || !derivedKey) throw new Error("Database not initialized or unlocked");
    const { ciphertext, iv, tag } = encryptText(clip.content || "");

    db.run(
      `UPDATE clips
       SET title = ?, description = ?, language = ?, content = ?, iv = ?, tag = ?, updated_at = ?
       WHERE id = ? AND id != ?`,
      [
        clip.title || "",
        clip.description || "",
        clip.language || "text",
        ciphertext,
        iv,
        tag,
        Date.now(),
        clip.id,
        CANARY_RECORD_ID
      ]
    );

    persistDatabase();
    return clip.id;
  });

  ipcMain.handle("sqlite-delete-clip", async (event, id) => {
    if (!db) return { success: false };
    db.run("DELETE FROM clips WHERE id = ? AND id != ?", [id, CANARY_RECORD_ID]);
    persistDatabase();
    return { success: true };
  });

  ipcMain.handle("sqlite-clear-clips", async () => {
    if (db) {
      db.run("DELETE FROM clips WHERE id != ?", [CANARY_RECORD_ID]);
      persistDatabase();
    }
    return { success: true };
  });

  ipcMain.handle("sqlite-purge-database", async () => {
    try {
      if (db) {
        db.close();
        db = null;
      }
      derivedKey = null;

      const userData = app.getPath("userData");
      const filesToWipe = ["glyphboard.enc", "salt.bin"];

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