const app = document.getElementById("app");
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ---------- imágenes de marcador de posición (SVG) ----------
function ph(line1, line2, hue, w = 400, h = 600) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,42%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},60%,16%)"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="#ffffff55" stroke-width="2"/>
  <text x="50%" y="46%" fill="#fff" font-size="${w / 11}" font-family="serif" font-weight="bold" text-anchor="middle">${line1}</text>
  <text x="50%" y="54%" fill="#ffffffcc" font-size="${w / 16}" font-family="serif" text-anchor="middle">${line2 || ""}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// ---------- vistas ----------
function head(eyebrow, title) { return `<div class="eyebrow">${eyebrow}</div><h1 class="title">${title}</h1>`; }

async function viewHome() {
  const mf = await loadNovel();
  const chs = mf?.chapters || [];
  const rd = new Set(store.get("nread", []));
  const lastCap = store.get("nlastcap", null);
  const resumeCh = (lastCap && chs.find(c => c.n === lastCap)) || chs.find(c => !rd.has(c.n)) || chs[0] || { n: 1, title: "(Capítulo 0)" };
  const resumePt = parseChapTitle(resumeCh.title, resumeCh.n);
  const resumeVol = volOfChapter(resumeCh.n);

  const HOME_BOOKS = [
    { role: "OBRA COMPLETA", title: "VELZTEK", sub: "6 VOLÚMENES · 84 PARTES", cover: "novela/cover.jpg", href: "#/novela/1", tone: "blue", vNum: 1, from: 1, to: 84, footLabel: "VELZTEK" },
    { role: "VOLUMEN I", title: "EL DESPERTAR", sub: "VOLUMEN 1 · 12 PARTES", cover: "novela/art/flor.jpg", href: "#/volumen/1", tone: "emerald", vNum: 1, from: 1, to: 12 },
    { role: "VOLUMEN II", title: " ECOS DEL BOSQUE", sub: "VOLUMEN 2 · 11 PARTES", cover: "novela/art/sketch1.jpg", href: "#/volumen/2", tone: "blue", vNum: 2, from: 13, to: 23 },
    { role: "VOLUMEN III", title: "ESTILO KRANIEL", sub: "VOLUMEN 3 · 11 PARTES", cover: "novela/art/clan.jpg", href: "#/volumen/3", tone: "crimson", vNum: 3, from: 24, to: 34 },
    { role: "VOLUMEN IV", title: "LLAMAS VIOLETAS", sub: "VOLUMEN 4 · 11 PARTES", cover: "novela/cover.jpg", href: "#/volumen/4", tone: "bronze", vNum: 4, from: 35, to: 45 },
    { role: "VOLUMEN V", title: "PUNTO DE QUIEBRE", sub: "VOLUMEN 5 · 15 PARTES", cover: "novela/art/sketch2.jpg", href: "#/volumen/5", tone: "obsidian", vNum: 5, from: 46, to: 60 },
    { role: "VOLUMEN VI", title: "CARNERO CARMESÍ", sub: "VOLUMEN 6 · 24 PARTES", cover: "novela/art/sketch3.png", href: "#/volumen/6", tone: "crimson", vNum: 6, from: 61, to: 84 }
  ];

  const COMPASS_SVG = `<svg viewBox="0 0 60 60" class="b-emblem"><circle cx="30" cy="30" r="14" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="30" cy="30" r="19" fill="none" stroke="currentColor" stroke-width=".7" stroke-dasharray="2 3"/><path d="M30 4 L33 26 L56 30 L33 34 L30 56 L27 34 L4 30 L27 26 Z" fill="currentColor" opacity=".88"/></svg>`;

  app.innerHTML = `
    <div class="home-hero-title">
      <div class="crest-bg"></div>
      <h1 class="title grand-title">BIBLIOTECA DE VELZTEK</h1>
    </div>

    <section class="panel showcase-panel">
      <div class="showcase-head">
        <div class="sh-spacer"></div>
        <div class="sh-center">
          <div class="eyebrow">COLECCIÓN LITERARIA</div>
          <h2>NOVELAS</h2>
        </div>
        <a class="continue-box" href="#/leer/${resumeCh.n}">
          <div>
            <small>${rd.size || lastCap ? "CONTINUAR LEYENDO" : "COMENZAR LECTURA"}</small>
            <b>Volumen ${resumeVol} · ${esc(resumePt.badge)} <em>${esc(resumePt.name)}</em></b>
          </div>
          <span class="arr">→</span>
        </a>
      </div>

      <div class="shelf-wrap">
        <button class="shelf-arrow left" id="sh-prev" aria-label="Anterior">‹</button>
        <div class="hardcover-row" id="hc-row">
          ${HOME_BOOKS.map(b => {
            const inVol = chs.filter(c => c.n >= b.from && c.n <= b.to);
            const isSketch = /sketch/i.test(b.cover);
            return `
            <a class="hc-col" href="${b.href}">
              <div class="hc-role">${esc(b.role)}</div>
              <div class="hc-book ${b.tone}">
                <div class="hc-spine"></div>
                <div class="hc-frame">
                  <img src="${b.cover}" alt="${esc(b.title)}" class="hc-art ${isSketch ? "sketch-dark" : ""}">
                  <div class="hc-shade"></div>
                  ${COMPASS_SVG}
                  <div class="hc-caption">
                    <h3>${esc(b.title)}</h3>
                    <small>${esc(b.sub)}</small>
                  </div>
                  ${typeof buildVolHoverOverlay === "function" ? buildVolHoverOverlay(b.vNum, inVol, rd, b.footLabel || "") : ""}
                </div>
              </div>
            </a>`;
          }).join("")}
        </div>
        <button class="shelf-arrow right" id="sh-next" aria-label="Siguiente">›</button>
      </div>
    </section>

    <section class="panel showcase-panel" style="margin-top:26px">
      <div class="showcase-head">
        <div class="sh-spacer"></div>
        <div class="sh-center">
          <div class="eyebrow">COLECCIÓN ILUSTRADA</div>
          <h2>ARTE Y BOCETOS</h2>
        </div>
        <a class="continue-box" href="#/arte">
          <div>
            <small>GALERÍA DE WARYONI</small>
            <b>${ART_GALLERY.length} ilustraciones y diseños</b>
          </div>
          <span class="arr">→</span>
        </a>
      </div>
      <div class="art-preview-row">
        ${ART_GALLERY.slice(0, 4).map(a => `
          <a class="hc-book obsidian mini-art" href="#/arte">
            <div class="hc-spine"></div>
            <div class="hc-frame">
              <img src="${a.src}" alt="${esc(a.title)}" class="hc-art">
              <div class="hc-shade"></div>
              <div class="hc-caption">
                <h3>${esc(a.title)}</h3>
                <small>${esc(a.tag)}</small>
              </div>
            </div>
          </a>`).join("")}
      </div>
    </section>`;

  const row = document.getElementById("hc-row");
  document.getElementById("sh-prev").onclick = () => row.scrollBy({ left: -240, behavior: "smooth" });
  document.getElementById("sh-next").onclick = () => row.scrollBy({ left: 240, behavior: "smooth" });
}

