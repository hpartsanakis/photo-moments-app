// =========================
// STATE
// =========================

let moments = [];
let editingMomentId = null;
let currentViewerIndex = 0;
let currentImageIndex = 0;
let currentView = "gallery";

let selectedImageFiles = [];
let exifDetected = false;

const STORAGE_KEY = "photo-moments-app-data";

// =========================
// SELECTORS
// =========================

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

const exifStatus = document.getElementById("exif-status");
const settingsStatus = document.getElementById("settings-status");
const metadataScore = document.getElementById("metadata-score");
const missingFields = document.getElementById("missing-fields");

const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImageBtn = document.getElementById("remove-image-btn");

const clearSettingsBtn = document.getElementById("clear-settings-btn");
const forcePresetBtn = document.getElementById("force-preset-btn");

const galleryTitle = document.getElementById("gallery-title");
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

const totalStat = document.getElementById("total-stat");
const favoriteStat = document.getElementById("favorite-stat");
const categoryStat = document.getElementById("category-stat");
const norwayStat = document.getElementById("norway-stat");

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

const assistantScenario = document.getElementById("assistant-scenario");
const assistantOutput = document.getElementById("assistant-output");
const lensAdvice = document.getElementById("lens-advice");
const weatherAdvice = document.getElementById("weather-advice");

const clearDataBtn = document.getElementById("clear-data-btn");
const navItems = document.querySelectorAll(".nav-item");
const floatingAddBtn = document.getElementById("floating-add-btn");

// ANALYTICS

const analyticsCamera = document.getElementById("analytics-camera");
const analyticsLens = document.getElementById("analytics-lens");
const analyticsCategory = document.getElementById("analytics-category");
const analyticsISO = document.getElementById("analytics-iso");
const analyticsPhotos = document.getElementById("analytics-photos");
const analyticsMoments = document.getElementById("analytics-moments");
const lensChart = document.getElementById("lens-chart");

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
    notes: "Neon lights • Moody shadows • Watch highlights.",
  },

  bluehour: {
    category: "Blue Hour",
    camera: "Nikon Z50",
    lens: "DX 12-28mm",
    aperture: "f/8",
    shutter: "6s",
    iso: "100",
    wb: "3800K",
    notes: "Tripod • Reflection shots • Protect highlights.",
  },

  husky: {
    category: "Husky",
    camera: "Nikon Z50",
    lens: "DX 50-250mm",
    aperture: "f/5.6",
    shutter: "1/1000s",
    iso: "Auto",
    wb: "Cloudy",
    notes: "AF-C • Burst mode • Focus on eyes.",
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
    thumbnail:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: null,
        storage: "url",
        src: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
      },
    ],
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
// IMAGE HELPERS
// =========================

async function getImageSrc(imageItem) {
  if (!imageItem) return "";

  if (imageItem.storage === "indexeddb") {
    const imageRecord = await getImageFromDB(imageItem.id);

    if (!imageRecord) return "";

    return URL.createObjectURL(imageRecord.file);
  }

  return imageItem.src;
}

async function getMomentThumbnail(moment) {
  if (moment.thumbnail) return moment.thumbnail;

  const firstImage = moment.images?.[0];

  return await getImageSrc(firstImage);
}

// =========================
// EXIF
// =========================

async function handleFileUpload() {
  const files = [...fileInput.files];

  if (files.length === 0) return;

  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    alert("Please choose image files.");
    selectedImageFiles = [];
    fileInput.value = "";
    return;
  }

  selectedImageFiles = imageFiles;
  imageInput.value = "";

  previewImage.src = URL.createObjectURL(selectedImageFiles[0]);
  imagePreview.classList.remove("hidden");

  exifStatus.textContent = "Reading EXIF from first image...";
  exifStatus.className = "exif-status warning";

  await autofillExifFromFile(selectedImageFiles[0]);

  updateMetadataScore();
  updateMissingFields();
}

