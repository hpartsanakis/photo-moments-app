// =========================
// STATE
// =========================

let moments = [];
let editingMomentId = null;
let currentViewerIndex = 0;
let currentView = "gallery";
let selectedImageFiles = [];

const STORAGE_KEY = "photo-moments-app-data";

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
    notes: "Tripod • Manual focus • RAW",
    favorite: true,
  },
];

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

const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImageBtn = document.getElementById("remove-image-btn");

const galleryTitle = document.getElementById("gallery-title");
const galleryGrid = document.getElementById("gallery-grid");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

const clearDataBtn = document.getElementById("clear-data-btn");

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

const navItems = document.querySelectorAll(".nav-item");
const floatingAddBtn = document.getElementById("floating-add-btn");

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

  if (value >= 1) return `${value}s`;

  return `1/${Math.round(1 / value)}s`;
}

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

  return "";
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

  await autofillExifFromFile(selectedImageFiles[0]);
}

async function autofillExifFromFile(file) {
  if (typeof exifr === "undefined") return;

  try {
    const exif = await exifr.parse(file);

    if (!exif) return;

    if (exif.Model) cameraInput.value = exif.Model;
    if (exif.LensModel) lensInput.value = exif.LensModel;
    if (exif.FNumber) apertureInput.value = `f/${exif.FNumber}`;
    if (exif.ExposureTime) shutterInput.value = formatShutter(exif.ExposureTime);
    if (exif.ISO) isoInput.value = String(exif.ISO);

    if (exif.DateTimeOriginal) {
      dateInput.value = new Date(exif.DateTimeOriginal)
        .toISOString()
        .split("T")[0];
    }
  } catch (error) {
    console.warn("EXIF could not be read:", error);
  }
}

// =========================
// FORM
// =========================

function validateMomentBeforeSave() {
  if (!titleInput.value.trim()) {
    alert("Please add a title.");
    return false;
  }

  if (
    selectedImageFiles.length === 0 &&
    !imageInput.value.trim() &&
    !editingMomentId
  ) {
    alert("Please choose a photo or paste an image URL.");
    return false;
  }

  return true;
}

function resetForm() {
  momentForm.reset();

  editingMomentId = null;
  selectedImageFiles = [];

  formTitle.textContent = "Add New Moment";
  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");

  previewImage.src = "";
  imagePreview.classList.add("hidden");
}

function removeSelectedImage() {
  selectedImageFiles = [];
  fileInput.value = "";
  imageInput.value = "";
  previewImage.src = "";
  imagePreview.classList.add("hidden");
}

async function addOrUpdateMoment(event) {
  event.preventDefault();

  if (!validateMomentBeforeSave()) return;

  const momentId = editingMomentId || crypto.randomUUID();

  let images = [];

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
  } else if (imageInput.value.trim()) {
    images = [
      {
        id: null,
        storage: "url",
        src: imageInput.value.trim(),
      },
    ];
  } else if (editingMomentId) {
    const existingMoment = moments.find((moment) => moment.id === editingMomentId);
    images = existingMoment.images || [];
  }

  const momentData = {
    id: momentId,
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    trip: tripInput.value.trim() || "General Collection",
    date: dateInput.value || new Date().toISOString().split("T")[0],
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
  resetForm();
}

// =========================
// GALLERY
// =========================

