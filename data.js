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

const CODEX_ENTRIES = [
  {
    id: "nylie",
    cat: "personajes",
    catLabel: "PROTAGONISTA · CLAN KRANIEL",
    tier: "divino",
    name: "Nylie Kraniel (Izaki)",
    title: "Portadora del Depredador y Heredera Kraniel",
    img: "novela/cover.jpg",
    firstCap: 1,
    capLabel: "Prólogo (Cap. 0)",
    affiliation: "Clan Kraniel",
    magic: "Viento, Rayo, Aura Carmesí y «El Depredador»",
    tags: ["Dos Almas", "Ojos Amatista", "Cabello Perlado", "Estilo Kraniel"],
    short: "Joven velztek nacida de la unión entre el alma de Izaki —quien juró sobrevivir tras su última promesa a Lylia— y el cuerpo de la pequeña Nylie en el Gran Bosque de Aries.",
    lore: "Despertó a los diez años junto a un arroyo en el corazón del Gran Bosque de Aries sin entender cómo dos conciencias habitaban un mismo cuerpo. Posee cabello blanco perlado con puntas rosadas, ojos color amatista, orejas de lobo, cola esponjosa y pequeños cuernos que crecen con su linaje.\n\nTras dos años sobreviviendo entre bestias bajo la vigilancia secreta de Sherat, se reencuentra con su madre Diana Kraniel y descubre la magnitud de su apellido. A lo largo del Torneo de Clases y la incursión del Carnero Carmesí, ambos fragmentos de su identidad dejan de oponerse para proclamarse bajo un único nombre: Nylie Kraniel."
  },
  {
    id: "diana",
    cat: "personajes",
    catLabel: "MATRIARCA · CLAN KRANIEL",
    tier: "carmesi",
    name: "Diana Kraniel",
    title: "Madre de Nylie y Dama de Hierro del Clan",
    img: "novela/art/clan.jpg",
    firstCap: 13,
    capLabel: "Capítulo 11 · Vol. 2",
    affiliation: "Casa Principal Kraniel",
    magic: "Dominio Físico, Presión de Aura y Estilo Kraniel",
    tags: ["Matriarca", "Cuernos Reales", "Mentora", "Linaje Puro"],
    short: "Madre de Nylie. Su presencia imponente combina una devoción feroz hacia su hija con el rigor marcial que caracteriza a la cúspide del Clan Kraniel.",
    lore: "Durante los dos años que Nylie permaneció en el Gran Bosque de Aries, Diana jamás dejó de aguardar su regreso. Al reencontrarse con ella, asume personalmente parte de su reconstrucción emocional y marcial, enseñándole qué significa llevar el apellido Kraniel frente a las demás familias nobles."
  },
  {
    id: "okami",
    cat: "personajes",
    catLabel: "LÍDER SUPREMO · CLAN KRANIEL",
    tier: "carmesi",
    name: "Okami Kraniel",
    title: "Patriarca y Cabeza del Clan Kraniel",
    img: "novela/art/clan.jpg",
    firstCap: 15,
    capLabel: "Capítulo 13 · Vol. 2",
    affiliation: "Clan Kraniel · La Capital",
    magic: "Autoridad de Sangre, Aura Superior",
    tags: ["Patriarca", "Política de Clanes", "Fuerza Absoluta"],
    short: "Líder del Clan Kraniel cuyo peso político y militar mantiene el equilibrio desde la capital frente a los otros cuatro grandes clanes.",
    lore: "Figura de enorme respeto y hermetismo. Sus decisiones determinan el rumbo de la familia principal, la protección de Nylie ante las miradas de la corte y los pactos antiguos que vinculan a los Kraniel con el Bosque de Aries."
  },
  {
    id: "fayna",
    cat: "personajes",
    catLabel: "ALIADA CERCANA · CLAN KITSUNE",
    tier: "oro",
    name: "Fayna Kitsune",
    title: "Heredera del Linaje Zorro",
    img: "novela/art/flor.jpg",
    firstCap: 13,
    capLabel: "Capítulo 11 · Vol. 2",
    affiliation: "Clan Kitsune",
    magic: "Magia Espiritual y Agilidad Arcana",
    tags: ["Clan Kitsune", "Lealtad", "Compañera"],
    short: "Integrante del Clan Kitsune y una de las personas más cercanas a Nylie y Diana desde su salida del Gran Bosque de Aries.",
    lore: "Con rasgos propios del linaje zorro de los Kitsune, Fayna acompaña a Nylie en su adaptación a la vida fuera del bosque, sirviendo como puente entre la calidez familiar y los desafíos de la sociedad velztek."
  },
  {
    id: "kelly",
    cat: "personajes",
    catLabel: "RIVAL Y COMPAÑERA · CLAN NILLION",
    tier: "azul",
    name: "Kelly Nillion",
    title: "Combatiente de Élite del Clan Nillion",
    img: "novela/art/sketch1.jpg",
    firstCap: 24,
    capLabel: "Capítulo 21 · Vol. 3",
    affiliation: "Clan Nillion",
    magic: "Combate Táctico y Canalización de Maná",
    tags: ["Clan Nillion", "Torneo de Clases", "Orgullo Noble"],
    short: "Joven prodigio del Clan Nillion cuyo camino choca y se entrelaza con el de Nylie durante el arco de entrenamiento y el Torneo de Clases.",
    lore: "Representa el orgullo y la disciplina de una de las cinco grandes casas velztek. Su rivalidad en la academia empuja a Nylie a perfeccionar el Estilo Kraniel sin depender únicamente del instinto salvaje del bosque."
  },
  {
    id: "azari",
    cat: "personajes",
    catLabel: "PORTADORA ÍGNEA · ARCO DE LA ACADEMIA",
    tier: "divino",
    name: "Azari",
    title: "La Dama de las Llamas Violetas",
    img: "novela/art/sketch3.png",
    firstCap: 35,
    capLabel: "Capítulo 31 · Vol. 4",
    affiliation: "Vanguardia de Combate",
    magic: "Fuego Violeta de Alta Densidad",
    tags: ["Llamas Violetas", "Vanguardia", "Incursión"],
    short: "Guerrera capaz de manifestar un fuego violeta de altísima temperatura que cobra un papel crucial en los combates avanzados y la incursión.",
    lore: "Sus flamas púrpura no solo consumen el maná adversario, sino que iluminan los momentos más oscuros de la batalla durante la ofensiva de la Primera Oleada y el despertar de las herencias ancestrales."
  },
  {
    id: "ellynn",
    cat: "personajes",
    catLabel: "MENTORA · MAGIA E INVESTIGACIÓN",
    tier: "oro",
    name: "Maestra Ellynn",
    title: "Investigadora Arcana y Tutora de Nylie",
    img: "novela/art/sketch2.jpg",
    firstCap: 20,
    capLabel: "Capítulo 18 · Vol. 2",
    affiliation: "Mansión Kraniel / Academia",
    magic: "Análisis de Núcleos, Teoría Elemental y Sellos",
    tags: ["Experimentos Mágicos", "Mentora", "Sabiduría"],
    short: "Encargada de medir y entrenar la naturaleza mágica anómala de Nylie mediante experimentos que ponen a prueba su control.",
    lore: "Excéntrica, aguda y observadora. Ellynn es la primera en notar que el flujo de maná y los reflejos de Nylie no corresponden a los de una niña común de su edad, guiándola para canalizar su poder sin autodestruirse."
  },
  {
    id: "takaya",
    cat: "personajes",
    catLabel: "ADVERSARIO · TORNEO DE CLASES",
    tier: "carmesi",
    name: "Takaya",
    title: "El Muro Impenetrable del Torneo",
    img: "novela/art/sketch1.jpg",
    firstCap: 33,
    capLabel: "Capítulo 29 · Vol. 3",
    affiliation: "División de Combate",
    magic: "Coraza Defensiva y Choque de Fuerza Bruta",
    tags: ["Defensa Férrea", "Choque de Bestias", "Duelo Clave"],
    short: "Poderoso contendiente cuya defensa férrea lleva a Nylie al límite físico y mental en el arco «Choque de Bestias».",
    lore: "El duelo contra Takaya (Capítulos 30 al 33) obliga a Nylie a superar la fractura entre sus recuerdos como Izaki y su instinto velztek para quebrar una coraza que parecía invulnerable."
  },
  {
    id: "puni",
    cat: "personajes",
    catLabel: "CATALIZADOR ARCANO · MISTERIO",
    tier: "oro",
    name: "Puni",
    title: "El Peluche y Vínculo de las Estrellas",
    img: "novela/art/flor.jpg",
    firstCap: 16,
    capLabel: "Capítulo 14 · Vol. 2",
    affiliation: "Vínculo de Nylie / Entidades de Aries",
    magic: "Canalización Espiritual y Resonancia Mental",
    tags: ["Catalizador", "Espacio Mental", "Aries"],
    short: "Aparentemente un simple muñeco de peluche que acompaña a Nylie, pero en realidad actúa como un conducto silencioso con las entidades superiores.",
    lore: "A través de Puni resuenan las conciencias que vigilan desde el Gran Bosque de Aries. En los capítulos más recientes (Cap. 70 · Bharani), sirve como puente directo para que las cuatro voces estelares hablen dentro del espacio mental de Nylie."
  },
  {
    id: "clan-kraniel",
    cat: "clanes",
    catLabel: "GRAN CLAN VELZTEK · LINAJE REAL",
    tier: "carmesi",
    name: "Clan Kraniel",
    title: "Señores del Colmillo y los Cuernos de Ébano",
    img: "novela/art/clan.jpg",
    firstCap: 5,
    capLabel: "Capítulo 4 · Vol. 1",
    affiliation: "Uno de los Cinco Grandes Clanes",
    magic: "Estilo Kraniel, Aura de Batalla y Herencia Lupina/Cornuda",
    tags: ["Diana", "Nylie", "Okami", "Estilo Kraniel"],
    short: "El clan protagonista de la obra. Sus miembros portan orejas y cola lupina junto a cuernos que se desarrollan al alcanzar la madurez.",
    lore: "Como todo gran clan velztek, sus integrantes llevan «Kraniel» como apellido de sangre. Incluso las guardianas del Gran Bosque de Aries reconocen de inmediato a un Kraniel por su olor, su reserva de maná y sus pequeños cuernos nacientes.\n\nSu arte marcial propio, el «Estilo Kraniel», combina desplazamientos explosivos, tajos de viento comprimido y una ofensiva implacable cuerpo a cuerpo."
  },
  {
    id: "cinco-clanes",
    cat: "clanes",
    catLabel: "ESTRUCTURA DEL MUNDO · 5 LINAJES",
    tier: "oro",
    name: "Los Cinco Grandes Clanes (Kitsune, Nillion, Urlier y Nevorv)",
    title: "Las Cinco Casas de Sangre de la Diosa Veztel",
    img: "novela/cover.jpg",
    firstCap: 12,
    capLabel: "Velztek #1 · Vol. 1",
    affiliation: "Sociedad Velztek",
    magic: "Dones Hereditarios por Linaje",
    tags: ["Kitsune", "Nillion", "Urlier", "Nevorv"],
    short: "Junto a los Kraniel, los clanes Kitsune, Nillion, Urlier y Nevorv conforman los cinco pilares de la raza velztek revelados en los interludios de lore.",
    lore: "El término «Velztek» proviene de la unión entre «Bestia» y el nombre de la sexta Diosa, «Veztel». Cada uno de los cinco clanes conserva rasgos animales sagrados distintos (como las colas espirituales de los Kitsune o la precisión marcial de los Nillion) y utiliza el nombre de su clan como apellido."
  },
  {
    id: "depredador",
    cat: "bestiario",
    catLabel: "BENDICIÓN DIVINA · SEXTA DIOSA VEZTEL",
    tier: "divino",
    name: "El Depredador (Bendición de Veztel)",
    title: "Armadura Viviente y Estado de Caza Absoluta",
    img: "novela/cover.jpg",
    firstCap: 7,
    capLabel: "Capítulo 6 · Vol. 1",
    affiliation: "Sexta Diosa Veztel / Nylie Kraniel",
    magic: "Recubrimiento de Sombra, Instinto Letal y Amplificación Total",
    tags: ["Sexta Diosa", "Transformación", "Caza Nocturna"],
    short: "Estado ancestral despertado por Nylie al borde de la muerte en el Gran Bosque de Aries. Recubre su cuerpo con una coraza oscura y multiplica todos sus sentidos.",
    lore: "Otorgado como bendición de la sexta Diosa, Veztel. Cuando se activa, la silueta de Nylie se envuelve en una armadura azabache de garras y colmillos etéreos capaz de desgarrar bestias de rango superior. Sin embargo, exige un altísimo costo físico y amenaza con sumergir la razón del portador en puro instinto de caza."
  },
  {
    id: "carnero-carmesi",
    cat: "bestiario",
    catLabel: "CALAMIDAD · ARCO DE LA INCURSIÓN",
    tier: "carmesi",
    name: "El Carnero Carmesí",
    title: "Coloso de Sangre y Guardián del Umbral",
    img: "novela/art/sketch3.png",
    firstCap: 80,
    capLabel: "Capítulo 66 · Vol. 6",
    affiliation: "Constelación de Aries / Incursión",
    magic: "Embestida de Aura Carmesí y Dominio Territorial",
    tags: ["Capítulos 66–67", "Duelo de Carneros", "Volumen 6"],
    short: "Imponente entidad con forma de carnero envuelto en energía escarlata que protagoniza uno de los combates más feroces del Volumen 6.",
    lore: "Su aparición en los capítulos «El Carnero Carmesí» y «Duelo de Carneros» pone a prueba toda la evolución de Nylie tras el salto temporal, exigiendo el dominio conjunto del Aura y la Herencia para resistir su embestida."
  },
  {
    id: "estrellas-aries",
    cat: "bestiario",
    catLabel: "ENTIDADES ESTELARES · ARIES",
    tier: "divino",
    name: "Hamal, Bharani, Mesart y Botein (y Sherat)",
    title: "Las Guardianas de la Constelación de Aries",
    img: "novela/art/flor.jpg",
    firstCap: 5,
    capLabel: "Cap. 4 y Cap. 70 (Bharani)",
    affiliation: "Gran Bosque de Aries",
    magic: "Omnisciencia del Bosque y Juicio Estelar",
    tags: ["Sherat", "Bharani", "Hamal", "Mesart y Botein"],
    short: "Soberanas ancestrales cuyos nombres corresponden a las estrellas reales de la constelación de Aries. Vigilan a Nylie desde su primer día en el bosque.",
    lore: "Sherat fue la primera en detectar a Nylie como una niña del Clan Kraniel en el Capítulo 4, decidiendo observarla durante dos años en lugar de eliminarla. Más adelante, en el Capítulo 70 («Bharani»), Hamal (la voz severa), Bharani (la voz serena), Mesart (la voz juguetona) y Botein se manifiestan ante la conciencia de Nylie a través de Puni."
  },
  {
    id: "bosque-aries",
    cat: "mundo",
    catLabel: "REGIÓN SAGRADA · ESCENARIO INICIAL",
    tier: "azul",
    name: "El Gran Bosque de Aries",
    title: "Cuna del Despertar y Territorio de Bestias",
    img: "novela/bg-forest.png",
    firstCap: 1,
    capLabel: "Prólogo (Cap. 0)",
    affiliation: "Dominio de las Guardianas de Aries",
    magic: "Alta Densidad de Maná Salvaje",
    tags: ["Supervivencia", "2 Años", "Árboles Colosales"],
    short: "Inmenso territorio ancestral cubierto de árboles gigantescos, ríos cristalinos y bestias mágicas donde Nylie sobrevive durante dos años.",
    lore: "Ningún habitante común se atreve a adentrarse en sus profundidades. En este ecosistema implacable, Nylie construye su primer refugio, aprende a sentir el maná del viento y despierta por primera vez la forma del Depredador."
  },
  {
    id: "aura-herencia",
    cat: "mundo",
    catLabel: "SISTEMA DE PODER · ARTES SUPERIORES",
    tier: "oro",
    name: "El Aura, la Herencia y el Estilo Kraniel",
    title: "Los Tres Pilares del Combate Velztek",
    img: "novela/art/sketch2.jpg",
    firstCap: 25,
    capLabel: "Caps. 22, 57 y 58",
    affiliation: "Guerreros de Élite",
    magic: "Manifestación de Voluntad y Sangre",
    tags: ["Estilo Kraniel", "El Aura (Cap. 57)", "La Herencia (Cap. 58)"],
    short: "El sistema de poder evoluciona desde la magia elemental y el Estilo Kraniel hasta el despertar del Aura y la Herencia ancestral en el Volumen 6.",
    lore: "Mientras la magia canaliza los elementos externos (viento, relámpago, llamas violetas), el Aura proyecta la fuerza vital y espiritual del guerrero sobre su arma y su cuerpo. Por encima de ambos se encuentra «La Herencia», el despertar de los recuerdos y facultades grabados en la sangre antigua de cada clan."
  }
];
