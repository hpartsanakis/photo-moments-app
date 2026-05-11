// =========================
// STATE
// =========================

let moments = [];
let editingMomentId = null;

const STORAGE_KEY = "photo-moments-app-data";

// =========================
// SELECTORS
// =========================

// Form
const momentForm = document.getElementById("moment-form");
const titleInput = document.getElementById("title-input");
const locationInput = document.getElementById("location-input");
const imageInput = document.getElementById("image-input");
const categoryInput = document.getElementById("category-input");
const lensInput = document.getElementById("lens-input");
const notesInput = document.getElementById("notes-input");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// Gallery
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");
const emptyState = document.getElementById("empty-state");

// Search / Filter
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

// Viewer
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

const sampleMoments = [
  {
    id: crypto.randomUUID(),
    title: "Aurora over Tromsø Fjord",
    location: "Tromsø • Norway",
    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
    category: "Aurora",
    lens: "Viltrox 13mm f/1.4",
    notes: "M Mode • f/1.8 • ISO 1600 • 1s • WB 4000K • Tripod",
    favorite: true,
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
    favorite: false,
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
    favorite: true,
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
    favorite: false,
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
    const title = moment.title || "";
    const location = moment.location || "";
    const notes = moment.notes || "";
    const lens = moment.lens || "";
    const category = moment.category || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm) ||
      location.toLowerCase().includes(searchTerm) ||
      notes.toLowerCase().includes(searchTerm) ||
      lens.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const label = filteredMoments.length === 1 ? "moment" : "moments";
  momentCount.textContent = `${filteredMoments.length} ${label}`;

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

      <button
        class="favorite-btn ${moment.favorite ? "active" : ""}"
        data-id="${moment.id}"
        aria-label="Toggle favorite"
      >
        ★
      </button>

      <button
        class="edit-btn"
        data-id="${moment.id}"
        aria-label="Edit moment"
      >
        ✎
      </button>

      <button
        class="delete-btn"
        data-id="${moment.id}"
        aria-label="Delete moment"
      >
        🗑
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

    const editBtn = card.querySelector(".edit-btn");
    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      startEditMoment(moment.id);
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteMoment(moment.id);
    });

    card.addEventListener("click", () => {
      openPhotoViewer(moment);
    });

    galleryGrid.appendChild(card);
  });
}
function renderFavoriteMoments() {
  galleryGrid.innerHTML = "";

  const favoriteMoments = moments.filter((moment) => moment.favorite);

  momentCount.textContent = `${favoriteMoments.length} favorite moments`;

  if (favoriteMoments.length === 0) {
    emptyState.classList.add("active");

    emptyState.innerHTML = `
      <div class="empty-icon">⭐</div>
      <h3>No favorite moments yet</h3>
      <p>Tap the star icon on a photo to save favorites.</p>
    `;

    return;
  }

  emptyState.classList.remove("active");

  favoriteMoments.forEach((moment, index) => {
    const card = document.createElement("article");

    card.className = "photo-card";
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
      <img src="${moment.image}" alt="${moment.title}" />

      <button
        class="favorite-btn active"
        data-id="${moment.id}"
      >
        ★
      </button>

      <button
        class="edit-btn"
        data-id="${moment.id}"
      >
        ✎
      </button>

      <button
        class="delete-btn"
        data-id="${moment.id}"
      >
        🗑
      </button>

      <div class="card-overlay"></div>

      <div class="card-content">
        <span class="category-badge">
          ${moment.category}
        </span>

        <p class="card-location">
          ${moment.location}
        </p>

        <h3 class="card-title">
          ${moment.title}
        </h3>

        <p class="card-meta">
          ${moment.lens}
        </p>
      </div>
    `;

    // FAVORITE BUTTON
    const favoriteBtn = card.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      toggleFavorite(moment.id);

      renderFavoriteMoments();
    });

    // EDIT BUTTON
    const editBtn = card.querySelector(".edit-btn");

    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      startEditMoment(moment.id);
    });

    // DELETE BUTTON
    const deleteBtn = card.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      deleteMoment(moment.id);

      renderFavoriteMoments();
    });

    // OPEN VIEWER
    card.addEventListener("click", () => {
      openPhotoViewer(moment);
    });

    galleryGrid.appendChild(card);
  });
}
// =========================
// ADD / UPDATE MOMENT
// =========================

function addMoment(event) {
  event.preventDefault();

  if (editingMomentId) {
    moments = moments.map((moment) => {
      if (moment.id === editingMomentId) {
        return {
          ...moment,
          title: titleInput.value.trim(),
          location: locationInput.value.trim(),
          image: imageInput.value.trim(),
          category: categoryInput.value,
          lens: lensInput.value.trim(),
          notes: notesInput.value.trim(),
        };
      }

      return moment;
    });

    editingMomentId = null;
  } else {
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
  }

  saveMoments();
  renderMoments();

  momentForm.reset();
  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");
}

// =========================
// EDIT MOMENT
// =========================

function startEditMoment(id) {
  const momentToEdit = moments.find((moment) => moment.id === id);

  if (!momentToEdit) return;

  editingMomentId = id;

  titleInput.value = momentToEdit.title;
  locationInput.value = momentToEdit.location;
  imageInput.value = momentToEdit.image;
  categoryInput.value = momentToEdit.category;
  lensInput.value = momentToEdit.lens;
  notesInput.value = momentToEdit.notes;

  submitBtn.textContent = "Update Moment";
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function cancelEditMoment() {
  editingMomentId = null;

  momentForm.reset();

  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");
}

// =========================
// FAVORITE SYSTEM
// =========================

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
// DELETE SYSTEM
// =========================

function deleteMoment(id) {
  const confirmDelete = confirm("Delete this photo moment?");

  if (!confirmDelete) return;

  moments = moments.filter((moment) => moment.id !== id);

  if (editingMomentId === id) {
    cancelEditMoment();
  }

  saveMoments();
  renderMoments();
}

// =========================
// FULLSCREEN VIEWER
// =========================

function openPhotoViewer(moment) {
  viewerImage.src = moment.image;
  viewerImage.alt = moment.title;

  viewerTitle.textContent = moment.title || "Untitled";
  viewerLocation.textContent = moment.location || "Unknown location";
  viewerLens.textContent = moment.lens || "No lens";
  viewerNotes.textContent = moment.notes || "No notes yet.";
  viewerCategory.textContent = moment.category || "Uncategorized";

  photoViewer.classList.add("active");
  document.body.style.overflow = "hidden";
}

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
      navItems.forEach((btn) => {
        btn.classList.remove("active");
      });

      item.classList.add("active");

      const section = item.dataset.section;

      // FAVORITES MODE
      if (section === "favorites") {
        renderFavoriteMoments();
      } else {
        renderMoments();
      }

      console.log("Active section:", section);
    });
  });
}

// =========================
// EVENT LISTENERS
// =========================

momentForm.addEventListener("submit", addMoment);
cancelEditBtn.addEventListener("click", cancelEditMoment);

searchInput.addEventListener("input", renderMoments);
filterCategory.addEventListener("change", renderMoments);

viewerCloseBtn.addEventListener("click", closePhotoViewer);

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) {
    closePhotoViewer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoViewer.classList.contains("active")) {
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
