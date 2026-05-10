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

//Search elements
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

// Gallery elements
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");
const emptyState = document.getElementById("empty-state");

// Fullscreen viewer elements
const photoViewer = document.getElementById("photo-viewer");
const viewerCloseBtn = document.getElementById("viewer-close-btn");
const viewerImage = document.getElementById("viewer-image");
const viewerLocation = document.getElementById("viewer-location");
const viewerTitle = document.getElementById("viewer-title");
const viewerLens = document.getElementById("viewer-lens");
const viewerNotes = document.getElementById("viewer-notes");
const viewerCategory = document.getElementById("viewer-category");

// Bottom navigation
const navItems = document.querySelectorAll(".nav-item");

// =========================
// SAMPLE DATA
// =========================

// These demo moments appear only if localStorage is empty
const sampleMoments = [
  {
    id: crypto.randomUUID(),
    title: "Aurora over Tromsø Fjord",
    location: "Tromso • Norway",
    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
    category: "Aurora",
    lens: "Viltrox 13mm f/1.4",
    notes: "M Mode • f/1.8 • ISO 1600 • 1s • WB 4000K • Tripod",
    favorite: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Snow Street Mood",
    location: "Lofoten • Norway",
    image:
      "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=1200&q=80",
    category: "Snow",
    lens: "DX 16-50mm @ 40mm",
    notes: "A Mode • f/5.6 • Auto ISO • 1/250s • -0.7 EV",
  },
  {
    id: crypto.randomUUID(),
    title: "Harbor Lights Reflection",
    location: "Svolvær • Norway",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "Reflection",
    lens: "DX 12-28mm",
    notes: "M Mode • f/8 • ISO 100 • 6s • WB 3800K • Tripod",
    favorite: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Rainy Window Landscape",
    location: "Hotel Window • Norway",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    category: "Rain",
    lens: "DX 16-50mm",
    notes: "A Mode • f/5.6-f/8 • Auto ISO • -0.3 EV • WB Cloudy",
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

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  const filteredMoments = moments.filter((moment) => {
    const matchesSearch =
      moment.title.toLowerCase().includes(searchTerm) ||
      moment.location.toLowerCase().includes(searchTerm) ||
      moment.notes.toLowerCase().includes(searchTerm) ||
      moment.lens.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || moment.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  momentCount.textContent = `${filteredMoments.length} moments`;

  if (filteredMoments.length === 0) {
    emptyState.classList.add("active");
    return;
  }

  emptyState.classList.remove("active");

  filteredMoments.forEach((moment, index) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
  <img src="${moment.image}" alt="${moment.title}" />

  <button class="favorite-btn ${moment.favorite ? "active" : ""}" data-id="${moment.id}">
  ★
</button>

  <div class="card-overlay"></div>

  <div class="card-content">
    <span class="category-badge">${moment.category}</span>
    <p class="card-location">${moment.location}</p>
    <h3 class="card-title">${moment.title}</h3>
    <p class="card-meta">${moment.lens}</p>
  </div>
`;
    const favoriteBtn = card.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(moment.id);
    });

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
    favorite: false,
  };

  moments.unshift(newMoment);

  saveMoments();
  renderMoments();

  momentForm.reset();
}
// ========================
//ADD FAVORITE
//=========================
function toggleFavorite(id) {
  moments = moments.map((moment) => {
    if (moment.id === id) {
      return {
        ...moment,
        favorite: !moment.favorite,
      };
    }

    return moment;
  });

  saveMoments();
  renderMoments();
}

// =========================
// FULLSCREEN VIEWER
// =========================
//OPEN
function openPhotoViewer(moment) {
  viewerImage.src = moment.image;
  viewerTitle.textContent = moment.title;
  viewerLocation.textContent = moment.location;
  viewerLens.textContent = moment.lens;
  viewerNotes.textContent = moment.notes;
  viewerCategory.textContent = moment.category;

  photoViewer.classList.add("active");

  document.body.style.overflow = "hidden";
}

//CLOSE
function closePhotoViewer() {
  photoViewer.classList.add("closing");

  setTimeout(() => {
    photoViewer.classList.remove("active");
    photoViewer.classList.remove("closing");

    document.body.style.overflow = "auto";
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

searchInput.addEventListener("input", renderMoments);
filterCategory.addEventListener("change", renderMoments);

// =========================
// INIT APP
// =========================

function initApp() {
  loadMoments();
  renderMoments();
  setupBottomNavigation();
}

initApp();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePhotoViewer();
  }
});
