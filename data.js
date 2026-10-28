// Datos de las obras, volúmenes reales del EPUB (84 partes), galería de arte y proyectos de Velztek.
const NOVEL_SERIES = [
  {
    id: 1,
    title: "Velztek",
    type: "Novela principal",
    status: "En publicación · 84 partes",
    cover: "novela/cover.jpg",
    hue: 195,
    desc: "La obra completa de WARYONI, organizada en 6 volúmenes (70 capítulos numerados, prólogo, epílogos, interludios y especiales). Un bosque inmenso, dos almas unidas y una nueva vida bajo la luna como una velztek del clan Kraniel.",
    volumes: [
      { n: 1, title: "Volumen 1: El Despertar", cover: "novela/cover.jpg", from: 1, to: 12, label: "Cap. 0–10 + Extra #1" },
      { n: 2, title: "Volumen 2: Nuevo Ciclo", cover: "novela/art/flor.jpg", from: 13, to: 23, label: "Cap. 11–20 + Extra #2" },
      { n: 3, title: "Volumen 3: Estilo Kraniel", cover: "novela/art/clan.jpg", from: 24, to: 34, label: "Cap. 21–30 + Extra #3" },
      { n: 4, title: "Volumen 4: La Nueva Yo", cover: "novela/art/sketch1.jpg", from: 35, to: 45, label: "Cap. 31–40 + Especial #4" },
      { n: 5, title: "Volumen 5: Punto de Quiebre", cover: "novela/art/sketch2.jpg", from: 46, to: 60, label: "Cap. 41–50 + Epílogos e Interludios" },
      { n: 6, title: "Volumen 6: Carnero Carmesí", cover: "novela/art/sketch3.png", from: 61, to: 84, label: "Cap. 51–70 + Especiales" }
    ]
  },
  {
    id: 2,
    title: "Especiales e Interludios",
    type: "Historias extra",
    status: "Colección",
    cover: "novela/art/clan.jpg",
    hue: 350,
    desc: "Acceso directo a los capítulos especiales Velztek #1 a #6, Epílogos 1–2, Interludios 1–2 y especiales de temporada.",
    volumes: [
      { n: 5, title: "Epílogos e Interludios (Vol. 5)", cover: "novela/art/clan.jpg", from: 56, to: 60, label: "Epílogos 1–2 e Interludios 1–2" },
      { n: 6, title: "Especiales 2025–2026 (Vol. 6)", cover: "novela/art/flor.jpg", from: 66, to: 79, label: "Especiales y capítulos" }
    ]
  },
  {
    id: 3,
    title: "Bocetos de WARYONI",
    type: "Galería de Arte",
    status: "Colección",
    cover: "novela/art/sketch2.jpg",
    hue: 210,
    desc: "Diseños de personajes, vestimentas, marcas arcanas y bocetos originales del mundo de Velztek.",
    volumes: [
      { n: 1, title: "Volumen 1: El Despertar", cover: "novela/art/sketch1.jpg", from: 1, to: 12, label: "Ir al Volumen 1" },
      { n: 2, title: "Volumen 2: Nuevo Ciclo", cover: "novela/art/sketch2.jpg", from: 13, to: 23, label: "Ir al Volumen 2" },
      { n: 3, title: "Volumen 3: Estilo Kraniel", cover: "novela/art/sketch3.png", from: 24, to: 34, label: "Ir al Volumen 3" }
    ]
  }
];

const ART_GALLERY = [
  { src: "novela/cover.jpg", title: "Portada oficial · Velztek", tag: "Ilustración principal" },
  { src: "novela/art/clan.jpg", title: "Matriarca y herederas del clan", tag: "Arte a color" },
  { src: "novela/art/flor.jpg", title: "Flor de luz en la tormenta", tag: "Arte a color" },
  { src: "novela/art/sketch1.jpg", title: "Ojos de cristal azul", tag: "Boceto original" },
  { src: "novela/art/sketch2.jpg", title: "Descanso y marca arcana", tag: "Boceto original" },
  { src: "novela/art/sketch3.png", title: "Compañeras de guardia", tag: "Boceto original" }
];

const PROJECTS = [
  {
    title: "Edición web completa de Velztek (84 partes)",
    desc: "Los 84 capítulos del archivo EPUB de WARYONI han sido importados, limpiados y organizados en 6 volúmenes interactivos.",
    from: 1,
    to: 6,
    done: [1, 2, 3, 4, 5, 6],
    current: 6
  }
];

const CREDITS = [
  ["Autoría e historia original", "WARYONI"],
  ["Ilustraciones y diseño de personajes", "Arte oficial de Velztek"],
  ["Obra completa cargada", "84 partes (Capítulos 0 al 70 + Especiales)"],
  ["Edición y maquetación web", "Archivo de Velztek"]
];
