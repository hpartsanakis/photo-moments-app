function getMostUsed(items) {
  if (items.length === 0) return "-";

  const counts = {};

  items.forEach((item) => {
    if (!item) return;
    counts[item] = (counts[item] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}

function updateAnalytics() {
  analyticsMoments.textContent = moments.length;

  let totalPhotos = 0;

  moments.forEach((moment) => {
    totalPhotos += moment.images?.length || 1;
  });

  analyticsPhotos.textContent = totalPhotos;

  analyticsCamera.textContent = getMostUsed(
    moments.map((moment) => moment.camera),
  );

  analyticsLens.textContent = getMostUsed(moments.map((moment) => moment.lens));

  analyticsCategory.textContent = getMostUsed(
    moments.map((moment) => moment.category),
  );

  const isoValues = moments
    .map((moment) => parseInt(moment.iso))
    .filter((value) => !isNaN(value));

  analyticsISO.textContent =
    isoValues.length > 0
      ? Math.round(
          isoValues.reduce((sum, value) => sum + value, 0) / isoValues.length,
        )
      : "-";
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

function refreshAnalytics() {
  updateAnalytics();
  updateLensChart();
}