function viewArt() {
  app.innerHTML = head("Archivo de Velztek", "Galería de Arte") + `<p class="muted" style="text-align:center;margin-top:-10px">Ilustraciones a color y bocetos originales de los personajes de Velztek.</p>
    <div class="panel"><div class="vols" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${ART_GALLERY.map(a => `
      <a class="vol" href="${a.src}" target="_blank" style="background:#0a0d18">
        <img src="${a.src}" alt="${a.title}" style="aspect-ratio:3/4;object-fit:cover">
        <div class="cap">${a.title}<small>${a.tag}</small></div>
      </a>`).join("")}</div></div>`;
}

let dlTab = "descargas";
function viewDownloads() {
  const savedVols = store.get("savedVols", []);
  constvolsList = NOVEL_SERIES[0].volumes;
  const tabs = [["descargas", "Descargas"], ["catalogo", "Catálogo"], ["espacio", "Espacio"]];
  let body = "";
  if (dlTab === "descargas") {
    body = savedVols.length
      ? savedVols.map(vn => {
          const v = constvolsList.find(x => x.n === vn) || { n: vn, title: "Volumen " + vn };
          return `<div class="dl"><a href="#/volumen/${v.n}">Velztek — ${v.title}</a><button class="ghost" data-rm="${v.n}">Quitar</button></div>`;
        }).join("")
      : `<div class="empty"><div style="font-size:2rem">📖</div><h3>Sin contenido descargado</h3><p class="muted">Elige un volumen de la novela y guárdalo para disfrutarlo sin conexión.</p><a class="cta" href="#/novela">→ Explorar novela</a><p class="muted" style="font-size:.8rem">Tus descargas quedan en este navegador y dispositivo.</p></div>`;
  } else if (dlTab === "catalogo") {
    body = constvolsList.map(v => `<div class="dl"><a href="#/volumen/${v.n}">Velztek — ${v.title}</a><span class="muted">Capítulos ${v.from}–${v.to}</span></div>`).join("");
  } else {
    body = `<div class="empty"><h3>${savedVols.length} volumen(es) guardado(s)</h3><p class="muted">Espacio estimado en caché local: ~${savedVols.length * 2} MB</p></div>`;
  }
  app.innerHTML = head("Archivo arcano", "Descargas") + `<div class="panel"><div class="tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${k === dlTab ? "on" : ""}">${l}</button>`).join("")}</div>${body}</div>`;
  app.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { dlTab = b.dataset.t; viewDownloads(); });
  app.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => {
    const x = new Set(store.get("savedVols", []));
    x.delete(+b.dataset.rm);
    store.set("savedVols", [...x]);
    viewDownloads();
  });
}

let projIdx = {};
function viewProjects() {
  app.innerHTML = head("Archivo de Velztek", "Proyectos") +
    `<p class="muted" style="text-align:center;margin-top:-10px">Crónica de arcos, lore del mundo de WARYONI y estado de la edición interactiva.</p>
     <div style="display:flex;justify-content:center;gap:18px;font-size:.8rem;color:var(--muted);margin-bottom:8px">
       <span><b style="color:#8fd19e">●</b> Completado</span>
       <span><b style="color:var(--gold)">●</b> En curso / Arco actual</span>
     </div>` +
    PROJECTS.map((p, idx) => {
      const cells = [];
      for (let n = p.from; n <= p.to; n++) {
        const isDone = p.done.includes(n);
        const isCur = n === p.current;
        cells.push(`<span class="${isDone ? "done" : isCur ? "cur" : ""}">${String(n).padStart(2, "0")}<br>${isDone ? "✓" : "·"}</span>`);
      }
      const hList = p.highlights || [];
      const curH = projIdx[idx] ?? 0;
      const h = hList[curH] || {};

      return `<div class="panel proj-card">
        <div class="proj-top">
          <img src="${p.cover || "novela/cover.jpg"}" alt="${esc(p.title)}" class="proj-cover">
          <div style="flex:1;min-width:250px">
            <div class="eyebrow" style="text-align:left">${esc(p.badge || "PROYECTO")}</div>
            <h3 style="font-size:1.55rem;text-transform:uppercase;margin:4px 0 8px;color:#f4e8c8">${esc(p.title)}</h3>
            <p class="muted" style="margin:0;line-height:1.6">${esc(p.desc)}</p>
          </div>
          <div style="min-width:240px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
              <small class="eyebrow">${esc(p.unitLabel || "VOLÚMENES")}</small>
              <div style="font-size:1.35rem;color:var(--gold)">${p.done.length} <span class="muted" style="font-size:.82rem">/ ${p.to - p.from + 1} ${esc(p.statLabel || "listos")}</span></div>
            </div>
            <div class="vgrid" style="grid-template-columns:repeat(6,1fr)">${cells.join("")}</div>
            <div class="muted" style="font-size:.78rem;margin-top:6px">● Arco más reciente: Volumen ${p.current} (Cap. 70 · Bharani)</div>
          </div>
        </div>

        ${p.note ? `<div class="proj-note">${esc(p.note)}</div>` : ""}

        ${hList.length ? `
          <div class="proj-showcase" data-pidx="${idx}">
            <div class="proj-sh-head">
              <div>
                <div class="eyebrow" style="text-align:left;color:#d8b15a">${esc(h.arc)}</div>
                <h4 style="margin:4px 0 0;font-size:1.25rem;color:#f4e8c8">${esc(h.heading)}</h4>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <button type="button" class="ib" data-prev="${idx}" title="Anterior">‹</button>
                <span class="muted" style="font-family:Marcellus,serif;font-size:.78rem;min-width:54px;text-align:center">${curH + 1} de ${hList.length}</span>
                <button type="button" class="ib" data-next="${idx}" title="Siguiente">›</button>
              </div>
            </div>
            <div class="ba">
              <div>
                <small>${esc(h.leftTag)}</small>
                <p style="margin:0;line-height:1.65;white-space:pre-line">${esc(h.leftText)}</p>
              </div>
              <div class="ba-right">
                <small style="color:#8fd19e">${esc(h.rightTag)}</small>
                <p style="margin:0;line-height:1.65;white-space:pre-line">${esc(h.rightText)}</p>
              </div>
            </div>
          </div>` : ""}
      </div>`;
    }).join("");

  app.querySelectorAll("[data-prev]").forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.prev;
      const len = PROJECTS[i].highlights.length;
      projIdx[i] = ((projIdx[i] ?? 0) - 1 + len) % len;
      viewProjects();
    };
  });
  app.querySelectorAll("[data-next]").forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.next;
      const len = PROJECTS[i].highlights.length;
      projIdx[i] = ((projIdx[i] ?? 0) + 1) % len;
      viewProjects();
    };
  });
}

async function viewCredits() {
  const mf = await loadNovel();
  const chs = mf?.chapters || [];
  const totalWords = chs.reduce((a, c) => a + (c.words || 0), 0);

  const TEAM_ROLES = [
    {
      role: "HISTORIA ORIGINAL Y MUNDO",
      name: "WARYONI",
      sub: "Autor y creador del universo de Velztek",
      avatar: "novela/cover.jpg",
      desc: "Creación de la trama, el Gran Bosque de Aries, el sistema de los cinco clanes (Kraniel, Kitsune, Nillion, Urlier y Nevorv), la mitología de la sexta Diosa Veztel y los 84 capítulos e interludios publicados."
    },
    {
      role: "DIRECCIÓN Y EDICIÓN WEB",
      name: "Archivo de Velztek",
      sub: "Maquetación, adaptación y preservación digital",
      avatar: "novela/art/clan.jpg",
      desc: "Organización de la obra en 6 volúmenes encuadernados, limpieza tipográfica de las 84 partes del EPUB, compendio de glosario, sistema de cuentas de lector y sincronización de progreso."
    },
    {
      role: "ARTE E ILUSTRACIÓN DE PERSONAJES",
      name: "Vodka56789 (@Vodka_1953)",
      sub: "Ilustrador de portada, personajes y diseños de clanes",
      avatar: "novela/art/flor.jpg",
      desc: "Autor de la nueva portada oficial y de los diseños visuales de Nylie Kraniel, Diana Kraniel, Grania Gallard, los 39 clanes y bocetos conceptuales destacados en los especiales de WARYONI."
    },
    {
      role: "AUDIOLIBRO Y TECNOLOGÍA INTERACTIVA",
      name: "Motor Híbrido Neural",
      sub: "Narración por voz, búsqueda y lectura inmersiva",
      avatar: "novela/art/sketch2.jpg",
      desc: "Integración de consola flotante de audiolibro con voces neuronales en español, resaltado de párrafos en vivo, cuatro temas de papel y guardado automático de posición."
    }
  ];

  constTIMELINE = [
    { badge: "ORIGEN", title: "Publicación en Wattpad", detail: "Inicio de la travesía de Izaki y Nylie en el Gran Bosque de Aries bajo la pluma de WARYONI." },
    { badge: "PRIMERA ETAPA", title: "Capítulos 0 al 50 + Epílogos", detail: "Consolidación del clan Kraniel, el Torneo de Clases, la identidad de Nylie y el cierre del primer gran arco." },
    { badge: "ARCO ACTUAL", title: "Capítulos 51 al 70 · Carnero Carmesí", detail: "Expansión hacia el Aura, la Herencia, el duelo de carneros y las cuatro entidades estelares (Hamal, Bharani, Mesart y Botein)." },
    { badge: "EDICIÓN WEB", title: "Biblioteca Interactiva de Velztek", detail: "Lanzamiento de esta plataforma dedicada para leer, escuchar y guardar el progreso volumen a volumen." }
  ];

  app.innerHTML = head("Archivo de Velztek", "Créditos") + `
    <p class="muted" style="text-align:center;margin-top:-10px">Reconocimiento a quienes dan vida a la historia, el arte y la edición interactiva de Velztek.</p>

    <section class="panel cred-hero">
      <div class="cred-hero-art">
        <img src="novela/cover.jpg" alt="Velztek · WARYONI" class="cred-main-img">
        <span class="cred-seal">✦ OBRA AUTORIZADA</span>
      </div>
      <div class="cred-hero-body">
        <div class="eyebrow" style="text-align:left;color:#d8b15a">AUTORÍA PRINCIPAL · UNIVERSO ORIGINAL</div>
        <h2>WARYONI</h2>
        <p class="cred-quote">«Un bosque inmenso estaba delante de sus ojos y una vida nueva de la cual no se sabía quién era la protagonista. Dos almas unidas en busca de una nueva oportunidad en un mundo de fantasía.»</p>
        <p class="muted" style="line-height:1.65;margin:10px 0 16px">Esta plataforma fue creada con el permiso directo de su autor para ofrecer a los lectores de <b>Velztek</b> una experiencia de lectura digna de un libro de fantasía: sin anuncios, con seguimiento de capítulos, glosario del mundo y modo audiolibro.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="cta" href="https://www.wattpad.com/story/254954178-velztek" target="_blank" rel="noopener" style="margin:0">★ Apoyar la obra original en Wattpad →</a>
          <a class="ghost" href="#/novela" style="padding:12px 18px">Explorar los 6 Volúmenes</a>
        </div>
      </div>
    </section>

    <div class="cred-stats">
      <div class="stat-card"><small>CAPÍTULOS Y EXTRAS</small><b>${chs.length || 84}</b><span>Partes completas cargadas</span></div>
      <div class="stat-card"><small>EXTENSIÓN TOTAL</small><b>${(totalWords || 255000).toLocaleString("es")}</b><span>Palabras en español</span></div>
      <div class="stat-card"><small>VOLÚMENES WEB</small><b>6 Tomos</b><span>Con índice y audiolibro</span></div>
      <div class="stat-card"><small>LECTURA EN VOZ</small><b>~${Math.round((totalWords || 255000) / 12000)} h</b><span>Duración de audiolibro</span></div>
    </div>

    <section class="panel" style="margin-top:22px">
      <div class="eyebrow">EQUIPO Y PILARES DEL PROYECTO</div>
      <h3 style="text-align:center;font-size:1.55rem;margin:6px 0 20px;color:#f4e8c8">ROLES Y PRODUCCIÓN</h3>
      <div class="cred-grid">
        ${TEAM_ROLES.map(t => `
          <div class="cred-card">
            <div class="cred-card-head">
              <img src="${t.avatar}" alt="${esc(t.name)}" class="cred-ava">
              <div>
                <small>${esc(t.role)}</small>
                <h4>${esc(t.name)}</h4>
                <span>${esc(t.sub)}</span>
              </div>
            </div>
            <p>${esc(t.desc)}</p>
          </div>`).join("")}
      </div>
    </section>

    <section class="panel" style="margin-top:22px">
      <div class="eyebrow">HISTORIAL DE LA EDICIÓN</div>
      <h3 style="text-align:center;font-size:1.55rem;margin:6px 0 20px;color:#f4e8c8">CRONOLOGÍA DE VELZTEK</h3>
      <div class="cred-timeline">
        ${constTIMELINE.map(item => `
          <div class="tl-item">
            <span class="tl-badge">${esc(item.badge)}</span>
            <div>
              <b>${esc(item.title)}</b>
              <p class="muted" style="margin:4px 0 0;font-size:.92rem">${esc(item.detail)}</p>
            </div>
          </div>`).join("")}
      </div>
    </section>

    <section class="panel cred-legal" style="margin-top:22px;text-align:center">
      <div class="eyebrow">DERECHOS Y RECONOCIMIENTOS</div>
      <p class="muted" style="max-width:740px;margin:8px auto 0;font-size:.9rem;line-height:1.65">
        <b>Velztek</b>, sus personajes (<i>Nylie Kraniel, Izaki, Lylia, Diana Kraniel, Fayna Kitsune, Kelly Nillion, Azari, Sherat, Bharani</i> y demás integrantes de los clanes) e ilustraciones pertenecen a <b>WARYONI</b>. Sitio desarrollado sin fines de lucro para la comunidad de lectores.
      </p>
    </section>`;
}

let codexCat = "todos";
let codexQuery = "";
let codexSafeMode = false;

function viewCodex() {
  const rd = new Set(store.get("nread", []));
  const lastCap = store.get("nlastcap", 0) || 0;
  const maxUnlocked = Math.max(12, lastCap, ...(rd.size ? [...rd] : [12]));

  const cats = [
    ["todos", "✦ Todos (" + CODEX_ENTRIES.length + ")"],
    ["personajes", "👤 Personajes"],
    ["clanes", "🛡️ Los 5 Clanes"],
    ["bestiario", "🐺 Bestiario y Aries"],
    ["mundo", "✨ Magia y Mundo"]
  ];

  const q = codexQuery.trim().toLowerCase();
  const filtered = CODEX_ENTRIES.filter(item => {
    if (codexCat !== "todos" && item.cat !== codexCat) return false;
    if (q) {
      const hay = `${item.name} ${item.title} ${item.affiliation} ${item.magic} ${item.short} ${item.lore} ${(item.tags || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  app.innerHTML = head("Grimorio Oficial de Velztek", "Códice y Bestiario") + `
    <p class="muted" style="text-align:center;margin-top:-10px">Enciclopedia interactiva de personajes, los cinco grandes clanes, la sexta Diosa Veztel y las entidades de Aries.</p>

    <div class="panel codex-toolbar">
      <div class="codex-cats">
        ${cats.map(([k, label]) => `<button type="button" data-ccat="${k}" class="codex-tab ${codexCat === k ? "on" : ""}">${esc(label)}</button>`).join("")}
      </div>
      <div class="codex-controls">
        <input id="codex-search" class="finput" value="${esc(codexQuery)}" placeholder="🔎 Buscar personaje, clan, magia o estrella de Aries…" style="margin:0;flex:1;min-width:220px">
        <label class="codex-spoiler-toggle" title="Oculta detalles de capítulos que aún no has leído">
          <input type="checkbox" id="codex-safe" ${codexSafeMode ? "checked" : ""}>
          <span>🛡️ Filtro Anti-Spoilers (según mi lectura)</span>
        </label>
      </div>
    </div>

    <div class="codex-grid">
      ${filtered.map(item => {
        const isLocked = codexSafeMode && item.firstCap > maxUnlocked;
        const isSketch = /sketch/i.test(item.img);
        return `
          <article class="codex-card tier-${item.tier} ${isLocked ? "is-locked" : ""}" data-open-codex="${item.id}">
            <div class="codex-art-wrap">
              <img src="${item.img}" alt="${esc(item.name)}" class="codex-art ${isSketch ? "sketch-dark" : ""}">
              <div class="codex-art-shade"></div>
              <span class="codex-badge">${esc(item.catLabel)}</span>
              <span class="codex-cap-pill">📖 ${esc(item.capLabel)}</span>
            </div>
            <div class="codex-body">
              <h3>${esc(item.name)}</h3>
              <div class="codex-sub">${esc(item.title)}</div>
              ${isLocked ? `
                <p class="codex-desc locked-msg">🔒 Aparece más adelante en tu lectura (${esc(item.capLabel)}). Haz clic si deseas desbloquear su ficha ahora.</p>
              ` : `
                <p class="codex-desc">${esc(item.short)}</p>
                <div class="codex-meta">
                  <div><small>AFILIACIÓN</small><b>${esc(item.affiliation)}</b></div>
                  <div><small>PODER / DON</small><b>${esc(item.magic)}</b></div>
                </div>
                <div class="ptags" style="margin-top:10px">
                  ${(item.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}
                </div>
              `}
              <div class="codex-foot">
                <span class="codex-more-link">Abrir expediente completo →</span>
              </div>
            </div>
          </article>`;
      }).join("")}
    </div>

    <div id="codex-modal" class="codex-modal" hidden></div>`;

  app.querySelectorAll("[data-ccat]").forEach(btn => {
    btn.onclick = () => {
      codexCat = btn.dataset.ccat;
      viewCodex();
    };
  });

  const sInput = document.getElementById("codex-search");
  sInput.oninput = e => {
    codexQuery = e.target.value;
    const pos = sInput.selectionStart;
    viewCodex();
    const again = document.getElementById("codex-search");
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  };

  document.getElementById("codex-safe").onchange = e => {
    codexSafeMode = e.target.checked;
    viewCodex();
  };

  app.querySelectorAll("[data-open-codex]").forEach(card => {
    card.onclick = () => openCodexModal(card.dataset.openCodex);
  });
}

function openCodexModal(id) {
  const item = CODEX_ENTRIES.find(x => x.id === id);
  if (!item) return;
  const modal = document.getElementById("codex-modal");
  if (!modal) return;
  const isSketch = /sketch/i.test(item.img);
  modal.hidden = false;
  modal.innerHTML = `
    <div class="codex-dialog tier-${item.tier}">
      <button type="button" class="codex-close" id="codex-close" aria-label="Cerrar">✕</button>
      <div class="codex-dialog-grid">
        <div class="codex-dialog-art">
          <img src="${item.img}" alt="${esc(item.name)}" class="${isSketch ? "sketch-dark" : ""}">
          <div class="ptags" style="margin-top:12px;justify-content:center">
            ${(item.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}
          </div>
        </div>
        <div class="codex-dialog-info">
          <div class="eyebrow" style="text-align:left;color:#d8b15a">${esc(item.catLabel)}</div>
          <h2 style="margin:4px 0 4px;font-size:1.85rem;color:#f6ecd3">${esc(item.name)}</h2>
          <div style="color:var(--gold);font-family:Marcellus,serif;font-size:.9rem;margin-bottom:14px">${esc(item.title)}</div>

          <div class="codex-meta-box">
            <div><small>LINAJE / AFILIACIÓN</small><b>${esc(item.affiliation)}</b></div>
            <div><small>MAGIA / AFINIDAD</small><b>${esc(item.magic)}</b></div>
            <div><small>CAPÍTULO CLAVE</small><b>${esc(item.capLabel)}</b></div>
          </div>

          <div class="codex-lore-text">
            ${item.lore.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("")}
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
            <a class="cta" href="#/leer/${item.firstCap}" style="margin:0">📖 Leer su aparición (${esc(item.capLabel)}) →</a>
            <button type="button" class="ghost" id="codex-close-btn">Cerrar ficha</button>
          </div>
        </div>
      </div>
    </div>`;

  const close = () => { modal.hidden = true; modal.innerHTML = ""; };
  document.getElementById("codex-close").onclick = close;
  document.getElementById("codex-close-btn").onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
}

let mapMode = "continentes"; // "continentes" | "kraniel"
let selectedPinId = null;
let mapZoom = 1;

function viewWorldMap() {
  const nodes = WORLD_MAP_NODES[mapMode] || WORLD_MAP_NODES.continentes;
  if (!selectedPinId || !nodes.some(n => n.id === selectedPinId)) {
    selectedPinId = nodes[0].id;
  }
  const cur = nodes.find(n => n.id === selectedPinId) || nodes[0];
  const mapImgSrc = mapMode === "continentes" ? "novela/map-world.jpg" : "novela/map-kraniel.jpg";

  app.innerHTML = head("Cartografía Oficial de WARYONI", "Mapa del Mundo") + `
    <p class="muted" style="text-align:center;margin-top:-10px">Explora el Supercontinente Central (Juhne, Suyne y Aleria), los 39 Clanes Velztek, el Pueblo Kraen y el Gran Bosque de Aries.</p>

    <div class="panel map-switch-bar">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="codex-tab ${mapMode === "continentes" ? "on" : ""}" id="btn-map-world">🌍 Mapa Continental (Juhne, Suyne, Aleria y Galem)</button>
        <button type="button" class="codex-tab ${mapMode === "kraniel" ? "on" : ""}" id="btn-map-kraniel">🌲 Mapa Regional: Pueblo Kraen y Gran Bosque de Aries</button>
      </div>
      <a class="ghost" href="#/codice">📖 Ir al Códice de los 39 Clanes →</a>
    </div>

    <div class="map-layout">
      <div class="panel map-stage">
        <div class="map-viewport" id="map-viewport">
          <div class="map-zoom-controls">
            <button type="button" class="ib" id="mz-in" title="Acercar mapa">＋</button>
            <button type="button" class="ib" id="mz-out" title="Alejar mapa">－</button>
            <button type="button" class="ib" id="mz-reset" title="Vista 100%">1:1</button>
            <button type="button" class="ib" id="mz-full" title="Pantalla completa">⛶</button>
          </div>
          <div class="map-canvas" id="map-canvas" style="transform:scale(${mapZoom})">
            <img src="${mapImgSrc}" alt="Mapa de Velztek" class="wmap-img" draggable="false">
            ${nodes.map((n, idx) => `
              <button type="button" class="map-pin pin-${n.type} ${n.id === cur.id ? "active" : ""}"
                      style="left:${n.x}%;top:${n.y}%" data-pin="${n.id}" title="${esc(n.name)}">
                <span class="pin-pulse"></span>
                <span class="pin-num">${idx + 1}</span>
                <span class="pin-ico">${n.icon}</span>
                <span class="pin-tag">${esc(n.name.split("(")[0].trim())}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="map-index-strip">
          ${nodes.map((n, idx) => `
            <button type="button" class="map-idx-pill ${n.id === cur.id ? "on" : ""}" data-pin="${n.id}">
              <b>${idx + 1}</b> ${n.icon} <span>${esc(n.name.split("(")[0].trim())}</span>
            </button>
          `).join("")}
        </div>

        <div class="map-legend">
          <span><b style="color:#ffd479">●</b> Capital / Corazón</span>
          <span><b style="color:#7be0ff">●</b> Ciudad / Dominio de Clan</span>
          <span><b style="color:#ff7a90">●</b> Zona Prohibida / Rey Celestial</span>
          <span><b style="color:#75d9a3">●</b> Continente Vecino</span>
        </div>
      </div>

      <aside class="panel map-info-card">
        <div class="eyebrow" style="text-align:left;color:#d8b15a">${esc(cur.sub)}</div>
        <h2 style="margin:6px 0 12px;font-size:1.55rem;color:#f6ecd3">${cur.icon} ${esc(cur.name)}</h2>
        <p class="muted" style="line-height:1.68;font-size:.95rem;margin:0 0 16px">${esc(cur.desc)}</p>

        <div class="codex-meta-box" style="grid-template-columns:1fr">
          <div><small>AUTORIDAD / REGENTE</small><b>${esc(cur.ruler)}</b></div>
          <div><small>CLANES Y RAZAS EN LA REGIÓN</small><b>${esc(cur.clans)}</b></div>
          <div><small>PERSONAJES VINCULADOS</small><b>${esc(cur.chars)}</b></div>
          <div><small>REFERENCIA EN LA OBRA</small><b>${esc(cur.capLabel)}</b></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
          <a class="cta" href="#/leer/${cur.cap}" style="margin:0;text-align:center">📖 Ir a ${esc(cur.capLabel)} →</a>
          ${mapMode === "continentes" && (cur.id === "bosque-aries-pin" || cur.id === "pueblo-kraen") ? `
            <button type="button" class="ghost" id="btn-zoom-kraniel" style="width:100%;padding:10px">🔍 Ver de cerca el Mapa de Kraen y el Bosque de Aries</button>
          ` : ""}
        </div>
      </aside>
    </div>`;

  document.getElementById("btn-map-world").onclick = () => {
    mapMode = "continentes";
    mapZoom = 1;
    selectedPinId = WORLD_MAP_NODES.continentes[0].id;
    viewWorldMap();
  };
  document.getElementById("btn-map-kraniel").onclick = () => {
    mapMode = "kraniel";
    mapZoom = 1;
    selectedPinId = WORLD_MAP_NODES.kraniel[0].id;
    viewWorldMap();
  };
  const zoomBtn = document.getElementById("btn-zoom-kraniel");
  if (zoomBtn) {
    zoomBtn.onclick = () => {
      mapMode = "kraniel";
      mapZoom = 1;
      selectedPinId = cur.id === "bosque-aries-pin" ? "isla-nylie" : "mansion-diana";
      viewWorldMap();
    };
  }

  const canvas = document.getElementById("map-canvas");
  const applyZoom = z => {
    mapZoom = Math.max(1, Math.min(2.4, +z.toFixed(2)));
    if (canvas) canvas.style.transform = `scale(${mapZoom})`;
  };
  document.getElementById("mz-in").onclick = () => applyZoom(mapZoom + 0.35);
  document.getElementById("mz-out").onclick = () => applyZoom(mapZoom - 0.35);
  document.getElementById("mz-reset").onclick = () => applyZoom(1);
  document.getElementById("mz-full").onclick = () => {
    const vp = document.getElementById("map-viewport");
    if (!document.fullscreenElement && vp?.requestFullscreen) vp.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  app.querySelectorAll("[data-pin]").forEach(btn => {
    btn.onclick = () => {
      selectedPinId = btn.dataset.pin;
      viewWorldMap();
    };
  });
}

// ---------- router ----------
const NAV = [["#/", "Inicio"], ["#/novela", "Novela"], ["#/mapa", "Mapa"], ["#/codice", "Códice"], ["#/arte", "Arte"], ["#/descargas", "Descargas"], ["#/proyectos", "Proyectos"], ["#/creditos", "Créditos"]];
function route() {
  const h = location.hash || "#/";
  const [r, a] = h.slice(2).split("/");
  const activeKey = ["volumen", "leer"].includes(r) ? "novela" : (r || "");
  document.getElementById("links").innerHTML = NAV.map(([href, l]) => `<a href="${href}" class="${(href.slice(2) || "") === activeKey ? "on" : ""}">${l}</a>`).join("");
  if (r === "novela") viewNovelsHub(+a || 1);
  else if (r === "volumen") viewNovelVolume(+a || 1);
  else if (r === "leer") viewLeer(+a || 1);
  else if (r === "mapa") viewWorldMap();
  else if (r === "codice") viewCodex();
  else if (r === "arte") viewArt();
  else if (r === "cuenta") renderAuthView();
  else if (r === "descargas") viewDownloads();
  else if (r === "proyectos") viewProjects();
  else if (r === "creditos") viewCredits();
  else viewHome();
  if (typeof updateHeaderAccountBtn === "function") updateHeaderAccountBtn();
}
document.getElementById("back").onclick = () => history.back();
addEventListener("hashchange", route);
route();
