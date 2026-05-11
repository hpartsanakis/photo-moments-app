// =========================
// STATE
// =========================

// Main app data
let moments = [];

// Used when editing an existing moment
let editingMomentId = null;

// Used by fullscreen viewer navigation
let currentViewerIndex = 0;

// Current gallery mode: "gallery" or "favorites"
let currentView = "gallery";

// Selected image file from Finder/iPhone.
// Important: the real file is saved in IndexedDB, not localStorage.
let selectedImageFile = null;

// Touch positions for swipe gestures
let touchStartX = 0;
let touchEndX = 0;

// localStorage stores only metadata
const STORAGE_KEY = "photo-moments-app-data";

// =========================
// SELECTORS
// =========================

// Form
const momentForm = document.getElementById("moment-form");
const formTitle = document.getElementById("form-title");

const titleInput = document.getElementById("title-input");
const locationInput = document.getElementById("location-input");
const tripInput = document.getElementById("trip-input");
const dateInput = document.getElementById("date-input");

const fileInput = document.getElementById("file-input");
const imageInput = document.getElementById("image-input");

const categoryInput = document.getElementById("category-input");
const cameraInput = document.getElementById("camera-input");
const lensInput = document.getElementById("lens-input");
const apertureInput = document.getElementById("aperture-input");
const shutterInput = document.getElementById("shutter-input");
const isoInput = document.getElementById("iso-input");
const wbInput = document.getElementById("wb-input");

const notesInput = document.getElementById("notes-input");

const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// Stats
const totalStat = document.getElementById("total-stat");
const favoriteStat = document.getElementById("favorite-stat");
const categoryStat = document.getElementById("category-stat");
const norwayStat = document.getElementById("norway-stat");

// Assistant
const assistantScenario = document.getElementById("assistant-scenario");
const assistantOutput = document.getElementById("assistant-output");
const lensAdvice = document.getElementById("lens-advice");
const weatherAdvice = document.getElementById("weather-advice");

// Aurora checklist
const auroraChecks = document.querySelectorAll(".aurora-card input");
const auroraStatus = document.getElementById("aurora-status");

// Gallery
const galleryTitle = document.getElementById("gallery-title");
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

// Viewer
const photoViewer = document.getElementById("photo-viewer");
const viewerCloseBtn = document.getElementById("viewer-close-btn");
const viewerPrevBtn = document.getElementById("viewer-prev-btn");
const viewerNextBtn = document.getElementById("viewer-next-btn");

const viewerImage = document.getElementById("viewer-image");
const viewerCategory = document.getElementById("viewer-category");
const viewerTitle = document.getElementById("viewer-title");
const viewerLocation = document.getElementById("viewer-location");
const viewerMeta = document.getElementById("viewer-meta");
const viewerNotes = document.getElementById("viewer-notes");

// Navigation / buttons
const navItems = document.querySelectorAll(".nav-item");
const floatingAddBtn = document.getElementById("floating-add-btn");
const presetButtons = document.querySelectorAll(".preset-btn");
const clearDataBtn = document.getElementById("clear-data-btn");

// =========================
// SAMPLE DATA
// =========================

const sampleMoments = [
  {
    id: crypto.randomUUID(),
    title: "Aurora over Tromsø Fjord",
    location: "Tromsø • Norway",
    trip: "Tromsø Aurora Expedition",
    date: "2026-02-12",
    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
    imageStorage: "url",
    category: "Aurora",
    camera: "Nikon Z50",
    lens: "Viltrox 13mm f/1.4",
    aperture: "f/1.8",
    shutter: "1s",
    iso: "1600",
    wb: "4000K",
    notes: "Tripod • Manual Focus • RAW",
    favorite: true,
  },
  {
    id: crypto.randomUUID(),
    title: "Snow Street Mood",
    location: "Lofoten • Norway",
    trip: "Lofoten Winter Journey",
    date: "2026-02-13",
    image:
      "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=1200&q=80",
    imageStorage: "url",
    category: "Snow",
    camera: "Nikon Z50",
    lens: "DX 16-50mm @ 40mm",
    aperture: "f/5.6",
    shutter: "1/250s",
    iso: "Auto",
    wb: "Cloudy",
    notes: "Snow street mood • Watch highlights",
    favorite: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Harbor Lights Reflection",
    location: "Svolvær • Norway",
    trip: "Lofoten Harbor Walk",
    date: "2026-02-14",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    imageStorage: "url",
    category: "Reflection",
    camera: "Nikon Z50",
    lens: "DX 12-28mm",
    aperture: "f/8",
    shutter: "6s",
    iso: "100",
    wb: "3800K",
    notes: "Tripod • Blue hour • Reflection shot",
    favorite: true,
  },
];

