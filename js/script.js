// =========================
// STATE
// =========================

let moments = [];

let editingMomentId = null;

let currentViewerIndex = 0;

let selectedImageFile = null;

let exifDetected = false;

let deferredPrompt;

let compactView = false;

// =========================
// STORAGE
// =========================

const STORAGE_KEY = "photo-moments-app-data";

// =========================
// SELECTORS
// =========================

// FORM

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

// STATUS

const exifStatus = document.getElementById("exif-status");

const settingsStatus = document.getElementById("settings-status");

const metadataScore = document.getElementById("metadata-score");

const missingFields = document.getElementById("missing-fields");

// IMAGE PREVIEW

const imagePreview = document.getElementById("image-preview");

const previewImage = document.getElementById("preview-image");

const removeImageBtn = document.getElementById("remove-image-btn");

// SETTINGS ACTIONS

const clearSettingsBtn = document.getElementById("clear-settings-btn");

const forcePresetBtn = document.getElementById("force-preset-btn");

// GALLERY

const galleryGrid = document.getElementById("gallery-grid");

const momentCount = document.getElementById("moment-count");

const searchInput = document.getElementById("search-input");

const filterCategory = document.getElementById("filter-category");

const emptyState = document.getElementById("empty-state");

const sortSelect = document.getElementById("sort-select");

// STATS

const totalStat = document.getElementById("total-stat");

const favoriteStat = document.getElementById("favorite-stat");

const categoryStat = document.getElementById("category-stat");

const norwayStat = document.getElementById("norway-stat");

// VIEWER

const photoViewer = document.getElementById("photo-viewer");

const viewerImage = document.getElementById("viewer-image");

const viewerTitle = document.getElementById("viewer-title");

const viewerCategory = document.getElementById("viewer-category");

const viewerLocation = document.getElementById("viewer-location");

const viewerMeta = document.getElementById("viewer-meta");

const viewerNotes = document.getElementById("viewer-notes");

const viewerCloseBtn = document.getElementById("viewer-close-btn");

const viewerPrevBtn = document.getElementById("viewer-prev-btn");

const viewerNextBtn = document.getElementById("viewer-next-btn");

// ASSISTANT

const assistantScenario = document.getElementById("assistant-scenario");

const assistantOutput = document.getElementById("assistant-output");

const lensAdvice = document.getElementById("lens-advice");

const weatherAdvice = document.getElementById("weather-advice");

// SETTINGS

const clearDataBtn = document.getElementById("clear-data-btn");

// NAVIGATION

const navItems = document.querySelectorAll(".nav-item");

const floatingAddBtn = document.getElementById("floating-add-btn");

// =========================
// PRESET LIBRARY
// =========================

const presetLibrary = {
  aurora: {
    category: "Aurora",
    camera: "Nikon Z50",
    lens: "Viltrox 13mm f/1.4",
    aperture: "f/1.8",
    shutter: "1s",
    iso: "1600",
    wb: "4000K",
    notes: "Tripod • Manual Focus • RAW",
  },

  snow: {
    category: "Snow",
    camera: "Nikon Z50",
    lens: "DX 16-50mm",
    aperture: "f/5.6",
    shutter: "1/250s",
    iso: "Auto",
    wb: "Cloudy",
    notes: "Protect highlights in snow.",
  },

  rain: {
    category: "Rain",
    camera: "Nikon Z50",
    lens: "DX 16-50mm",
    aperture: "f/5.6",
    shutter: "1/250s",
    iso: "Auto",
    wb: "Cloudy",
    notes: "Use reflections and wet streets.",
  },

  streetnight: {
    category: "Street Night",
    camera: "Nikon Z50",
    lens: "DX 16-50mm",
    aperture: "f/2.8",
    shutter: "1/125s",
    iso: "3200",
    wb: "3800K",
    notes: "Neon lights • Moody shadows",
  },

  bluehour: {
    category: "Blue Hour",
    camera: "Nikon Z50",
    lens: "DX 12-28mm",
    aperture: "f/8",
    shutter: "6s",
    iso: "100",
    wb: "3800K",
    notes: "Tripod • Reflection shots",
  },

  husky: {
    category: "Husky",
    camera: "Nikon Z50",
    lens: "DX 50-250mm",
    aperture: "f/5.6",
    shutter: "1/1000s",
    iso: "Auto",
    wb: "Cloudy",
    notes: "AF-C • Burst mode",
  },
};