async function autofillExifFromFile(file) {
  if (typeof exifr === "undefined") {
    exifStatus.textContent = "EXIF library not loaded.";
    exifStatus.className = "exif-status warning";
    return;
  }

  try {
    const exif = await exifr.parse(file);

    if (!exif) {
      exifStatus.textContent = "No EXIF metadata found.";
      exifStatus.className = "exif-status warning";
      return;
    }

    exifDetected = true;

    if (exif.Model) cameraInput.value = exif.Model;
    if (exif.LensModel) lensInput.value = exif.LensModel;
    if (exif.FNumber) apertureInput.value = `f/${exif.FNumber}`;
    if (exif.ExposureTime)
      shutterInput.value = formatShutter(exif.ExposureTime);
    if (exif.ISO) isoInput.value = String(exif.ISO);

    if (exif.DateTimeOriginal) {
      dateInput.value = new Date(exif.DateTimeOriginal)
        .toISOString()
        .split("T")[0];
    }

    exifStatus.textContent = "EXIF metadata loaded.";
    exifStatus.className = "exif-status success";

    updateSettingsStatus("exif");
  } catch (error) {
    console.warn("EXIF error:", error);

    exifStatus.textContent = "Could not read EXIF.";
    exifStatus.className = "exif-status warning";
  }
}

// =========================
// PRESETS
// =========================

function getPresetNameFromCategory(category) {
  return category.toLowerCase().replaceAll(" ", "");
}

function applyPreset(presetName) {
  const preset = presetLibrary[presetName];

  if (!preset) return;

  categoryInput.value = preset.category;

  if (!cameraInput.value) cameraInput.value = preset.camera;
  if (!lensInput.value) lensInput.value = preset.lens;
  if (!apertureInput.value) apertureInput.value = preset.aperture;
  if (!shutterInput.value) shutterInput.value = preset.shutter;
  if (!isoInput.value) isoInput.value = preset.iso;
  if (!wbInput.value) wbInput.value = preset.wb;
  if (!notesInput.value) notesInput.value = preset.notes;

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
// STATUS
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

  submitBtn.textContent = editingMomentId ? "Update Moment" : "Add Moment";
  submitBtn.classList.remove("ready");

  if (score >= 80) {
    submitBtn.textContent = editingMomentId
      ? "Update Moment ✓"
      : "Add Moment ✓";
    submitBtn.classList.add("ready");
  }
}

function updateMissingFields() {
  const missing = [];

  if (!titleInput.value.trim()) missing.push("title");

  if (
    selectedImageFiles.length === 0 &&
    !imageInput.value.trim() &&
    !editingMomentId
  ) {
    missing.push("image");
  }

  if (!cameraInput.value.trim()) missing.push("camera");
  if (!lensInput.value.trim()) missing.push("lens");

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

  if (!titleInput.value.trim()) missing.push("Title");

  if (
    selectedImageFiles.length === 0 &&
    !imageInput.value.trim() &&
    !editingMomentId
  ) {
    missing.push("Image");
  }

  if (!cameraInput.value.trim()) missing.push("Camera");
  if (!lensInput.value.trim()) missing.push("Lens");

  if (missing.length > 0) {
    alert(`Please complete: ${missing.join(", ")}`);
    return false;
  }

  return true;
}

// =========================
// FORM ACTIONS
// =========================