// =========================
// STORAGE
// =========================

function saveMoments() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
  } catch (error) {
    console.error("Storage error:", error);

    alert(
      "Storage is full. The app now stores images in IndexedDB, but old large base64 data may still exist. Please clear old data from Settings if needed.",
    );
  }
}

function loadMoments() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    moments = sampleMoments;
    saveMoments();
    return;
  }

  moments = JSON.parse(saved);

  // Remove old broken base64 image records from previous localStorage version
  moments = moments.filter((moment) => {
    if (!moment.image) return false;

    if (typeof moment.image === "string" && moment.image.startsWith("data:")) {
      return false;
    }

    return true;
  });

  if (moments.length === 0) {
    moments = sampleMoments;
  }

  saveMoments();
}

// =========================
// IMAGE HANDLING
// =========================

// This function returns the correct image source:
// - URL images are used directly
// - IndexedDB images are loaded from the image database
async function getMomentImageSrc(moment) {
  if (moment.imageStorage === "indexeddb") {
    const imageRecord = await getImageFromDB(moment.image);

    if (!imageRecord) return "";

    return URL.createObjectURL(imageRecord.file);
  }

  return moment.image;
}

// User chooses image from Finder/iPhone.
// We do NOT convert it to base64 anymore.
// We keep the File temporarily and save it to IndexedDB on submit.
async function handleFileUpload() {
  const file = fileInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    fileInput.value = "";
    selectedImageFile = null;
    return;
  }

  selectedImageFile = file;
  imageInput.value = "";

  await autofillExifFromFile(file);
}

async function autofillExifFromFile(file) {
  if (typeof exifr === "undefined") {
    console.warn("EXIF library not loaded.");
    return;
  }

  try {
    const exif = await exifr.parse(file);

    if (!exif) return;

    if (exif.Model) {
      cameraInput.value = exif.Model;
    }

    if (exif.LensModel) {
      lensInput.value = exif.LensModel;
    }

    if (exif.FNumber) {
      apertureInput.value = `f/${exif.FNumber}`;
    }

    if (exif.ExposureTime) {
      shutterInput.value = formatShutter(exif.ExposureTime);
    }

    if (exif.ISO) {
      isoInput.value = String(exif.ISO);
    }

    if (exif.DateTimeOriginal) {
      dateInput.value = new Date(exif.DateTimeOriginal)
        .toISOString()
        .split("T")[0];
    }

    notesInput.value =
      `${notesInput.value ? notesInput.value + "\n" : ""}` +
      "EXIF auto-filled from uploaded image.";
  } catch (error) {
    console.warn("Could not read EXIF:", error);
  }
}

// =========================
// FILTERING
// =========================

function getVisibleMoments() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  return [...moments]
    .filter((moment) => currentView !== "favorites" || moment.favorite)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((moment) => {
      const text = `
        ${moment.title || ""}
        ${moment.location || ""}
        ${moment.trip || ""}
        ${moment.notes || ""}
        ${moment.lens || ""}
        ${moment.camera || ""}
      `.toLowerCase();

      const matchesSearch = text.includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" ||
        (moment.category || "").toLowerCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
}

// =========================
// RENDER GALLERY
// =========================

async function renderMoments() {
  const visibleMoments = getVisibleMoments();

  galleryGrid.innerHTML = "";

  galleryTitle.textContent =
    currentView === "favorites" ? "Favorites" : "Gallery";

  const label = visibleMoments.length === 1 ? "moment" : "moments";
  momentCount.textContent = `${visibleMoments.length} ${label}`;

  emptyState.classList.toggle("hidden", visibleMoments.length !== 0);

  for (const moment of visibleMoments) {
    const card = document.createElement("article");

    const categoryClass = (moment.category || "general")
      .toLowerCase()
      .replaceAll(" ", "-");

    card.className = `photo-card ${categoryClass}-card`;

    const imageSrc = await getMomentImageSrc(moment);

    card.innerHTML = `
      <img src="${imageSrc}" alt="${moment.title}" />

      <button class="favorite-btn ${moment.favorite ? "active" : ""}">
        ★
      </button>

      <button class="edit-btn">
        ✎
      </button>

      <button class="delete-btn">
        🗑
      </button>

      <div class="card-overlay"></div>

      <div class="card-content">
        <span class="trip-badge">
          ${moment.trip || "General Collection"}
        </span>

        <br />

        <span class="category-badge">
          ${moment.category}
        </span>

        <p class="card-location">
          ${moment.location || "Unknown location"}
        </p>

        <p class="card-date">
          ${formatDate(moment.date)}
        </p>

        <h3 class="card-title">
          ${moment.title}
        </h3>

        <p class="card-meta">
          ${moment.camera} • ${moment.lens}
        </p>
      </div>
    `;

    card.querySelector(".favorite-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      toggleFavorite(moment.id);
    });

    card.querySelector(".edit-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      startEdit(moment.id);
    });

    card.querySelector(".delete-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      deleteMoment(moment.id);
    });

    card.addEventListener("click", () => {
      openViewer(moment.id);
    });

    galleryGrid.appendChild(card);
  }
}

