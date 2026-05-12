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

function formatShutter(value) {
  if (!value) return "";

  if (value >= 1) return `${value}s`;

  return `1/${Math.round(1 / value)}s`;
}
