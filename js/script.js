let moments = [];
let editingMomentId = null;
let currentViewerIndex = 0;
let currentView = "gallery";
let selectedImageData = "";
let touchStartX = 0;
let touchEndX = 0;

const STORAGE_KEY = "photo-moments-app-data";

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

const totalStat = document.getElementById("total-stat");
const favoriteStat = document.getElementById("favorite-stat");
const categoryStat = document.getElementById("category-stat");
const norwayStat = document.getElementById("norway-stat");

const assistantScenario = document.getElementById("assistant-scenario");
const assistantOutput = document.getElementById("assistant-output");
const lensAdvice = document.getElementById("lens-advice");
const weatherAdvice = document.getElementById("weather-advice");

const auroraChecks = document.querySelectorAll(".aurora-card input");
const auroraStatus = document.getElementById("aurora-status");

const galleryTitle = document.getElementById("gallery-title");
const galleryGrid = document.getElementById("gallery-grid");
const momentCount = document.getElementById("moment-count");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

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

const navItems = document.querySelectorAll(".nav-item");
const floatingAddBtn = document.getElementById("floating-add-btn");
const presetButtons = document.querySelectorAll(".preset-btn");
const clearDataBtn = document.getElementById("clear-data-btn");

const sampleMoments = [
  {
    id: crypto.randomUUID(),
    title: "Aurora over Tromsø Fjord",
    location: "Tromsø • Norway",
    trip: "Tromsø Aurora Expedition",
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

function saveMoments() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
  } catch (error) {
    alert(
      "Storage is full. Please delete some moments or use Image URLs instead of large local photos.",
    );

    console.error("Storage error:", error);
  }
}

function loadMoments() {
  const saved = localStorage.getItem(STORAGE_KEY);
  moments = saved ? JSON.parse(saved) : sampleMoments;
  saveMoments();
}