// =========================
// ADD / UPDATE MOMENT
// =========================

async function addOrUpdateMoment(event) {
  event.preventDefault();

  const momentId = editingMomentId || crypto.randomUUID();

  let image = imageInput.value.trim();
  let imageStorage = "url";

  if (selectedImageFile) {
    await saveImageToDB(momentId, selectedImageFile);

    image = momentId;
    imageStorage = "indexeddb";
  }

  if (!image) {
    alert("Please choose a photo or paste an Image URL.");
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    trip: tripInput.value.trim() || "General Collection",
    date: dateInput.value || new Date().toISOString().split("T")[0],
    image,
    imageStorage,
    category: categoryInput.value,
    camera: cameraInput.value,
    lens: lensInput.value,
    aperture: apertureInput.value,
    shutter: shutterInput.value,
    iso: isoInput.value,
    wb: wbInput.value,
    notes: notesInput.value.trim(),
  };

  if (editingMomentId) {
    moments = moments.map((moment) =>
      moment.id === editingMomentId
        ? {
            ...moment,
            ...data,
          }
        : moment,
    );
  } else {
    moments.unshift({
      id: momentId,
      favorite: false,
      ...data,
    });
  }

  saveMoments();
  resetForm();

  await renderMoments();

  updateStats();
}

// =========================
// EDIT / RESET
// =========================

function startEdit(id) {
  const moment = moments.find((item) => item.id === id);

  if (!moment) return;

  editingMomentId = id;

  formTitle.textContent = "Edit Moment";
  submitBtn.textContent = "Update Moment";
  cancelEditBtn.classList.remove("hidden");

  titleInput.value = moment.title || "";
  locationInput.value = moment.location || "";
  tripInput.value = moment.trip || "";
  dateInput.value = moment.date || "";

  imageInput.value = moment.imageStorage === "url" ? moment.image : "";
  selectedImageFile = null;

  categoryInput.value = moment.category || "Aurora";
  cameraInput.value = moment.camera || "Nikon Z50";
  lensInput.value = moment.lens || "DX 16-50mm";
  apertureInput.value = moment.aperture || "f/5.6";
  shutterInput.value = moment.shutter || "1/250s";
  isoInput.value = moment.iso || "Auto";
  wbInput.value = moment.wb || "Auto";

  notesInput.value = moment.notes || "";

  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });
}

function resetForm() {
  editingMomentId = null;
  selectedImageFile = null;

  momentForm.reset();

  formTitle.textContent = "Add New Moment";
  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");
}

// =========================
// FAVORITE / DELETE
// =========================

async function toggleFavorite(id) {
  moments = moments.map((moment) =>
    moment.id === id
      ? {
          ...moment,
          favorite: !moment.favorite,
        }
      : moment,
  );

  saveMoments();

  await renderMoments();

  updateStats();
}

async function deleteMoment(id) {
  if (!confirm("Delete this moment?")) return;

  const momentToDelete = moments.find((moment) => moment.id === id);

  if (momentToDelete && momentToDelete.imageStorage === "indexeddb") {
    await deleteImageFromDB(momentToDelete.image);
  }

  moments = moments.filter((moment) => moment.id !== id);

  saveMoments();

  await renderMoments();

  updateStats();
}

// =========================
// STATS
// =========================

function updateStats() {
  totalStat.textContent = moments.length;

  favoriteStat.textContent = moments.filter((moment) => moment.favorite).length;

  const uniqueCategories = new Set(moments.map((moment) => moment.category));

  categoryStat.textContent = uniqueCategories.size;

  norwayStat.textContent = moments.filter((moment) =>
    (moment.location || "").toLowerCase().includes("norway"),
  ).length;
}

