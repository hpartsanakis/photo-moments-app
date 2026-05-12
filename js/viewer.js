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