function resetForm() {
  momentForm.reset();

  editingMomentId = null;
  selectedImageFiles = [];
  exifDetected = false;

  formTitle.textContent = "Add New Moment";
  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");

  previewImage.src = "";
  imagePreview.classList.add("hidden");

  exifStatus.textContent = "No photo selected yet.";
  exifStatus.className = "exif-status";

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

function removeSelectedImage() {
  selectedImageFiles = [];

  fileInput.value = "";
  imageInput.value = "";

  previewImage.src = "";
  imagePreview.classList.add("hidden");

  updateMissingFields();
}

// =========================
// SAVE / UPDATE MOMENT
// =========================

async function addOrUpdateMoment(event) {
  event.preventDefault();

  if (!validateMomentBeforeSave()) return;

  const momentId = editingMomentId || crypto.randomUUID();

  let images = [];
  let thumbnail = "";

  if (selectedImageFiles.length > 0) {
    for (let index = 0; index < selectedImageFiles.length; index++) {
      const file = selectedImageFiles[index];
      const imageId = `${momentId}-${index}`;

      await saveImageToDB(imageId, file);

      images.push({
        id: imageId,
        storage: "indexeddb",
        src: "",
      });
    }

    thumbnail = await getImageSrc(images[0]);
  } else if (imageInput.value.trim()) {
    images = [
      {
        id: null,
        storage: "url",
        src: imageInput.value.trim(),
      },
    ];

    thumbnail = imageInput.value.trim();
  } else if (editingMomentId) {
    const existingMoment = moments.find(
      (moment) => moment.id === editingMomentId,
    );

    images = existingMoment.images || [];
    thumbnail = existingMoment.thumbnail || "";
  }

  const momentData = {
    id: momentId,
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    trip: tripInput.value.trim() || "General Collection",
    date: dateInput.value || new Date().toISOString().split("T")[0],
    thumbnail,
    images,
    category: categoryInput.value,
    camera: cameraInput.value.trim(),
    lens: lensInput.value.trim(),
    aperture: apertureInput.value.trim(),
    shutter: shutterInput.value.trim(),
    iso: isoInput.value.trim(),
    wb: wbInput.value.trim(),
    notes: notesInput.value.trim(),
  };

  if (editingMomentId) {
    moments = moments.map((moment) =>
      moment.id === editingMomentId
        ? {
            ...moment,
            ...momentData,
            favorite: moment.favorite,
          }
        : moment,
    );
  } else {
    moments.unshift({
      ...momentData,
      favorite: false,
    });
  }

  saveMoments();

  await renderMoments();

  updateStats();
  resetForm();
}

// =========================
// RENDER GALLERY
// =========================

function getFilteredMoments() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  return moments.filter((moment) => {
    const matchesView = currentView === "favorites" ? moment.favorite : true;

    const searchableText = `
      ${moment.title}
      ${moment.location}
      ${moment.trip}
      ${moment.category}
      ${moment.camera}
      ${moment.lens}
      ${moment.notes}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      moment.category.toLowerCase() === selectedCategory;

    return matchesView && matchesSearch && matchesCategory;
  });
}

async function renderMoments() {
  galleryGrid.innerHTML = "";

  const filteredMoments = getFilteredMoments();

  filteredMoments.sort((a, b) => new Date(b.date) - new Date(a.date));

  galleryTitle.textContent =
    currentView === "favorites" ? "Favorites" : "Gallery";

  const label = filteredMoments.length === 1 ? "moment" : "moments";
  momentCount.textContent = `${filteredMoments.length} ${label}`;

  emptyState.classList.toggle("hidden", filteredMoments.length !== 0);

  for (const moment of filteredMoments) {
    const card = document.createElement("article");
    card.className = "photo-card";

    const thumbnailSrc = await getMomentThumbnail(moment);
    const imageCount = moment.images?.length || 1;

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

      <img src="${thumbnailSrc}" alt="${moment.title}" />

      <div class="card-overlay"></div>

      <div class="card-content">
        <span class="trip-badge">${moment.trip || "General Collection"}</span>
        <br />
        <span class="category-badge">${moment.category}</span>

        <p class="card-location">${moment.location || "Unknown location"}</p>
        <p class="card-date">${formatDate(moment.date)}</p>

        <h3 class="card-title">${moment.title}</h3>
        <p class="card-meta">${moment.lens} • ${imageCount} photo(s)</p>
      </div>
    `;

    card.addEventListener("click", () => {
      openPhotoViewer(moment.id);
    });

    card
      .querySelector(".favorite-btn")
      .addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleFavorite(moment.id);
      });

    card.querySelector(".edit-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      editMoment(moment.id);
    });

    card
      .querySelector(".delete-btn")
      .addEventListener("click", async (event) => {
        event.stopPropagation();
        await deleteMoment(moment.id);
      });

    galleryGrid.appendChild(card);
  }
}

// =========================
// FAVORITE / EDIT / DELETE
// =========================

