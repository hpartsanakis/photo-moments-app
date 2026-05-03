/* =========================
   1. DATA
   Default cards for first app load
========================= */

const cards = [
  {
    id: 1,
    collection: "moments",
    title: "Blue Hour in Frankfurt",
    location: "Frankfurt am Main",
    content: "Perfect reflections after rain near the river.",
    settings: "Nikon Z50 · 40mm · f/2.8 · 1/250s · ISO 200",
    learning: "Blue hour gives softer contrast. Reflections become stronger after rain.",
    image: null
  },
  {
    id: 2,
    collection: "learning",
    title: "Shutter Speed Practice",
    location: "Photography Notes",
    content: "Testing how shutter speed affects movement.",
    settings: "1/1000s freezes action · 1/30s creates motion blur",
    learning: "Fast shutter freezes movement. Slow shutter shows motion.",
    image: null
  }
];

/* Load saved cards from localStorage */
const savedCards = localStorage.getItem("photoMomentsCards");

if (savedCards) {
  cards.length = 0;
  cards.push(...JSON.parse(savedCards));
}

/* =========================
   2. DOM ELEMENTS
========================= */

const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const addCardBtn = document.getElementById("addCardBtn");
const installBtn = document.getElementById("installBtn");

const cardModal = document.getElementById("cardModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cardForm = document.getElementById("cardForm");

const imageInput = document.getElementById("imageInput");
const titleInput = document.getElementById("titleInput");
const locationInput = document.getElementById("locationInput");
const contentInput = document.getElementById("contentInput");
const settingsInput = document.getElementById("settingsInput");
const learningInput = document.getElementById("learningInput");

const modalTitle = document.getElementById("modalTitle");
const collectionButtons = document.querySelectorAll(".collection-btn");

/* =========================
   3. APP STATE
========================= */

let activeCollection = "moments";
let editingCardId = null;
let deferredPrompt = null;

/* =========================
   4. HELPER FUNCTIONS
========================= */

/* Save all cards permanently in browser */
function saveCards() {
  localStorage.setItem("photoMomentsCards", JSON.stringify(cards));
}

/* Convert uploaded photo to Base64 */
function convertImageToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/* Return cards from selected collection */
function getActiveCollectionCards() {
  return cards.filter((card) => card.collection === activeCollection);
}

/* Sort cards based on dropdown */
function sortCards(data) {
  const sorted = [...data];
  const mode = sortSelect.value;

  if (mode === "newest") {
    sorted.sort((a, b) => b.id - a.id);
  }

  if (mode === "az") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (mode === "za") {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  }

  if (mode === "location") {
    sorted.sort((a, b) => (a.location || "").localeCompare(b.location || ""));
  }

  return sorted;
}

/* =========================
   5. RENDER PHOTO GRID
========================= */

function renderCards(data) {
  const sortedCards = sortCards(data);

  cardsContainer.innerHTML = "";

  if (sortedCards.length === 0) {
    cardsContainer.innerHTML = `
      <div class="empty-state">
        <h3>No moments found</h3>
        <p>Add your first photo moment.</p>
      </div>
    `;
    return;
  }

  sortedCards.forEach((card) => {
    const cardElement = document.createElement("article");
    cardElement.classList.add("grid-card");

    cardElement.innerHTML = `
      ${card.image
        ? `<img src="${card.image}" alt="${card.title}" class="grid-image">`
        : `<div class="grid-placeholder">📸</div>`
      }

      <div class="grid-overlay">
        <h3>${card.title}</h3>
        <p>${card.location || "No location"}</p>
      </div>
    `;

    /* Click on photo opens detail modal */
    cardElement.addEventListener("click", () => {
      openDetailView(card);
    });

    cardsContainer.appendChild(cardElement);
  });
}

/* =========================
   6. SEARCH + FILTER
========================= */

function applyFiltersAndRender() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  let filteredCards = getActiveCollectionCards();

  if (searchTerm) {
    filteredCards = filteredCards.filter((card) => {
      return (
        card.title.toLowerCase().includes(searchTerm) ||
        (card.location || "").toLowerCase().includes(searchTerm) ||
        card.content.toLowerCase().includes(searchTerm) ||
        (card.settings || "").toLowerCase().includes(searchTerm) ||
        (card.learning || "").toLowerCase().includes(searchTerm)
      );
    });
  }

  renderCards(filteredCards);
}

/* =========================
   7. MODAL MODES
========================= */

/* Open form mode for add/edit */
function openFormModal() {
  removeDetailView();

  modalTitle.textContent =
    editingCardId === null ? "Add Photo Moment" : "Edit Photo Moment";

  cardForm.style.display = "block";
  cardModal.classList.remove("hidden");
}

