const DB_NAME = "GlyphBoardDB";
const DB_VERSION = 1;
const STORE_NAME = "clips";

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Helper to safely close DB connections
function closeDB(db) {
  if (db) db.close();
}

// CREATE
export async function addClip(content = "", language = "plaintext", title = "Untitled Snippet") {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ title, language, content, timestamp: Date.now() });

    tx.oncomplete = () => { closeDB(db); resolve(req.result); };
    tx.onerror = () => { closeDB(db); reject(tx.error); };
  });
}

// READ
export async function getAllClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    tx.oncomplete = () => {
      closeDB(db);
      resolve(req.result.sort((a, b) => b.timestamp - a.timestamp));
    };
    tx.onerror = () => { closeDB(db); reject(tx.error); };
  });
}

// UPDATE
export async function updateClip(updatedRecord) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    updatedRecord.id = Number(updatedRecord.id);
    const req = store.put(updatedRecord);

    tx.oncomplete = () => { closeDB(db); resolve(req.result); };
    tx.onerror = () => { closeDB(db); reject(tx.error); };
  });
}

// DELETE
export async function deleteClip(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const targetId = typeof id === "object" ? id.id : Number(id);
    const req = store.delete(targetId);

    tx.oncomplete = () => { closeDB(db); resolve(true); };
    tx.onerror = () => { closeDB(db); reject(tx.error); };
  });
}

// PURGE
export async function clearAllClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    tx.oncomplete = () => { closeDB(db); resolve(true); };
    tx.onerror = () => { closeDB(db); reject(tx.error); };
  });
}
