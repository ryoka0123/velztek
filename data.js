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
    id: "arcos",
    badge: "CRÓNICA CENTRAL · 70 CAPÍTULOS + 14 EXTRAS",
    title: "Mapa de Arcos y Volúmenes de Velztek",
    cover: "novela/cover.jpg",
    desc: "Seguimiento completo de la travesía de Nylie Kraniel (la unión de las almas de Izaki y Nylie tras la promesa a Lylia): desde su despertar de dos años en el Gran Bosque de Aries bajo la mirada de Sherat, el reencuentro con su madre Diana Kraniel y Fayna Kitsune, las pruebas de magia con la maestra Ellynn y el torneo frente a Kelly Nillion y Takaya, hasta la incursión del Carnero Carmesí y Bharani.",
    unitLabel: "VOLÚMENES 1–6",
    statLabel: "volúmenes maquetados",
    from: 1,
    to: 6,
    done: [1, 2, 3, 4, 5, 6],
    current: 6,
    note: "La edición web conserva íntegros los 84 archivos del EPUB original de WARYONI (~255,000 palabras), estructurados en 6 tomos temáticos con separadores de escena, índice emergente y audiolibro neuronal.",
    highlights: [
      {
        arc: "Volumen 1 · Capítulos 0 al 10 (+ Velztek #1)",
        heading: "El Gran Bosque de Aries y el Despertar del Depredador",
        leftTag: "EL MISTERIO INICIAL · IZAKI Y NYLIE",
        leftText: "Tras una última promesa a Lylia antes de morir, una conciencia despierta en la orilla de un riachuelo dentro del cuerpo de una niña velztek de diez años: cabello perlado con matices rosados, ojos amatista, orejas de lobo, cola esponjosa y pequeños cuernos ocultos.",
        rightTag: "CLAVES DEL ARCO · BOSQUE DE ARIES",
        rightText: "Vigilada en las sombras por Sherat y su señora al identificarla como una Kraniel, la protagonista aprende a cazar, desbloquea la forma del «Depredador» (bendición de la sexta Diosa, Veztel) y sobrevive dos años hasta su encuentro con el exterior."
      },
      {
        arc: "Volúmenes 2 y 3 · Capítulos 11 al 30 (+ Velztek #2 y #3)",
        heading: "La Mansión Kraniel, el Torneo de Clases y el Estilo del Clan",
        leftTag: "REENCUENTRO Y LINAJES · KRANIEL Y KITSUNE",
        leftText: "Fuera del bosque, Nylie conoce a su madre Diana Kraniel, a Fayna Kitsune, a Erick y al capitán Alder, mientras el líder Okami Kraniel sostiene el peso político del clan en la capital y el peluche Puni actúa como vínculo silencioso.",
        rightTag: "DESARROLLO DE MAGIA Y COMBATE",
        rightText: "Bajo los experimentos mágicos de la maestra Ellynn y el entrenamiento del «Estilo Kraniel», Nylie forja su propio estilo antes de que estalle el Torneo de Clases junto a figuras como Kelly Nillion y Azari."
      },
      {
        arc: "Volúmenes 4 y 5 · Capítulos 31 al 50 (+ Epílogos 1–2 e Interludios)",
        heading: "Choque de Bestias, «Mi Nombre» y el Punto de Quiebre",
        leftTag: "IDENTIDAD DUAL · «¿QUIÉN SOY AHORA?»",
        leftText: "En duelos al límite contra la coraza de Takaya y crisis internas («Perdida en mí», «Mi otro yo», «La nueva yo»), las memorias de Izaki y la voluntad de Nylie dejan de chocar para aceptarse bajo un único nombre y propósito.",
        rightTag: "EL CLÍMAX DE LA PRIMERA GRAN ETAPA",
        rightText: "La recta final del Capítulo 46 al 50 («Punto de quiebre», «Desesperación», «Gritos y Llantos») cierra con los Epílogos 1 y 2 y el Especial 50, marcando un antes y un después para toda la familia Kraniel."
      },
      {
        arc: "Volumen 6 · Capítulos 51 al 70 (+ Especiales 2025, #6 y 2026)",
        heading: "La Incursión, el Carnero Carmesí y las Estrellas de Aries",
        leftTag: "NUEVA AMENAZA · PRIMERA OLEADA Y HERENCIA",
        leftText: "Con el paso del tiempo, el entrenamiento junto a las maestras, el dominio del Aura y el fuego violeta de Azari preparan al grupo para la incursión y el despertar de la herencia ancestral.",
        rightTag: "DUELO DE CARNEROS Y BHARANI",
        rightText: "El choque contra el Carnero Carmesí (Caps. 66–67) y la aparición en el espacio mental de las cuatro entidades estelares de Aries —Hamal, Bharani, Mesart y Botein— abren el arco más reciente de la obra."
      }
    ]
  },
  {
    id: "compendio",
    badge: "ARCHIVO DE MUNDOS · LORE Y SISTEMA DE PODER",
    title: "Compendio de Clanes, Magia y Entidades de Aries",
    cover: "novela/art/clan.jpg",
    desc: "Proyecto de catalogación enciclopédica de las razas, apellidos de clan, bendiciones divinas y guardianas del bosque que aparecen a lo largo de los capítulos e interludios de Velztek #1 al #6.",
    unitLabel: "ESPECIALES #1–#6",
    statLabel: "archivos de lore integrados",
    from: 1,
    to: 6,
    done: [1, 2, 3, 4, 5, 6],
    current: 6,
    note: "Todos los términos clave han sido vinculados al Glosario del libro antiguo para que los lectores puedan consultarlos sin spoilers mientras leen cada volumen.",
    highlights: [
      {
        arc: "Sistema de Linajes · Los Cinco Grandes Clanes",
        heading: "La Sangre de la Sexta Diosa, Veztel",
        leftTag: "ORIGEN DEL TÉRMINO «VELZTEK»",
        leftText: "Como revelan las notas de lore de la obra, el nombre «Velztek» nace de la unión entre «Bestia» y «Veztel» (la sexta Diosa). Sus integrantes llevan el nombre de su clan como apellido oficial.",
        rightTag: "CLANES REGISTRADOS EN LA OBRA",
        rightText: "• Clan Kraniel (Diana, Nylie, Okami): linaje de rasgos lupinos y cuernos que crecen en la adultez.\n• Clan Kitsune (Fayna) · Clan Nillion (Kelly) · Clan Urlier · Clan Nevorv."
      },
      {
        arc: "Constelación de Aries · Las Cuatro Guardianas",
        heading: "Hamal, Bharani, Mesart y Botein",
        leftTag: "EL VÍNCULO CON EL GRAN BOSQUE DE ARIES",
        leftText: "Las entidades superiores que custodian el Gran Bosque llevan los nombres de las estrellas de la constelación de Aries (Sherat, Bharani, Hamal, Mesart y Botein) y se comunican a través de catalizadores como Puni.",
        rightTag: "EL DEPREDADOR Y EL AURA",
        rightText: "Más allá de la magia elemental (viento, flamas violetas, curación), los guerreros de élite despiertan el Aura, la Herencia de sangre y la coraza bestial conocida como «El Depredador»."
      }
    ]
  }
];

const CREDITS = [
  ["Autoría e historia original", "WARYONI"],
  ["Ilustraciones y diseño de personajes", "Arte oficial de Velztek"],
  ["Obra completa cargada", "84 partes (Capítulos 0 al 70 + Especiales)"],
  ["Edición y maquetación web", "Archivo de Velztek"]
];
