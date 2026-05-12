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
  if (moment.images && moment.images.length > 0) {
    return await getImageSrc(moment.images[0]);
  }

  if (moment.thumbnail && moment.thumbnail.startsWith("http")) {
    return moment.thumbnail;
  }

  return "";
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

    thumbnail = images[0].id;
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

// =========================
// SETTINGS
// =========================

function clearAllMoments() {
  if (!confirm("Delete ALL moments?")) return;

  moments = [];
  clearStoredMoments();

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
  refreshAnalytics();
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
