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

// 1. CREATE: Add a fresh clipboard record row
export async function addClip(content = "", language = "plaintext", title = "Untitled Snippet") {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.add({
      title,
      language,
      content,
      timestamp: Date.now()
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 2. READ: Fetch all items from storage sorted by timestamp (newest first)
export async function getAllClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

// 3. UPDATE: Explicitly modify an existing snippet record (Crucial for your Autosave loop!)
export async function updateClip(updatedRecord) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    // Ensure ID is passed as a pure number to guarantee strict key index alignment
    if (updatedRecord.id) {
      updatedRecord.id = Number(updatedRecord.id);
    }
    
    const request = store.put(updatedRecord);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 4. DELETE: Drop a target row using its ID key
export async function deleteClip(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    // Defensive normalization against accidental string mutations
    const targetId = typeof id === "object" ? id.id : Number(id);
    const request = store.delete(targetId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// 5. PURGE: Completely clear out the object store data blocks without altering schemas
export async function clearAllClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}