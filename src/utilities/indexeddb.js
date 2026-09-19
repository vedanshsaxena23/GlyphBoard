// src/utilities/indexeddb.js
const DB_NAME = "GlyphBoardDB";
const DB_VERSION = 1;
const STORE_NAME = "clips";

let cachedDB = null;

export function openDB() {
  if (cachedDB) {
    return Promise.resolve(cachedDB);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (e) => {
      cachedDB = e.target.result;
      cachedDB.onclose = () => { cachedDB = null; };
      cachedDB.onversionchange = () => {
        cachedDB.close();
        cachedDB = null;
      };
      resolve(cachedDB);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

export function closeDB() {
  if (cachedDB) {
    cachedDB.close();
    cachedDB = null;
  }
}

// CREATE
export async function addClip(clipOrContent = "", language = "plaintext", title = "Untitled Snippet") {
  const record =
    typeof clipOrContent === "object" && clipOrContent !== null
      ? {
          title: clipOrContent.title || "Untitled Snippet",
          language: clipOrContent.language || "plaintext",
          content: clipOrContent.content || "",
          timestamp: clipOrContent.timestamp || Date.now(),
        }
      : {
          title,
          language,
          content: clipOrContent,
          timestamp: Date.now(),
        };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(record);

    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
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
      const results = req.result || [];
      resolve(results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// UPDATE
export async function updateClip(updatedRecord) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record = {
      ...updatedRecord,
      id: Number(updatedRecord.id),
      timestamp: updatedRecord.timestamp || Date.now(),
    };

    const req = store.put(record);

    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// DELETE
export async function deleteClip(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const targetId = typeof id === "object" && id !== null ? Number(id.id) : Number(id);
    store.delete(targetId);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// PURGE
export async function clearAllClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}