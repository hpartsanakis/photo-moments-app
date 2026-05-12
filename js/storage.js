// =========================
// STORAGE
// =========================
// This file handles metadata persistence.
// Images are NOT stored here. Images are stored in IndexedDB via image-db.js.

const STORAGE_KEY = "photo-moments-app-data";

function saveMoments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
}

function loadMoments() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    moments = JSON.parse(saved);
  } else {
    moments = sampleMoments;
    saveMoments();
  }
}

function clearStoredMoments() {
  localStorage.removeItem(STORAGE_KEY);
}