// =========================
// SAMPLE DATA
// =========================

const sampleMoments = [
  {
    id: crypto.randomUUID(),

    title: "Aurora over Tromsø",

    location: "Tromsø • Norway",

    trip: "Aurora Expedition",

    date: "2026-02-12",

    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",

    category: "Aurora",

    camera: "Nikon Z50",

    lens: "Viltrox 13mm f/1.4",

    aperture: "f/1.8",

    shutter: "1s",

    iso: "1600",

    wb: "4000K",

    notes: "Tripod • RAW",

    favorite: true,
  },
];

// =========================
// STORAGE
// =========================

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

// =========================
// HELPERS
// =========================

function formatDate(dateString) {
  if (!dateString) return "Unknown";

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

function getPresetNameFromCategory(category) {
  return category.toLowerCase().replaceAll(" ", "");
}

// =========================
// PRESET SYSTEM
// =========================

function applyPreset(presetName) {
  const preset = presetLibrary[presetName];

  if (!preset) return;

  categoryInput.value = preset.category;

  if (!cameraInput.value) {
    cameraInput.value = preset.camera;
  }

  if (!lensInput.value) {
    lensInput.value = preset.lens;
  }

  if (!apertureInput.value) {
    apertureInput.value = preset.aperture;
  }

  if (!shutterInput.value) {
    shutterInput.value = preset.shutter;
  }

  if (!isoInput.value) {
    isoInput.value = preset.iso;
  }

  if (!wbInput.value) {
    wbInput.value = preset.wb;
  }

  if (!notesInput.value) {
    notesInput.value = preset.notes;
  }

  updateSettingsStatus("preset");

  updateMetadataScore();

  updateMissingFields();
}

function forceApplyCurrentPreset() {
  const presetName = getPresetNameFromCategory(categoryInput.value);

  const preset = presetLibrary[presetName];

  if (!preset) return;

  cameraInput.value = preset.camera;

  lensInput.value = preset.lens;

  apertureInput.value = preset.aperture;

  shutterInput.value = preset.shutter;

  isoInput.value = preset.iso;

  wbInput.value = preset.wb;

  notesInput.value = preset.notes;

  exifDetected = false;

  updateSettingsStatus("preset");

  updateMetadataScore();

  updateMissingFields();
}

// =========================
// EXIF
// =========================

async function handleFileUpload() {
  const file = fileInput.files[0];

  if (!file) return;

  selectedImageFile = file;

  previewImage.src = URL.createObjectURL(file);

  imagePreview.classList.remove("hidden");

  exifStatus.textContent = "Reading EXIF metadata...";

  exifStatus.className = "exif-status warning";

  await autofillExifFromFile(file);

  updateMissingFields();
}

async function autofillExifFromFile(file) {
  if (typeof exifr === "undefined") {
    return;
  }

  try {
    const exif = await exifr.parse(file);

    exifDetected = true;

    if (!exif) {
      exifStatus.textContent = "No EXIF metadata found.";

      return;
    }

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

    exifStatus.textContent = "EXIF metadata loaded.";

    exifStatus.className = "exif-status success";

    updateSettingsStatus("exif");

    updateMetadataScore();

    updateMissingFields();
  } catch (error) {
    console.warn(error);

    exifStatus.textContent = "Could not read EXIF.";

    exifStatus.className = "exif-status warning";
  }
}

// =========================
// STATUS SYSTEM
// =========================

function updateSettingsStatus(type) {
  settingsStatus.className = "settings-status";

  if (type === "exif") {
    settingsStatus.textContent = "EXIF detected";

    settingsStatus.classList.add("exif");
  }

  if (type === "preset") {
    settingsStatus.textContent = "Preset applied";

    settingsStatus.classList.add("preset");
  }

  if (type === "manual") {
    settingsStatus.textContent = "Manual settings";

    settingsStatus.classList.add("manual");
  }
}

function updateMetadataScore() {
  const fields = [
    titleInput.value,

    locationInput.value,

    tripInput.value,

    dateInput.value,

    categoryInput.value,

    cameraInput.value,

    lensInput.value,

    apertureInput.value,

    shutterInput.value,

    isoInput.value,

    wbInput.value,

    notesInput.value,
  ];

  const filledFields = fields.filter((field) => field && field.trim() !== "");

  const score = Math.round((filledFields.length / fields.length) * 100);

  metadataScore.className = "metadata-score";

  if (score < 50) {
    metadataScore.classList.add("weak");
  } else if (score < 80) {
    metadataScore.classList.add("good");
  } else {
    metadataScore.classList.add("excellent");
  }

  metadataScore.textContent = `Metadata: ${score}% complete`;

  if (score >= 80) {
    submitBtn.textContent = editingMomentId
      ? "Update Moment ✓"
      : "Add Moment ✓";

    submitBtn.classList.add("ready");
  } else {
    submitBtn.textContent = editingMomentId ? "Update Moment" : "Add Moment";

    submitBtn.classList.remove("ready");
  }
}

function updateMissingFields() {
  const missing = [];

  if (!titleInput.value.trim()) {
    missing.push("title");
  }

  if (!selectedImageFile && !imageInput.value.trim() && !editingMomentId) {
    missing.push("image");
  }

  if (!cameraInput.value.trim()) {
    missing.push("camera");
  }

  if (!lensInput.value.trim()) {
    missing.push("lens");
  }

  if (missing.length === 0) {
    missingFields.textContent = "Ready to save.";

    missingFields.classList.add("ready");
  } else {
    missingFields.textContent = `Missing: ${missing.join(", ")}`;

    missingFields.classList.remove("ready");
  }
}

// =========================
// VALIDATION
// =========================

function validateMomentBeforeSave() {
  const missing = [];

  if (!titleInput.value.trim()) {
    missing.push("Title");
  }

  if (!selectedImageFile && !imageInput.value.trim() && !editingMomentId) {
    missing.push("Image");
  }

  if (!cameraInput.value.trim()) {
    missing.push("Camera");
  }

  if (!lensInput.value.trim()) {
    missing.push("Lens");
  }

  if (missing.length > 0) {
    alert(`Please complete: ${missing.join(", ")}`);

    return false;
  }

  return true;
}

// =========================
// FORM
// =========================

function resetForm() {
  momentForm.reset();

  editingMomentId = null;

  selectedImageFile = null;

  exifDetected = false;

  formTitle.textContent = "Add New Moment";

  submitBtn.textContent = "Add Moment";

  cancelEditBtn.classList.add("hidden");

  previewImage.src = "";

  imagePreview.classList.add("hidden");

  updateSettingsStatus("manual");

  updateMetadataScore();

  updateMissingFields();
}

function clearCameraSettings() {
  exifDetected = false;

  cameraInput.value = "";

  lensInput.value = "";

  apertureInput.value = "";

  shutterInput.value = "";

  isoInput.value = "";

  wbInput.value = "";

  notesInput.value = "";

  updateSettingsStatus("manual");

  updateMetadataScore();

  updateMissingFields();
}

// =========================
// SAVE
// =========================

function addOrUpdateMoment(event) {
  event.preventDefault();

  if (!validateMomentBeforeSave()) {
    return;
  }

  let imageSource = imageInput.value.trim();

  if (selectedImageFile) {
    imageSource = previewImage.src;
  }

  const momentData = {
    id: editingMomentId || crypto.randomUUID(),

    title: titleInput.value.trim(),

    location: locationInput.value.trim(),

    trip: tripInput.value.trim(),

    date: dateInput.value || new Date().toISOString().split("T")[0],

    image: imageSource,

    category: categoryInput.value,

    camera: cameraInput.value.trim(),

    lens: lensInput.value.trim(),

    aperture: apertureInput.value.trim(),

    shutter: shutterInput.value.trim(),

    iso: isoInput.value.trim(),

    wb: wbInput.value.trim(),

    notes: notesInput.value.trim(),

    favorite: false,
  };

  if (editingMomentId) {
    moments = moments.map((moment) =>
      moment.id === editingMomentId
        ? {
            ...moment,
            ...momentData,
          }
        : moment,
    );
  } else {
    moments.unshift(momentData);
  }

  saveMoments();

  renderMoments();

  updateStats();

  resetForm();
}

function toggleGalleryView() {
  compactView = !compactView;

  galleryGrid.classList.toggle("compact-view", compactView);

  viewToggleBtn.textContent = compactView ? "Grid View" : "Compact View";
}

// =========================
// RENDER
// =========================

function renderMoments() {
  galleryGrid.innerHTML = "";

  const searchTerm = searchInput.value.toLowerCase().trim();

  const selectedCategory = filterCategory.value;

  const filteredMoments = moments.filter((moment) => {
    const matchesSearch =
      moment.title.toLowerCase().includes(searchTerm) ||
      moment.location.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      moment.category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  momentCount.textContent = `${filteredMoments.length} moments`;

  if (filteredMoments.length === 0) {
    emptyState.classList.remove("hidden");

    return;
  }

  emptyState.classList.add("hidden");

  filteredMoments.forEach((moment) => {
    const card = document.createElement("article");

    card.className = "photo-card";

    card.innerHTML = `
        <button class="favorite-btn ${moment.favorite ? "active" : ""}">
          ★
        </button>

        <button class="edit-btn">
          ✎
        </button>

        <button class="delete-btn">
          🗑
        </button>

        <img
          src="${moment.image}"
          alt="${moment.title}"
        />

        <div class="card-overlay"></div>

        <div class="card-content">
          <span class="trip-badge">
            ${moment.trip || "General"}
          </span>

          <br />

          <span class="category-badge">
            ${moment.category}
          </span>

          <p class="card-location">
            ${moment.location}
          </p>

          <p class="card-date">
            ${formatDate(moment.date)}
          </p>

          <h3 class="card-title">
            ${moment.title}
          </h3>

          <p class="card-meta">
            ${moment.lens}
          </p>
        </div>
      `;
    if (sortSelect.value === "newest") {
      filteredMoments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sortSelect.value === "oldest") {
      filteredMoments.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (sortSelect.value === "favorites") {
      filteredMoments.sort((a, b) => Number(b.favorite) - Number(a.favorite));
    }

    if (sortSelect.value === "category") {
      filteredMoments.sort((a, b) => a.category.localeCompare(b.category));
    }
    // OPEN VIEWER

    card.addEventListener("click", () => {
      openPhotoViewer(moment.id);
    });

    // FAVORITE

    card.querySelector(".favorite-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      toggleFavorite(moment.id);
    });

    // EDIT

    card.querySelector(".edit-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      editMoment(moment.id);
    });

    // DELETE

    card.querySelector(".delete-btn").addEventListener("click", (event) => {
      event.stopPropagation();

      deleteMoment(moment.id);
    });

    galleryGrid.appendChild(card);
  });
}

// =========================
// FAVORITE
// =========================

function toggleFavorite(id) {
  moments = moments.map((moment) =>
    moment.id === id
      ? {
          ...moment,
          favorite: !moment.favorite,
        }
      : moment,
  );

  saveMoments();

  renderMoments();

  updateStats();
}

// =========================
// EDIT
// =========================

function editMoment(id) {
  const moment = moments.find((item) => item.id === id);

  if (!moment) return;

  editingMomentId = id;

  formTitle.textContent = "Edit Moment";

  titleInput.value = moment.title;

  locationInput.value = moment.location;

  tripInput.value = moment.trip;

  dateInput.value = moment.date;

  imageInput.value = moment.image;

  categoryInput.value = moment.category;

  cameraInput.value = moment.camera;

  lensInput.value = moment.lens;

  apertureInput.value = moment.aperture;

  shutterInput.value = moment.shutter;

  isoInput.value = moment.iso;

  wbInput.value = moment.wb;

  notesInput.value = moment.notes;

  previewImage.src = moment.image;

  imagePreview.classList.remove("hidden");

  cancelEditBtn.classList.remove("hidden");

  updateMetadataScore();

  updateMissingFields();

  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });
}

