// src/utilities/sqliteEncrypted.mjs

class SqliteIpcClient {
  constructor(unlocked = false) {
    this.isUnlocked = unlocked;
  }

  _getBridge() {
    const bridge = window.electron?.db;
    if (!bridge) {
      throw new Error(
        "Electron SQLite IPC bridge is not available on window.electron.db. Verify preload.cjs is loaded."
      );
    }
    return bridge;
  }
  
  async unlock(passphrase) {
    if (!passphrase) {
      throw new Error("A passphrase is required to unlock SQLite storage.");
    }
    const result = await window.electron.db.init(passphrase);
    if (!result || !result.success) {
      throw new Error(result?.error || "Failed to initialize or unlock SQLite database.");
    }
    this.isUnlocked = true;
    return true;
  }

  async addClip(clip) {
    return window.electron.db.addClip(clip);
  }

  async getAllClips() {
    return window.electron.db.getAllClips();
  }

  async updateClip(clip) {
    return window.electron.db.updateClip(clip);
  }

  async deleteClip(id) {
    return window.electron.db.deleteClip(id);
  }

  async clearAllClips() {
    return window.electron.db.clearClips();
  }

  async purge() {
    const res = await window.electron.db.purge();
    this.isUnlocked = false;
    return res;
  }
}

export async function createEncryptedSqliteDriver(passphrase) {
  const driver = new SqliteIpcClient();
  if (passphrase) {
    await driver.unlock(passphrase);
  }
  return driver;
}