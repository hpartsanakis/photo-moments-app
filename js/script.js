// =========================
// STATE
// =========================

// Main app data
let moments = [];

// LocalStorage key
const STORAGE_KEY = "photo-moments-app-data";

// =========================
// SELECTORS
// =========================

// Form elements
const momentForm = document.getElementById("moment-form");
const titleInput = document.getElementById("title-input");
const locationInput = document.getElementById("location-input");
const imageInput = document.getElementById("image-input");
const categoryInput = document.getElementById("category-input");
const lensInput = document.getElementById("lens-input");
const notesInput = document.getElementById("notes-input");

// Gallery elements
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");

// Fullscreen viewer elements
const photoViewer = document.getElementById("photo-viewer");
const viewerCloseBtn = document.getElementById("viewer-close-btn");
const viewerImage = document.getElementById("viewer-image");
const viewerLocation = document.getElementById("viewer-location");
const viewerTitle = document.getElementById("viewer-title");
const viewerMeta = document.getElementById("viewer-meta");
const viewerNotes = document.getElementById("viewer-notes");

// Bottom navigation
const navItems = document.querySelectorAll(".nav-item");

// =========================
// SAMPLE DATA
// =========================

// These demo moments appear only if localStorage is empty
const sampleMoments = [
  {
    id: crypto.randomUUID(),
    title: "Aurora over Tromsø",
    location: "Tromsø • Norway",
    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
    category: "Aurora",
    lens: "Viltrox 13mm",
    notes: "M Mode • f/1.8 • ISO 1600 • 1s • WB 4000K",
  },
  {
    id: crypto.randomUUID(),
    title: "Snow Street Mood",
    location: "Lofoten • Norway",
    image:
      "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=1200&q=80",
    category: "Snow",
    lens: "DX 16-50mm",
    notes: "A Mode • f/5.6 • Auto ISO • -0.7 EV",
  },
  {
    id: crypto.randomUUID(),
    title: "Harbor Reflections",
    location: "Svolvær • Norway",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "Reflection",
    lens: "DX 12-28mm",
    notes: "M Mode • f/8 • ISO 100 • 6s • tripod",
  },
];

// =========================
// STORAGE
// =========================

function saveMoments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
}

function loadMoments() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    moments = JSON.parse(savedData);

    // Αν το localStorage είναι άδειο array, βάλε demo cards
    if (moments.length === 0) {
      moments = sampleMoments;
      saveMoments();
    }
  } else {
    moments = sampleMoments;
    saveMoments();
  }
}

// =========================
// RENDER GALLERY
// =========================

function renderMoments() {
  galleryGrid.innerHTML = "";

  momentCount.textContent = `${moments.length} moments`;

  moments.forEach((moment, index) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
      <img src="${moment.image}" alt="${moment.title}" />

      <div class="card-overlay"></div>

      <div class="card-content">
        <span class="category-badge">${moment.category}</span>
        <p class="card-location">${moment.location}</p>
        <h3 class="card-title">${moment.title}</h3>
        <p class="card-meta">${moment.lens}</p>
      </div>
    `;

    // Open fullscreen viewer when clicking a card
    card.addEventListener("click", () => {
      openPhotoViewer(moment);
    });

    galleryGrid.appendChild(card);
  });
}

// =========================
// ADD MOMENT
// =========================

function addMoment(event) {
  event.preventDefault();

  const newMoment = {
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    image: imageInput.value.trim(),
    category: categoryInput.value,
    lens: lensInput.value.trim(),
    notes: notesInput.value.trim(),
  };

  moments.unshift(newMoment);

  saveMoments();
  renderMoments();

  momentForm.reset();
}

// =========================
// FULLSCREEN VIEWER
// =========================

function openPhotoViewer(moment) {
  viewerImage.src = moment.image;
  viewerImage.alt = moment.title;

  viewerLocation.textContent = moment.location || "Unknown location";
  viewerTitle.textContent = moment.title;
  viewerMeta.textContent = `${moment.lens || "No lens"} • ${moment.category}`;
  viewerNotes.textContent = moment.notes || "No notes yet.";

  photoViewer.classList.add("active");
}

function closePhotoViewer() {
  photoViewer.classList.add("closing");

  setTimeout(() => {
    photoViewer.classList.remove("active");
    photoViewer.classList.remove("closing");
  }, 250);
}

// =========================
// BOTTOM NAVIGATION
// =========================

function setupBottomNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((btn) => btn.classList.remove("active"));
      item.classList.add("active");

      const section = item.dataset.section;
      console.log("Active section:", section);
    });
  });
}

// =========================
// EVENT LISTENERS
// =========================

momentForm.addEventListener("submit", addMoment);

viewerCloseBtn.addEventListener("click", closePhotoViewer);

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) {
    closePhotoViewer();
  }
});

// Close viewer with ESC key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePhotoViewer();
  }
});

// =========================
// INIT APP
// =========================

function initApp() {
  loadMoments();
  renderMoments();
  setupBottomNavigation();
}

initApp();
