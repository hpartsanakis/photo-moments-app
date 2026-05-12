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
  refreshAnalytics();
}