async function toggleFavorite(id) {
  moments = moments.map((moment) =>
    moment.id === id ? { ...moment, favorite: !moment.favorite } : moment,
  );

  saveMoments();
  await renderMoments();
  updateStats();
}

function editMoment(id) {
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

  imageInput.value = "";

  categoryInput.value = moment.category || "Aurora";
  cameraInput.value = moment.camera || "";
  lensInput.value = moment.lens || "";
  apertureInput.value = moment.aperture || "";
  shutterInput.value = moment.shutter || "";
  isoInput.value = moment.iso || "";
  wbInput.value = moment.wb || "";
  notesInput.value = moment.notes || "";

  previewImage.src = moment.thumbnail || "";
  imagePreview.classList.remove("hidden");

  updateMetadataScore();
  updateMissingFields();

  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });
}

async function deleteMoment(id) {
  if (!confirm("Delete this moment?")) return;

  const momentToDelete = moments.find((moment) => moment.id === id);

  if (momentToDelete?.images) {
    for (const image of momentToDelete.images) {
      if (image.storage === "indexeddb") {
        await deleteImageFromDB(image.id);
      }
    }
  }

  moments = moments.filter((moment) => moment.id !== id);

  saveMoments();
  await renderMoments();
  updateStats();
  updateLensChart();
}

// =========================
// VIEWER
// =========================

async function openPhotoViewer(id) {
  currentViewerIndex = moments.findIndex((moment) => moment.id === id);
  currentImageIndex = 0;

  await updateViewerContent();

  photoViewer.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePhotoViewer() {
  photoViewer.classList.remove("active");
  document.body.style.overflow = "auto";
}

async function updateViewerContent() {
  const moment = moments[currentViewerIndex];

  if (!moment) return;

  const imageItem = moment.images?.[currentImageIndex] || moment.images?.[0];
  const imageSrc = await getImageSrc(imageItem);

  viewerImage.src = imageSrc;
  viewerTitle.textContent = moment.title;
  viewerCategory.textContent = moment.category;
  viewerLocation.textContent = `${moment.location} • ${formatDate(moment.date)}`;

  viewerMeta.textContent = `${moment.camera} • ${moment.lens} • ${moment.aperture} • ${moment.shutter} • ISO ${moment.iso} • WB ${moment.wb}`;

  viewerNotes.textContent = `${moment.notes || "No notes."} | Photo ${currentImageIndex + 1} of ${moment.images.length}`;
}

async function showNextMoment() {
  const moment = moments[currentViewerIndex];

  if (!moment) return;

  currentImageIndex++;

  if (currentImageIndex >= moment.images.length) {
    currentImageIndex = 0;
  }

  await updateViewerContent();
}

async function showPreviousMoment() {
  const moment = moments[currentViewerIndex];

  if (!moment) return;

  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = moment.images.length - 1;
  }

  await updateViewerContent();
}

// =========================
// STATS
// =========================