/* Close modal and reset everything */
function closeModal() {
  cardModal.classList.add("hidden");
  cardForm.reset();
  imageInput.value = "";
  editingCardId = null;
  removeDetailView();
  cardForm.style.display = "block";
}

/* Remove detail view if it exists */
function removeDetailView() {
  const detailView = document.getElementById("detailView");

  if (detailView) {
    detailView.remove();
  }
}

/* Open detail view when user taps a photo */
function openDetailView(card) {
  removeDetailView();

  modalTitle.textContent = card.title;
  cardForm.style.display = "none";

  const detailHTML = `
    <div class="detail-view" id="detailView">
      ${card.image
        ? `<img src="${card.image}" alt="${card.title}" class="detail-image">`
        : `<div class="detail-placeholder">📸</div>`
      }

      <div class="detail-meta">
        <span>${card.location || "No location"}</span>
        <span>${card.collection === "learning" ? "Learning" : "Moment"}</span>
      </div>

      <p class="detail-notes">${card.content}</p>

      ${card.settings ? `
        <div class="info-box">
          <strong>⚙️ Photo Settings</strong>
          <p>${card.settings}</p>
        </div>
      ` : ""}

      ${card.learning ? `
        <div class="info-box">
          <strong>🧠 Learning Note</strong>
          <p>${card.learning}</p>
        </div>
      ` : ""}

      <div class="photo-actions">
        <button type="button" class="edit-btn" id="detailEditBtn">Edit</button>
        <button type="button" class="delete-btn" id="detailDeleteBtn">Delete</button>
      </div>
    </div>
  `;

  modalTitle.insertAdjacentHTML("afterend", detailHTML);

  document.getElementById("detailEditBtn").addEventListener("click", () => {
    closeModal();
    editCard(card.id);
  });

  document.getElementById("detailDeleteBtn").addEventListener("click", () => {
    deleteCard(card.id);
    closeModal();
  });

  cardModal.classList.remove("hidden");
}

/* =========================
   8. CRUD FUNCTIONS
========================= */

async function createCard() {
  let imageData = null;

  if (imageInput.files[0]) {
    imageData = await convertImageToBase64(imageInput.files[0]);
  }

  const newCard = {
    id: Date.now(),
    collection: activeCollection,
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    content: contentInput.value.trim(),
    settings: settingsInput.value.trim(),
    learning: learningInput.value.trim(),
    image: imageData
  };

  cards.push(newCard);
  saveCards();
}

async function updateCard() {
  const cardToUpdate = cards.find((card) => card.id === editingCardId);

  if (!cardToUpdate) return;

  cardToUpdate.title = titleInput.value.trim();
  cardToUpdate.location = locationInput.value.trim();
  cardToUpdate.content = contentInput.value.trim();
  cardToUpdate.settings = settingsInput.value.trim();
  cardToUpdate.learning = learningInput.value.trim();

  if (imageInput.files[0]) {
    cardToUpdate.image = await convertImageToBase64(imageInput.files[0]);
  }

  saveCards();
}

function editCard(id) {
  const cardToEdit = cards.find((card) => card.id === id);

  if (!cardToEdit) return;

  editingCardId = id;

  titleInput.value = cardToEdit.title;
  locationInput.value = cardToEdit.location || "";
  contentInput.value = cardToEdit.content;
  settingsInput.value = cardToEdit.settings || "";
  learningInput.value = cardToEdit.learning || "";

  openFormModal();
}

function deleteCard(id) {
  const index = cards.findIndex((card) => card.id === id);

  if (index !== -1) {
    cards.splice(index, 1);
    saveCards();
    applyFiltersAndRender();
  }
}

/* =========================
   9. EVENT LISTENERS
========================= */

addCardBtn.addEventListener("click", () => {
  editingCardId = null;
  cardForm.reset();
  imageInput.value = "";
  openFormModal();
});

closeModalBtn.addEventListener("click", closeModal);

cardForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (editingCardId === null) {
    await createCard();
  } else {
    await updateCard();
  }

  closeModal();
  applyFiltersAndRender();
});

searchInput.addEventListener("input", applyFiltersAndRender);
sortSelect.addEventListener("change", applyFiltersAndRender);

collectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCollection = button.dataset.collection;
    searchInput.value = "";

    collectionButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    applyFiltersAndRender();
  });
});

/* =========================
   10. PWA INSTALL BUTTON
========================= */

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;
  installBtn.style.display = "none";
});

/* =========================
   11. START APP
========================= */

applyFiltersAndRender();

/* =========================
   12. SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}