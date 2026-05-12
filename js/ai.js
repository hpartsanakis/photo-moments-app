// =========================
// AI TITLE GENERATOR
// =========================

const aiWords = {
  aurora: [
    "Northern Silence",
    "Frozen Aurora",
    "Arctic Echoes",
    "Green Horizon",
    "Polar Night",
  ],

  snow: [
    "Winter Silence",
    "Frozen Streets",
    "Snowfall Memory",
    "Cold Reflections",
    "White Horizon",
  ],

  rain: [
    "Rain Reflections",
    "Midnight Rain",
    "Wet Streets",
    "Neon Reflections",
    "Silent Storm",
  ],

  streetnight: [
    "City Echoes",
    "Midnight Motion",
    "Urban Silence",
    "Neon Shadows",
    "Night Passage",
  ],

  bluehour: [
    "Blue Horizon",
    "Harbor Silence",
    "Evening Echoes",
    "Northern Blue",
    "Twilight Reflections",
  ],

  husky: [
    "Frozen Motion",
    "Wild North",
    "Arctic Energy",
    "Snow Runner",
    "Polar Spirit",
  ],
};

// =========================
// GENERATE TITLE
// =========================

function generateAITitle() {
  const category = getPresetNameFromCategory(categoryInput.value);

  const location = locationInput.value.trim();

  const trip = tripInput.value.trim();

  const notes = notesInput.value.trim();

  let wordPool = aiWords[category];

  if (!wordPool) {
    wordPool = [
      "Travel Memory",
      "Silent Journey",
      "Captured Moment",
      "Northern Story",
    ];
  }

  const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];

  let generatedTitle = randomWord;

  // =========================
  // LOCATION BONUS
  // =========================

  if (location.includes("Norway")) {
    generatedTitle = `Nordic ${randomWord}`;
  }

  if (trip.toLowerCase().includes("lofoten")) {
    generatedTitle = `Lofoten ${randomWord}`;
  }

  if (notes.toLowerCase().includes("reflection")) {
    generatedTitle += " Reflections";
  }

  titleInput.value = generatedTitle;

  updateMetadataScore();
  updateMissingFields();
}