// =========================
// FULLSCREEN VIEWER
// =========================

async function openViewer(id) {
  currentViewerIndex = moments.findIndex((moment) => moment.id === id);

  await updateViewer();

  photoViewer.classList.add("active");
  document.body.style.overflow = "hidden";
}

async function updateViewer() {
  const moment = moments[currentViewerIndex];

  if (!moment) return;

  const imageSrc = await getMomentImageSrc(moment);

  viewerImage.src = imageSrc;
  viewerImage.alt = moment.title;

  viewerCategory.textContent = moment.category;
  viewerTitle.textContent = moment.title;

  viewerLocation.textContent = `${moment.location || "Unknown location"} • ${formatDate(moment.date)}`;

  viewerMeta.textContent = `${moment.camera} • ${moment.lens} • ${moment.aperture} • ${moment.shutter} • ISO ${moment.iso} • WB ${moment.wb}`;

  viewerNotes.textContent = moment.notes || "No notes.";
}

function closeViewer() {
  photoViewer.classList.remove("active");
  document.body.style.overflow = "auto";
}

async function showNextMoment() {
  currentViewerIndex = (currentViewerIndex + 1) % moments.length;

  await updateViewer();
}

async function showPreviousMoment() {
  currentViewerIndex =
    (currentViewerIndex - 1 + moments.length) % moments.length;

  await updateViewer();
}

// =========================
// ASSISTANT
// =========================

function updateAssistant() {
  const scenario = assistantScenario.value;

  const tips = {
    aurora:
      "<strong>Best lens:</strong> Viltrox 13mm f/1.4<br><strong>Mode:</strong> M<br><strong>Start:</strong> f/1.8 • ISO 1600 • 1s • WB 4000K",
    bluehour:
      "<strong>Best lens:</strong> DX 12-28mm<br><strong>Mode:</strong> M<br><strong>Start:</strong> f/8 • ISO 100 • 3-8s • WB 3800K",
    snow: "<strong>Best lens:</strong> DX 16-50mm<br><strong>Mode:</strong> A<br><strong>Start:</strong> f/5.6 • Auto ISO • 1/250s",
    rain: "<strong>Best lens:</strong> DX 16-50mm<br><strong>Mode:</strong> A<br><strong>Start:</strong> f/5.6-f/8 • Auto ISO",
    husky:
      "<strong>Best lens:</strong> DX 50-250mm<br><strong>Mode:</strong> S<br><strong>Start:</strong> 1/1000s • Auto ISO • AF-C",
  };

  const lensTips = {
    aurora: "Use Viltrox 13mm. DX 16-50mm is backup only.",
    bluehour: "Use DX 12-28mm. Alternative: DX 16-50mm.",
    snow: "Use DX 16-50mm for flexibility.",
    rain: "Use DX 16-50mm and look for reflections.",
    husky: "Use DX 50-250mm and keep distance.",
  };

  const weatherTips = {
    aurora: "Clear sky required • Avoid city lights • Keep battery warm.",
    bluehour: "Best 15–30 minutes after sunset • Wet streets help.",
    snow: "Snow reflects massive light • Watch highlights.",
    rain: "Rain creates reflections • Watch droplets on lens.",
    husky: "Fast shutter required • Snow background can fool exposure.",
  };

  assistantOutput.innerHTML = tips[scenario];
  lensAdvice.textContent = lensTips[scenario];
  weatherAdvice.textContent = weatherTips[scenario];
}

// =========================
// PRESETS
// =========================

