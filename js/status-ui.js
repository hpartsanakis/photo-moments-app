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
