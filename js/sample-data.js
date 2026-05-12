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

    thumbnail:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",

    images: [
      {
        id: null,
        storage: "url",
        src:
          "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
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

  {
    id: crypto.randomUUID(),

    title: "Snow Street Mood",

    location: "Lofoten • Norway",

    trip: "Lofoten Winter Journey",

    date: "2026-02-13",

    thumbnail:
      "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=1200&q=80",

    images: [
      {
        id: null,
        storage: "url",
        src:
          "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=1200&q=80",
      },
    ],

    category: "Snow",

    camera: "Nikon Z50",

    lens: "DX 16-50mm",

    aperture: "f/5.6",

    shutter: "1/250s",

    iso: "Auto",

    wb: "Cloudy",

    notes: "Snow street mood • Watch highlights",

    favorite: false,
  },
];