function setupPresets() {
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = button.dataset.preset;

      cameraInput.value = "Nikon Z50";

      if (preset === "aurora") {
        categoryInput.value = "Aurora";
        lensInput.value = "Viltrox 13mm f/1.4";
        apertureInput.value = "f/1.8";
        shutterInput.value = "1s";
        isoInput.value = "1600";
        wbInput.value = "4000K";
        notesInput.value = "Tripod • Manual Focus • RAW";
      }

      if (preset === "snow") {
        categoryInput.value = "Snow";
        lensInput.value = "DX 16-50mm";
        apertureInput.value = "f/5.6";
        shutterInput.value = "1/250s";
        isoInput.value = "Auto";
        wbInput.value = "Cloudy";
        notesInput.value = "Protect highlights in snow.";
      }

      if (preset === "bluehour") {
        categoryInput.value = "Blue Hour";
        lensInput.value = "DX 12-28mm";
        apertureInput.value = "f/8";
        shutterInput.value = "6s";
        isoInput.value = "100";
        wbInput.value = "3800K";
        notesInput.value = "Tripod • Blue hour • Reflection shots";
      }

      if (preset === "rain") {
        categoryInput.value = "Rain";
        lensInput.value = "DX 16-50mm";
        apertureInput.value = "f/5.6";
        shutterInput.value = "1/250s";
        isoInput.value = "Auto";
        wbInput.value = "Cloudy";
        notesInput.value = "Use reflections and wet streets.";
      }

      if (preset === "husky") {
        categoryInput.value = "Husky";
        lensInput.value = "DX 50-250mm";
        apertureInput.value = "f/5.6";
        shutterInput.value = "1/1000s";
        isoInput.value = "Auto";
        wbInput.value = "Cloudy";
        notesInput.value = "AF-C • Burst mode • Focus on eyes.";
      }
    });
  });
}

// =========================
// AURORA READINESS
// =========================

function updateAuroraReadiness() {
  const ready = [...auroraChecks].every((check) => check.checked);

  auroraStatus.textContent = ready
    ? "Ready: Viltrox 13mm • f/1.8 • ISO 1600 • 1s • WB 4000K"
    : "Not ready yet. Complete the checklist before going out.";

  auroraStatus.classList.toggle("ready", ready);
}

// =========================
// NAVIGATION
// =========================

function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", async () => {
      navItems.forEach((btn) => btn.classList.remove("active"));

      item.classList.add("active");

      const tab = item.dataset.tab;

      currentView = tab === "favorites" ? "favorites" : "gallery";

      if (tab === "gallery" || tab === "favorites") {
        await renderMoments();

        document.getElementById("gallery-section").scrollIntoView({
          behavior: "smooth",
        });
      }

      if (tab === "add") {
        document.getElementById("add-section").scrollIntoView({
          behavior: "smooth",
        });

        titleInput.focus();
      }

      if (tab === "assistant") {
        document.getElementById("assistant-section").scrollIntoView({
          behavior: "smooth",
        });
      }

      if (tab === "settings") {
        document.getElementById("settings-section").scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
}

// =========================
// SWIPE
// =========================

function setupSwipeGestures() {
  photoViewer.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  photoViewer.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].screenX;

      const distance = touchEndX - touchStartX;

      if (distance < -60) showNextMoment();
      if (distance > 60) showPreviousMoment();
    },
    { passive: true },
  );
}

// =========================
// SETTINGS
// =========================

function clearAllMoments() {
  if (!confirm("Delete all saved moments?")) return;

  localStorage.removeItem(STORAGE_KEY);

  moments = sampleMoments;

  saveMoments();
  renderMoments();
  updateStats();
}

// =========================
// HELPERS
// =========================

function formatDate(dateString) {
  if (!dateString) return "Unknown Date";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatShutter(value) {
  if (!value) return "";

  if (value >= 1) {
    return `${value}s`;
  }

  const denominator = Math.round(1 / value);

  return `1/${denominator}s`;
}

// =========================
// EVENTS
// =========================

momentForm.addEventListener("submit", addOrUpdateMoment);
cancelEditBtn.addEventListener("click", resetForm);
fileInput.addEventListener("change", handleFileUpload);

searchInput.addEventListener("input", renderMoments);
filterCategory.addEventListener("change", renderMoments);

viewerCloseBtn.addEventListener("click", closeViewer);
viewerNextBtn.addEventListener("click", showNextMoment);
viewerPrevBtn.addEventListener("click", showPreviousMoment);

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) closeViewer();
});

assistantScenario.addEventListener("change", updateAssistant);

auroraChecks.forEach((check) => {
  check.addEventListener("change", updateAuroraReadiness);
});

floatingAddBtn.addEventListener("click", () => {
  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });

  titleInput.focus();
});

clearDataBtn.addEventListener("click", clearAllMoments);

document.addEventListener("keydown", (event) => {
  if (!photoViewer.classList.contains("active")) return;

  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowRight") showNextMoment();
  if (event.key === "ArrowLeft") showPreviousMoment();
});

// =========================
// INIT
// =========================

async function initApp() {
  loadMoments();

  await renderMoments();

  updateStats();
  updateAssistant();
  updateAuroraReadiness();

  setupPresets();
  setupNavigation();
  setupSwipeGestures();
}

initApp();