// =========================
// DELETE
// =========================

function deleteMoment(id) {
  const confirmed = confirm("Delete this moment?");

  if (!confirmed) return;

  moments = moments.filter((moment) => moment.id !== id);

  saveMoments();

  renderMoments();

  updateStats();
}

// =========================
// VIEWER
// =========================

function openPhotoViewer(id) {
  currentViewerIndex = moments.findIndex((moment) => moment.id === id);

  updateViewerContent();

  photoViewer.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closePhotoViewer() {
  photoViewer.classList.remove("active");

  document.body.style.overflow = "auto";
}

function updateViewerContent() {
  const moment = moments[currentViewerIndex];

  if (!moment) return;

  viewerImage.src = moment.image;

  viewerTitle.textContent = moment.title;

  viewerCategory.textContent = moment.category;

  viewerLocation.textContent = moment.location;

  viewerMeta.textContent = `${moment.camera} • ${moment.lens} • ${moment.aperture} • ${moment.shutter} • ISO ${moment.iso}`;

  viewerNotes.textContent = moment.notes;
}

function showNextMoment() {
  currentViewerIndex++;

  if (currentViewerIndex >= moments.length) {
    currentViewerIndex = 0;
  }

  updateViewerContent();
}

function showPreviousMoment() {
  currentViewerIndex--;

  if (currentViewerIndex < 0) {
    currentViewerIndex = moments.length - 1;
  }

  updateViewerContent();
}

// =========================
// STATS
// =========================

function updateStats() {
  totalStat.textContent = moments.length;

  favoriteStat.textContent = moments.filter((moment) => moment.favorite).length;

  const categories = new Set(moments.map((moment) => moment.category));

  categoryStat.textContent = categories.size;

  norwayStat.textContent = moments.filter((moment) =>
    moment.location.toLowerCase().includes("norway"),
  ).length;
}

// =========================
// ASSISTANT
// =========================

function updateAssistant() {
  const scenario = assistantScenario.value;

  const tips = {
    aurora: "Use tripod • ISO 1600 • 1s • Manual focus",

    bluehour: "Use tripod • ISO 100 • Long exposure",

    snow: "Watch highlights in snow",

    rain: "Use reflections and wet streets",

    husky: "Use AF-C and fast shutter",
  };

  assistantOutput.textContent = tips[scenario];

  lensAdvice.textContent = "Recommended lens depends on scenario.";

  weatherAdvice.textContent = "Weather changes exposure dramatically.";
}

// =========================
// SETTINGS
// =========================

function clearAllMoments() {
  const confirmed = confirm("Delete ALL moments?");

  if (!confirmed) return;

  moments = [];

  saveMoments();

  renderMoments();

  updateStats();
}

// =========================
// MANUAL DETECTION
// =========================

function setupManualSettingsDetection() {
  const fields = [
    titleInput,

    locationInput,

    tripInput,

    dateInput,

    categoryInput,

    cameraInput,

    lensInput,

    apertureInput,

    shutterInput,

    isoInput,

    wbInput,

    notesInput,
  ];

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      updateSettingsStatus("manual");

      updateMetadataScore();

      updateMissingFields();
    });
  });
}

