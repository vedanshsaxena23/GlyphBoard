// db.mjs
import * as idbDriver from "./indexeddb.js";

// Storage mode: "indexeddb" | "sqlite"
let activeStorageMode = localStorage.getItem("glyph_storage_mode") || "indexeddb";
let sqliteDriverInstance = null;

/**
 * Switch storage engine and optionally unlock/instantiate SQLite.
 * @param {"indexeddb" | "sqlite"} mode
 * @param {Object} [sqliteConfig]
 * @param {string} [sqliteConfig.password]
 */
export async function setStorageEngine(mode, sqliteConfig = {}) {
  if (mode === "sqlite") {
    if (!sqliteDriverInstance) {
      const { createEncryptedSqliteDriver } = await import("./sqliteEncrypted.mjs");
      sqliteDriverInstance = await createEncryptedSqliteDriver(sqliteConfig.password);
    } else if (sqliteConfig.password) {
      await sqliteDriverInstance.unlock(sqliteConfig.password);
    }
    activeStorageMode = "sqlite";
  } else {
    activeStorageMode = "indexeddb";
  }

  localStorage.setItem("glyph_storage_mode", activeStorageMode);
}

// Quick string identifier getter ("indexeddb" | "sqlite")
export function getActiveEngine() {
  return activeStorageMode;
}

// Inspection utility for Settings UI
export function getActiveEngineInfo() {
  const isSqlite = activeStorageMode === "sqlite";

  return {
    engine: activeStorageMode,
    label: isSqlite ? "Encrypted SQLite (AES-GCM)" : "IndexedDB (Default)",
    isEncrypted: isSqlite,
    isUnlocked: isSqlite ? Boolean(sqliteDriverInstance) : true,
  };
}

// Route CRUD dynamically to whichever backend is active
function getDriver() {
  if (activeStorageMode === "sqlite") {
    if (!sqliteDriverInstance) {
      throw new Error(
        "SQLite engine selected but locked or uninitialized. Provide password to unlock."
      );
    }
    return sqliteDriverInstance;
  }
  return idbDriver;
}

// Unified CRUD exports
export async function addClip(...args) {
  return getDriver().addClip(...args);
}

export async function getAllClips(...args) {
  return getDriver().getAllClips(...args);
}

export async function updateClip(...args) {
  return getDriver().updateClip(...args);
}

export async function deleteClip(...args) {
  return getDriver().deleteClip(...args);
}

export async function clearAllClips(...args) {
  return getDriver().clearAllClips(...args);
}