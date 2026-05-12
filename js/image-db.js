// =========================
// IMAGE DATABASE - INDEXEDDB
// =========================

const IMAGE_DB_NAME = "photo-moments-image-db";
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE_NAME = "images";

// =========================
// OPEN DATABASE
// =========================

function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);

    request.onerror = () => {
      reject("Could not open image database.");
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, {
          keyPath: "id",
        });
      }
    };
  });
}

// =========================
// SAVE IMAGE
// =========================

async function saveImageToDB(id, file) {
  const db = await openImageDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE_NAME);

    const imageRecord = {
      id: id,
      file: file,
      createdAt: new Date().toISOString(),
    };

    const request = store.put(imageRecord);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      reject("Could not save image.");
    };
  });
}

// =========================
// GET IMAGE
// =========================

async function getImageFromDB(id) {
  const db = await openImageDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readonly");
    const store = transaction.objectStore(IMAGE_STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject("Could not get image.");
    };
  });
}

// =========================
// DELETE IMAGE
// =========================

async function deleteImageFromDB(id) {
  const db = await openImageDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Could not delete image.");
    };
  });
}

// =========================
// CLEAR ALL IMAGES
// =========================

async function clearImageDB() {
  const db = await openImageDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Could not clear image database.");
    };
  });
}