// =========================
// IMAGE REMOVE
// =========================

function removeSelectedImage() {
  selectedImageFile = null;

  fileInput.value = "";

  imageInput.value = "";

  previewImage.src = "";

  imagePreview.classList.add("hidden");

  updateMissingFields();
}

// =========================
// NAVIGATION
// =========================

function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((btn) => btn.classList.remove("active"));

      item.classList.add("active");

      const tab = item.dataset.tab;

      if (tab === "gallery") {
        document.getElementById("gallery-section").scrollIntoView({
          behavior: "smooth",
        });
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

      if (tab === "add") {
        document.getElementById("add-section").scrollIntoView({
          behavior: "smooth",
        });
      }

      if (tab === "favorites") {
        filterCategory.value = "all";

        searchInput.value = "";

        renderMoments();

        galleryGrid.innerHTML = "";

        const favorites = moments.filter((moment) => moment.favorite);

        favorites.forEach((moment) => {
          const card = document.createElement("article");

          card.className = "photo-card";

          card.innerHTML = `
                <img
                  src="${moment.image}"
                />
              `;

          galleryGrid.appendChild(card);
        });

        document.getElementById("gallery-section").scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
}

// =========================
// EVENTS
// =========================
viewToggleBtn.addEventListener("click", toggleGalleryView);
// FORM

momentForm.addEventListener("submit", addOrUpdateMoment);

cancelEditBtn.addEventListener("click", resetForm);

// FILE

fileInput.addEventListener("change", handleFileUpload);

imageInput.addEventListener("input", () => {
  if (!imageInput.value.trim()) {
    return;
  }

  selectedImageFile = null;

  previewImage.src = imageInput.value.trim();

  imagePreview.classList.remove("hidden");

  updateMissingFields();
});

// CATEGORY

categoryInput.addEventListener("change", () => {
  const presetName = getPresetNameFromCategory(categoryInput.value);

  applyPreset(presetName);
});

// SETTINGS

clearSettingsBtn.addEventListener("click", clearCameraSettings);

forcePresetBtn.addEventListener("click", forceApplyCurrentPreset);

// IMAGE

removeImageBtn.addEventListener("click", removeSelectedImage);

// SEARCH

searchInput.addEventListener("input", renderMoments);

filterCategory.addEventListener("change", renderMoments);

// VIEWER

viewerCloseBtn.addEventListener("click", closePhotoViewer);

viewerNextBtn.addEventListener("click", showNextMoment);

viewerPrevBtn.addEventListener("click", showPreviousMoment);

// ASSISTANT

assistantScenario.addEventListener("change", updateAssistant);

// SETTINGS

clearDataBtn.addEventListener("click", clearAllMoments);

sortSelect.addEventListener("change", renderMoments);

// FLOATING BUTTON

floatingAddBtn.addEventListener("click", () => {
  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });
});

// KEYBOARD

document.addEventListener("keydown", (event) => {
  if (!photoViewer.classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") {
    closePhotoViewer();
  }

  if (event.key === "ArrowRight") {
    showNextMoment();
  }

  if (event.key === "ArrowLeft") {
    showPreviousMoment();
  }
});

// =========================
// PWA
// =========================

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();

  deferredPrompt = event;
});

// =========================
// INIT
// =========================

function initApp() {
  loadMoments();

  renderMoments();

  updateStats();

  updateAssistant();

  updateSettingsStatus("manual");

  updateMetadataScore();

  updateMissingFields();

  setupNavigation();

  setupManualSettingsDetection();
}

initApp();

// =========================
// SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
