// src/utilities/db.mjs
import * as idbDriver from "./indexeddb.js";

let activeStorageMode = localStorage.getItem("glyph_storage_mode") || "sqlite";

// 💡 1. Read existing instance from global window memory if already unlocked
let sqliteDriverInstance = typeof window !== "undefined" ? window.__gb_sqlite_driver__ || null : null;

export async function setStorageEngine(mode, sqliteConfig = {}) {
  if (mode === "sqlite") {
    try {
      // If already unlocked and no new password provided, keep it active
      if (sqliteDriverInstance?.isUnlocked && !sqliteConfig.password) {
        activeStorageMode = "sqlite";
        localStorage.setItem("glyph_storage_mode", "sqlite");
        return;
      }

      const { createEncryptedSqliteDriver } = await import("./sqliteEncrypted.mjs");
      sqliteDriverInstance = await createEncryptedSqliteDriver(sqliteConfig.password);

      // 💡 2. Pin instance to global window so it persists across all re-renders & HMR
      if (typeof window !== "undefined") {
        window.__gb_sqlite_driver__ = sqliteDriverInstance;
      }

      activeStorageMode = "sqlite";
      localStorage.setItem("glyph_storage_mode", "sqlite");
    } catch (err) {
      sqliteDriverInstance = null;
      if (typeof window !== "undefined") window.__gb_sqlite_driver__ = null;
      throw err;
    }
  } else {
    // Switching to IndexedDB
    if (sqliteDriverInstance) {
      sqliteDriverInstance.isUnlocked = false;
      sqliteDriverInstance = null;
    }
    if (typeof window !== "undefined") window.__gb_sqlite_driver__ = null;
    activeStorageMode = "indexeddb";
    localStorage.setItem("glyph_storage_mode", "indexeddb");
  }
}

// 💡 3. Always pull latest reference from window in getDriver
function getDriver() {
  if (activeStorageMode === "sqlite") {
    const currentInstance = sqliteDriverInstance || (typeof window !== "undefined" ? window.__gb_sqlite_driver__ : null);
    
    if (!currentInstance || !currentInstance.isUnlocked) {
      throw new Error("SQLite engine selected but locked or uninitialized. Provide password to unlock.");
    }
    return currentInstance;
  }
  return idbDriver;
}

export function lockStorage() {
  const currentInstance = sqliteDriverInstance || (typeof window !== "undefined" ? window.__gb_sqlite_driver__ : null);
  if (currentInstance) {
    currentInstance.isUnlocked = false;
  }
  sqliteDriverInstance = null;
  if (typeof window !== "undefined") {
    window.__gb_sqlite_driver__ = null;
  }

  if (idbDriver.closeDB) {
    idbDriver.closeDB();
  }
}

export function getActiveEngineInfo() {
  const currentInstance = sqliteDriverInstance || (typeof window !== "undefined" ? window.__gb_sqlite_driver__ : null);
  const isSqlite = activeStorageMode === "sqlite";
  return {
    engine: activeStorageMode,
    label: isSqlite ? "Encrypted SQLite (AES-GCM)" : "IndexedDB (Default)",
    isEncrypted: isSqlite,
    isUnlocked: isSqlite ? Boolean(currentInstance?.isUnlocked) : true,
  };
}

export async function addClip(clip) {
  return getDriver().addClip(clip);
}

export async function getAllClips() {
  return getDriver().getAllClips();
}

export async function updateClip(clip) {
  return getDriver().updateClip(clip);
}

export async function deleteClip(id) {
  return getDriver().deleteClip(id);
}

export async function clearAllClips() {
  return getDriver().clearAllClips();
}