function getFilteredMoments() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  return moments.filter((moment) => {
    const matchesView = currentView === "favorites" ? moment.favorite : true;

    const searchableText = `
      ${moment.title || ""}
      ${moment.location || ""}
      ${moment.trip || ""}
      ${moment.category || ""}
      ${moment.camera || ""}
      ${moment.lens || ""}
      ${moment.notes || ""}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      (moment.category || "").toLowerCase() === selectedCategory;

    return matchesView && matchesSearch && matchesCategory;
  });
}

async function renderMoments() {
  galleryGrid.innerHTML = "";

  const filteredMoments = getFilteredMoments();
  filteredMoments.sort((a, b) => new Date(b.date) - new Date(a.date));

  galleryTitle.textContent = currentView === "favorites" ? "Favorites" : "Gallery";
  emptyState.classList.toggle("hidden", filteredMoments.length !== 0);

  for (const moment of filteredMoments) {
    const card = document.createElement("article");
    card.className = "photo-card";

    const thumbnailSrc = await getMomentThumbnail(moment);
    const imageCount = moment.images?.length || 1;

    card.innerHTML = `
      <button class="favorite-btn ${moment.favorite ? "active" : ""}">★</button>
      <button class="edit-btn">✎</button>
      <button class="delete-btn">🗑</button>

      <img src="${thumbnailSrc}" alt="${moment.title}" />

      <div class="card-overlay"></div>

      <div class="card-content">
        <span class="trip-badge">${moment.trip || "General Collection"}</span>
        <br />
        <span class="category-badge">${moment.category}</span>

        <p class="card-location">${moment.location || "Unknown location"}</p>
        <p class="card-date">${formatDate(moment.date)}</p>

        <h3 class="card-title">${moment.title}</h3>
        <p class="card-meta">${moment.lens || "No lens"} • ${imageCount} photo(s)</p>
      </div>
    `;

    card.addEventListener("click", () => openPhotoViewer(moment.id));

    card.querySelector(".favorite-btn").addEventListener("click", async (event) => {
      event.stopPropagation();
      await toggleFavorite(moment.id);
    });

    card.querySelector(".edit-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      editMoment(moment.id);
    });

    card.querySelector(".delete-btn").addEventListener("click", async (event) => {
      event.stopPropagation();
      await deleteMoment(moment.id);
    });

    galleryGrid.appendChild(card);
  }
}

async function toggleFavorite(id) {
  moments = moments.map((moment) =>
    moment.id === id ? { ...moment, favorite: !moment.favorite } : moment,
  );

  saveMoments();
  await renderMoments();
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

  getMomentThumbnail(moment).then((src) => {
    previewImage.src = src;
    imagePreview.classList.remove("hidden");
  });

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
}

// =========================
// VIEWER
// =========================

async function openPhotoViewer(id) {
  currentViewerIndex = moments.findIndex((moment) => moment.id === id);

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

  const imageSrc = await getMomentThumbnail(moment);

  viewerImage.src = imageSrc;
  viewerImage.alt = moment.title || "";

  viewerTitle.textContent = moment.title || "";
  viewerCategory.textContent = moment.category || "";
  viewerLocation.textContent = `${moment.location || "Unknown location"} • ${formatDate(moment.date)}`;

  viewerMeta.textContent =
    `${moment.camera || ""} • ${moment.lens || ""} • ${moment.aperture || ""} • ${moment.shutter || ""} • ISO ${moment.iso || ""} • WB ${moment.wb || ""}`;

  viewerNotes.textContent = moment.notes || "No notes.";
}

async function showNextMoment() {
  currentViewerIndex++;

  if (currentViewerIndex >= moments.length) {
    currentViewerIndex = 0;
  }

  await updateViewerContent();
}

async function showPreviousMoment() {
  currentViewerIndex--;

  if (currentViewerIndex < 0) {
    currentViewerIndex = moments.length - 1;
  }

  await updateViewerContent();
}

// =========================
// SETTINGS / NAVIGATION
// =========================

async function clearAllMoments() {
  if (!confirm("Delete ALL moments?")) return;

  for (const moment of moments) {
    if (!moment.images) continue;

    for (const image of moment.images) {
      if (image.storage === "indexeddb") {
        await deleteImageFromDB(image.id);
      }
    }
  }

  moments = [];
  localStorage.removeItem(STORAGE_KEY);

  await renderMoments();
}

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

      if (tab === "settings") {
        document.getElementById("settings-section").scrollIntoView({
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
});

removeImageBtn.addEventListener("click", removeSelectedImage);

searchInput.addEventListener("input", renderMoments);
filterCategory.addEventListener("change", renderMoments);

clearDataBtn.addEventListener("click", clearAllMoments);

viewerCloseBtn.addEventListener("click", closePhotoViewer);

viewerNextBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  showNextMoment();
});

viewerPrevBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  showPreviousMoment();
});

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) {
    closePhotoViewer();
  }
});

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
  setupNavigation();
}

initApp();