function getVisibleMoments() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  return [...moments]
    .filter((moment) => currentView !== "favorites" || moment.favorite)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((moment) => {
      const text = `
        ${moment.title}
        ${moment.location}
        ${moment.trip}
        ${moment.notes}
        ${moment.lens}
      `.toLowerCase();

      const matchesSearch = text.includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" ||
        moment.category.toLowerCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
}

function renderMoments() {
  const visibleMoments = getVisibleMoments();

  galleryGrid.innerHTML = "";

  galleryTitle.textContent =
    currentView === "favorites" ? "Favorites" : "Gallery";

  const label = visibleMoments.length === 1 ? "moment" : "moments";
  momentCount.textContent = `${visibleMoments.length} ${label}`;

  emptyState.classList.toggle("hidden", visibleMoments.length !== 0);

  visibleMoments.forEach((moment) => {
    const card = document.createElement("article");
    card.className = `photo-card ${moment.category.toLowerCase()}-card`;

    card.innerHTML = `
      <img src="${moment.image}" alt="${moment.title}" />

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
        <span class="trip-badge">${moment.trip || "General Collection"}</span>
        <br />
        <span class="category-badge">${moment.category}</span>

        <p class="card-location">${moment.location}</p>
        <p class="card-date">${formatDate(moment.date)}</p>

        <h3 class="card-title">${moment.title}</h3>
        <p class="card-meta">${moment.camera} • ${moment.lens}</p>
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

    card.addEventListener("click", () => openViewer(moment.id));

    galleryGrid.appendChild(card);
  });
}

function addOrUpdateMoment(event) {
  event.preventDefault();

  const image = selectedImageData || imageInput.value.trim();

  if (!image) {
    alert("Please choose a photo or paste an image URL.");
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    trip: tripInput.value.trim() || "General Collection",
    date: dateInput.value || new Date().toISOString().split("T")[0],
    image,
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
      moment.id === editingMomentId ? { ...moment, ...data } : moment,
    );
  } else {
    moments.unshift({
      id: crypto.randomUUID(),
      favorite: false,
      ...data,
    });
  }

  saveMoments();
  resetForm();
  renderMoments();
  updateStats();
}

function startEdit(id) {
  const moment = moments.find((item) => item.id === id);
  if (!moment) return;

  editingMomentId = id;

  formTitle.textContent = "Edit Moment";
  submitBtn.textContent = "Update Moment";
  cancelEditBtn.classList.remove("hidden");

  titleInput.value = moment.title;
  locationInput.value = moment.location;
  tripInput.value = moment.trip;
  dateInput.value = moment.date;
  imageInput.value = moment.image.startsWith("data:") ? "" : moment.image;
  selectedImageData = moment.image.startsWith("data:") ? moment.image : "";
  categoryInput.value = moment.category;
  cameraInput.value = moment.camera;
  lensInput.value = moment.lens;
  apertureInput.value = moment.aperture;
  shutterInput.value = moment.shutter;
  isoInput.value = moment.iso;
  wbInput.value = moment.wb;
  notesInput.value = moment.notes;

  document.getElementById("add-section").scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  editingMomentId = null;
  selectedImageData = "";
  momentForm.reset();
  formTitle.textContent = "Add New Moment";
  submitBtn.textContent = "Add Moment";
  cancelEditBtn.classList.add("hidden");
}

function toggleFavorite(id) {
  moments = moments.map((moment) =>
    moment.id === id ? { ...moment, favorite: !moment.favorite } : moment,
  );

  saveMoments();
  renderMoments();
  updateStats();
}

function deleteMoment(id) {
  if (!confirm("Delete this moment?")) return;

  moments = moments.filter((moment) => moment.id !== id);

  saveMoments();
  renderMoments();
  updateStats();
}

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

function openViewer(id) {
  currentViewerIndex = moments.findIndex((moment) => moment.id === id);
  updateViewer();
  photoViewer.classList.add("active");
  document.body.style.overflow = "hidden";
}

function updateViewer() {
  const moment = moments[currentViewerIndex];
  if (!moment) return;

  viewerImage.src = moment.image;
  viewerImage.alt = moment.title;
  viewerCategory.textContent = moment.category;
  viewerTitle.textContent = moment.title;
  viewerLocation.textContent = `${moment.location} • ${formatDate(moment.date)}`;
  viewerMeta.textContent = `${moment.camera} • ${moment.lens} • ${moment.aperture} • ${moment.shutter} • ISO ${moment.iso} • WB ${moment.wb}`;
  viewerNotes.textContent = moment.notes || "No notes.";
}

function closeViewer() {
  photoViewer.classList.remove("active");
  document.body.style.overflow = "auto";
}

function showNextMoment() {
  currentViewerIndex = (currentViewerIndex + 1) % moments.length;
  updateViewer();
}

function showPreviousMoment() {
  currentViewerIndex =
    (currentViewerIndex - 1 + moments.length) % moments.length;
  updateViewer();
}

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

function updateAuroraReadiness() {
  const ready = [...auroraChecks].every((check) => check.checked);

  auroraStatus.textContent = ready
    ? "Ready: Viltrox 13mm • f/1.8 • ISO 1600 • 1s • WB 4000K"
    : "Not ready yet. Complete the checklist before going out.";

  auroraStatus.classList.toggle("ready", ready);
}

function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((btn) => btn.classList.remove("active"));
      item.classList.add("active");

      const tab = item.dataset.tab;

      currentView = tab === "favorites" ? "favorites" : "gallery";

      if (tab === "gallery" || tab === "favorites") {
        renderMoments();
        document
          .getElementById("gallery-section")
          .scrollIntoView({ behavior: "smooth" });
      }

      if (tab === "add") {
        document
          .getElementById("add-section")
          .scrollIntoView({ behavior: "smooth" });
        titleInput.focus();
      }

      if (tab === "assistant") {
        document
          .getElementById("assistant-section")
          .scrollIntoView({ behavior: "smooth" });
      }

      if (tab === "settings") {
        document
          .getElementById("settings-section")
          .scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

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

function handleFileUpload() {
  const file = fileInput.files[0];
  if (!file) return;

  const maxSizeMB = 1;

  if (file.size > maxSizeMB * 1024 * 1024) {
    alert(
      "This photo is too large for browser storage. Please use an image under 1 MB or paste an Image URL.",
    );

    fileInput.value = "";
    selectedImageData = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedImageData = reader.result;
    imageInput.value = "";
  };

  reader.readAsDataURL(file);
}

function formatDate(dateString) {
  if (!dateString) return "Unknown Date";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  document.getElementById("add-section").scrollIntoView({ behavior: "smooth" });
  titleInput.focus();
});

clearDataBtn.addEventListener("click", () => {
  if (!confirm("Delete all saved moments?")) return;

  localStorage.removeItem(STORAGE_KEY);
  moments = sampleMoments;
  saveMoments();
  renderMoments();
  updateStats();
});

document.addEventListener("keydown", (event) => {
  if (!photoViewer.classList.contains("active")) return;

  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowRight") showNextMoment();
  if (event.key === "ArrowLeft") showPreviousMoment();
});

function initApp() {
  loadMoments();
  renderMoments();
  updateStats();
  updateAssistant();
  updateAuroraReadiness();
  setupPresets();
  setupNavigation();
  setupSwipeGestures();
}

initApp();