function updateStats() {
  totalStat.textContent = moments.length;

  favoriteStat.textContent = moments.filter((moment) => moment.favorite).length;

  categoryStat.textContent = new Set(
    moments.map((moment) => moment.category),
  ).size;

  norwayStat.textContent = moments.filter((moment) =>
    (moment.location || "").toLowerCase().includes("norway"),
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
  lensAdvice.textContent = "Recommended lens depends on the selected scenario.";
  weatherAdvice.textContent = "Weather changes exposure dramatically.";
}

function updateAnalytics() {
  analyticsMoments.textContent = moments.length;

  // =========================
  // TOTAL PHOTOS
  // =========================

  let totalPhotos = 0;

  moments.forEach((moment) => {
    totalPhotos += moment.images?.length || 1;
  });

  analyticsPhotos.textContent = totalPhotos;

  // =========================
  // CAMERA
  // =========================

  const cameras = moments.map((moment) => moment.camera);

  analyticsCamera.textContent = getMostUsed(cameras);

  // =========================
  // LENS
  // =========================

  const lenses = moments.map((moment) => moment.lens);

  analyticsLens.textContent = getMostUsed(lenses);

  // =========================
  // CATEGORY
  // =========================

  const categories = moments.map((moment) => moment.category);

  analyticsCategory.textContent = getMostUsed(categories);

  // =========================
  // ISO
  // =========================

  const isoValues = moments
    .map((moment) => parseInt(moment.iso))
    .filter((value) => !isNaN(value));

  if (isoValues.length > 0) {
    const totalISO = isoValues.reduce((sum, value) => sum + value, 0);

    const averageISO = Math.round(totalISO / isoValues.length);

    analyticsISO.textContent = averageISO;
  } else {
    analyticsISO.textContent = "-";
  }
}
// =========================
// SETTINGS
// =========================

function clearAllMoments() {
  if (!confirm("Delete ALL moments?")) return;

  moments = [];
  localStorage.removeItem(STORAGE_KEY);

  renderMoments();
  updateStats();
}

function updateLensChart() {
  lensChart.innerHTML = "";

  const lensCounts = {};

  moments.forEach((moment) => {
    if (!moment.lens) return;

    lensCounts[moment.lens] = (lensCounts[moment.lens] || 0) + 1;
  });

  const entries = Object.entries(lensCounts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    lensChart.innerHTML = `<p class="card-meta">No lens data yet.</p>`;
    return;
  }

  const maxCount = entries[0][1];

  entries.forEach(([lens, count]) => {
    const percent = Math.round((count / maxCount) * 100);

    const row = document.createElement("div");
    row.className = "lens-bar-row";

    row.innerHTML = `
      <div class="lens-bar-label">
        <span>${lens}</span>
        <strong>${count}</strong>
      </div>

      <div class="lens-bar-track">
        <div class="lens-bar-fill" style="width: ${percent}%"></div>
      </div>
    `;

    lensChart.appendChild(row);
  });
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
      if (tab === "analytics") {
        document.getElementById("analytics-section").scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
}

// =========================
// EVENTS
// =========================

momentForm.addEventListener("submit", addOrUpdateMoment);
cancelEditBtn.addEventListener("click", resetForm);

fileInput.addEventListener("change", handleFileUpload);

imageInput.addEventListener("input", () => {
  if (!imageInput.value.trim()) return;

  selectedImageFiles = [];
  fileInput.value = "";

  previewImage.src = imageInput.value.trim();
  imagePreview.classList.remove("hidden");

  updateMissingFields();
});

removeImageBtn.addEventListener("click", removeSelectedImage);

categoryInput.addEventListener("change", () => {
  const presetName = getPresetNameFromCategory(categoryInput.value);
  applyPreset(presetName);
});

clearSettingsBtn.addEventListener("click", clearCameraSettings);
forcePresetBtn.addEventListener("click", forceApplyCurrentPreset);

searchInput.addEventListener("input", renderMoments);
filterCategory.addEventListener("change", renderMoments);

viewerCloseBtn.addEventListener("click", closePhotoViewer);
viewerNextBtn.addEventListener("click", showNextMoment);
viewerPrevBtn.addEventListener("click", showPreviousMoment);

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) {
    closePhotoViewer();
  }
});

assistantScenario.addEventListener("change", updateAssistant);

clearDataBtn.addEventListener("click", clearAllMoments);

floatingAddBtn.addEventListener("click", () => {
  document.getElementById("add-section").scrollIntoView({
    behavior: "smooth",
  });

  titleInput.focus();
});

document.addEventListener("keydown", (event) => {
  if (!photoViewer.classList.contains("active")) return;

  if (event.key === "Escape") closePhotoViewer();
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
  updateSettingsStatus("manual");
  updateMetadataScore();
  updateMissingFields();
  updateAnalytics();
  updateLensChart();
  setupNavigation();
  setupManualSettingsDetection();
}

initApp();

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

  if (value >= 1) return `${value}s`;

  return `1/${Math.round(1 / value)}s`;
}
function getMostUsed(items) {
  if (items.length === 0) {
    return "-";
  }

  const counts = {};

  items.forEach((item) => {
    if (!item) return;

    counts[item] = (counts[item] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}
