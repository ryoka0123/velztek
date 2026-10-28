// Novela: catálogo de novelas/volúmenes, libro ornamentado, lector con guardado de posición y marcadores.
let NOVEL = null;
let scrollHandler = null;

async function loadNovel() {
  if (NOVEL) return NOVEL;
  try { NOVEL = await (await fetch("novela/manifest.json")).json(); } catch { NOVEL = false; }
  return NOVEL;
}
const novelCover = n => n.cover || ph(n.title, n.author || "", n.hue || 175);
const fmtTime = w => { const m = Math.max(1, Math.round(w / 200)); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
let novelTab = "capitulos";

function parseChapTitle(raw, idx) {
  const s = String(raw || "").trim();
  const m = s.match(/^\(\s*Cap[ií]tulo\s*(\d+)\s*\)\s*(.*)$/i);
  if (m) {
    const num = +m[1];
    const sub = m[2].trim();
    if (num === 0) return { badge: "PRÓLOGO", name: sub || "Capítulo 0", short: "CAP. 00", isExtra: false };
    return { badge: `CAPÍTULO ${num}`, name: sub || `Capítulo ${num}`, short: `CAP. ${String(num).padStart(2, "0")}`, isExtra: false };
  }
  return { badge: "EXTRA", name: s + " ★", short: "EXTRA", isExtra: true };
}

function volOfChapter(cn) {
  const v = NOVEL_SERIES[0].volumes.find(x => cn >= x.from && cn <= x.to);
  return v ? v.n : 1;
}

const CORNER_SVG = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 62 V14 C2 6 6 2 14 2 H62"/><path d="M8 54 V18 C8 11 11 8 18 8 H54" opacity=".65"/><path d="M2 26 C14 26 26 14 26 2"/><path d="M14 14 L22 22 M14 22 C19 22 22 19 22 14"/><circle cx="10" cy="10" r="2.2" fill="currentColor"/><circle cx="30" cy="6" r="1.4" fill="currentColor"/><circle cx="6" cy="30" r="1.4" fill="currentColor"/></svg>`;

function pageFrame(content, extraClass = "") {
  return `<div class="page ${extraClass}"><div class="pframe">
    <i class="orn tl">${CORNER_SVG}</i><i class="orn tr">${CORNER_SVG}</i>
    <i class="orn bl">${CORNER_SVG}</i><i class="orn br">${CORNER_SVG}</i>
    ${content}
  </div></div>`;
}

// Vista 1: Catálogo de Novelas (carrusel superior + ficha + cuadrícula de los 6 volúmenes)
async function viewNovelsHub(sid = 1) {
  const mf = await loadNovel();
  const s = NOVEL_SERIES.find(x => x.id === sid) || NOVEL_SERIES[0];
  const rd = new Set(store.get("nread", []));
  const chs = mf?.chapters || [];
  const lastCap = store.get("nlastcap", null);
  const resumeCh = (lastCap && chs.find(c => c.n === lastCap)) || chs.find(c => !rd.has(c.n)) || chs[0] || { n: 1, title: "(Capítulo 0)" };
  const nextParsed = parseChapTitle(resumeCh.title, resumeCh.n);
  const nextVol = volOfChapter(resumeCh.n);
  const totalWords = chs.reduce((a, c) => a + (c.words || 0), 0);
  const pctTotal = chs.length ? Math.round((rd.size / chs.length) * 100) : 0;

  app.innerHTML = head("Archivo de Velztek", "Novelas") + `
    <div class="carousel">
      ${NOVEL_SERIES.map(x => `
        <a class="thumb ${x.id === s.id ? "on" : ""}" href="#/novela/${x.id}">
          <img src="${novelCover(x)}" alt="${esc(x.title)}">
          <div>${esc(x.title)}</div>
        </a>`).join("")}
    </div>
    <div class="panel">
      <div class="series-head">
        <div style="flex:1;min-width:260px">
          <span class="eyebrow" style="text-align:left">${esc(s.type)}</span>
          <span class="badge">✓ ${esc(s.status)}</span>
          <h2>${esc(s.title)}</h2>
          <p class="muted">${esc(s.desc)}</p>
          <p class="muted" style="font-size:.85rem">Progreso general: <b style="color:var(--gold)">${rd.size} / ${chs.length} capítulos leídos (${pctTotal}%)</b> · ${totalWords.toLocaleString("es")} palabras</p>
        </div>
        <div style="min-width:230px">
          <div class="eyebrow" style="text-align:left">${rd.size || lastCap ? "Tu lectura guardada" : "Inicio de la obra"}</div>
          <p style="color:var(--gold);margin:6px 0 2px;font-weight:600">${esc(nextParsed.name)}</p>
          <div class="muted" style="font-size:.82rem;margin-bottom:8px">Volumen ${nextVol} · ${esc(nextParsed.badge)}</div>
          <a class="cta" href="#/leer/${resumeCh.n}">${rd.size || lastCap ? "Continuar donde quedé" : "Comenzar lectura"} →</a>
          <div class="muted" style="font-size:.82rem;margin-top:6px"><a href="#/cuenta" style="text-decoration:underline">Gestionar mi progreso (${pctTotal}%)</a></div>
        </div>
      </div>
      <div class="vols">
        ${s.volumes.map(v => {
          const inVol = chs.filter(c => c.n >= v.from && c.n <= v.to);
          const doneInVol = inVol.filter(c => rd.has(c.n)).length;
          const vPct = inVol.length ? Math.round((doneInVol / inVol.length) * 100) : 0;
          const vCover = v.cover || ph(s.title, "Volumen " + v.n, s.hue + v.n * 18);
          return `<a class="vol" href="#/volumen/${v.n}">
            <img src="${vCover}" alt="Volumen ${v.n}">
            <span class="new">${vPct > 0 ? `${vPct}% LEÍDO` : `${inVol.length} PARTES`}</span>
            <div class="cap">VOLUMEN ${v.n}<small>${esc(v.label || `${inVol.length} CAPÍTULOS`)}</small></div>
          </a>`;
        }).join("")}
      </div>
    </div>`;
}

// Vista 2: Libro antiguo abierto de un Volumen (#/volumen/1..6) con clic para marcar/desmarcar capítulos
async function viewNovelVolume(vn = 1) {
  const n = await loadNovel();
  if (!n) { app.innerHTML = head("Novela", "Sin datos") + `<div class="panel muted">No se pudo leer novela/manifest.json. Abre la página desde el servidor (http://localhost:8000).</div>`; return; }
  const vols = NOVEL_SERIES[0].volumes;
  const volMeta = vols.find(v => v.n === vn) || vols[0];
  const rd = new Set(store.get("nread", []));
  const allChs = n.chapters;
  const chs = allChs.filter(c => c.n >= volMeta.from && c.n <= volMeta.to);
  const listToShow = chs.length ? chs : allChs;
  const next = listToShow.find(c => !rd.has(c.n)) || listToShow[0];
  const nextParsed = next ? parseChapTitle(next.title, next.n) : { badge: "VOLUMEN", name: n.title };
  const done = listToShow.filter(c => rd.has(c.n)).length;
  const pct = listToShow.length ? Math.round(done / listToShow.length * 100) : 0;
  const words = listToShow.reduce((a, c) => a + (c.words || 0), 0);
  const extrasCount = listToShow.filter(c => parseChapTitle(c.title, c.n).isExtra).length;
  const mainCount = listToShow.length - extrasCount;
  const last = store.get("nlast", null);
  const savedSet = new Set(store.get("savedVols", []));
  const saved = savedSet.has(volMeta.n);
  const tabs = [["capitulos", "Capítulos"], ["creditos", "Créditos"], ["glosario", "Glosario"]];
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][volMeta.n - 1] || volMeta.n;

  let leftPage, rightPage;
  if (novelTab === "creditos") {
    leftPage = pageFrame(`
      <h2 class="ptitle">✦ Créditos ✦</h2>
      <div class="psub">✦ EQUIPO Y EDICIÓN ✦</div>
      <div class="pbody" style="margin-top:18px">
        <div class="cred-item"><small>AUTORÍA ORIGINAL</small><b>${esc(n.author)}</b></div>
        ${(n.credits || []).map(c => {
          const [k, v] = c.includes(":") ? c.split(":") : ["COLABORACIÓN", c];
          return `<div class="cred-item"><small>${esc(k.trim())}</small><b>${esc((v || "").trim())}</b></div>`;
        }).join("")}
      </div>`, "p-left");
    rightPage = pageFrame(`
      <h2 class="ptitle">✦ Sobre la obra ✦</h2>
      <div class="prule"><span>SINOPSIS</span></div>
      <p class="pbody" style="white-space:pre-line;line-height:1.75;text-align:justify">${esc(n.synopsis)}</p>
      <div class="prule" style="margin-top:20px"><span>ETIQUETAS</span></div>
      <div class="ptags">${(n.tags || []).map(t => `<span>#${esc(t)}</span>`).join("")}</div>`, "p-right");
  } else if (novelTab === "glosario") {
    const g = n.glossary || [];
    const half = Math.ceil(g.length / 2);
    const renderG = list => list.length ? list.map(x => `<div class="gloss-item"><b>✦ ${esc(x.term)}</b><p>${esc(x.def)}</p></div>`).join("") : `<p style="text-align:center;opacity:.7">Sin términos registrados.</p>`;
    leftPage = pageFrame(`<h2 class="ptitle">✦ Glosario ✦</h2><div class="psub">✦ TÉRMINOS DEL MUNDO ✦</div><div class="pbody">${renderG(g.slice(0, half))}</div>`, "p-left");
    rightPage = pageFrame(`<h2 class="ptitle">✦ Notas ✦</h2><div class="psub">✦ ARCHIVO DE VELZTEK ✦</div><div class="pbody">${renderG(g.slice(half))}</div>`, "p-right");
  } else {
    leftPage = pageFrame(`
      <h2 class="ptitle">✦ Volumen ${roman} ✦</h2>
      <div class="psub">✦ CAPÍTULOS (TOCA EL CÍRCULO PARA MARCAR LEÍDO) ✦</div>
      <div class="pbody chl">${listToShow.map(c => {
        const pt = parseChapTitle(c.title, c.n);
        const isCurrent = next && next.n === c.n;
        const isRead = rd.has(c.n);
        const scrollMap = store.get("nscroll", {});
        const sPct = scrollMap[c.n] ? Math.round(scrollMap[c.n] * 100) : 0;
        return `<div class="ch-row ${isCurrent ? "active" : ""}">
          <a href="#/leer/${c.n}" class="ch-link">
            <small>✦ ${esc(pt.badge)} ${sPct > 2 && sPct < 95 ? `· <em>(${sPct}% leído)</em>` : ""}</small>
            <b>${esc(pt.name)}</b>
          </a>
          <button type="button" class="dot ${isRead ? "read" : ""}" data-toggle="${c.n}" title="${isRead ? "Marcar como no leído" : "Marcar como leído (y anteriores)"}"></button>
        </div>`;
      }).join("")}</div>
      <div style="display:flex;gap:8px;justify-content:space-between;border-top:1px solid rgba(138,101,48,.35);margin-top:8px;padding-top:8px">
        <button class="btn-l" id="markallvol" style="font-size:.78rem;padding:4px">${done === listToShow.length ? "↺ Desmarcar volumen" : "✓ Marcar todo el volumen leído"}</button>
        <button class="btn-l" id="savevol" style="font-size:.78rem;padding:4px">${saved ? "✓ Guardado offline" : "⬇ Guardar volumen"}</button>
      </div>`, "p-left");

    rightPage = pageFrame(`
      <h2 class="ptitle">✦ ${esc(nextParsed.badge)} ✦</h2>
      <div class="prule"><span>PROGRESO DE LECTURA</span></div>
      <div class="prog">
        <div class="ringb" style="--p:${pct}"><span><b>${pct}%</b><small>COMPLETADO</small></span></div>
        <div class="kv">
          <small>LECTURA ACTUAL</small><b>${done ? esc(nextParsed.name) : "Sin empezar"}</b>
          <small>TIEMPO ESTIMADO</small><b>${words ? fmtTime(words) : "—"}</b>
          <small>ÚLTIMA LECTURA</small><b>${last || "Nunca"}</b>
        </div>
      </div>
      <div class="prule" style="margin-top:18px"><span>INFORMACIÓN</span></div>
      <div class="prog info-block">
        <img src="${volMeta.cover || novelCover(n)}" alt="" class="ncover">
        <div class="kv">
          <small>ÚLTIMA ACTUALIZACIÓN</small><b>${esc(n.updated || "—")}</b>
          <small>FECHA DE PUBLICACIÓN</small><b>${esc(n.published || "—")}</b>
          <small>CAPÍTULOS</small><b>${mainCount}${extrasCount ? ` (+${extrasCount} extra${extrasCount > 1 ? "s" : ""})` : ""}</b>
          <small>PALABRAS</small><b>${words ? words.toLocaleString("es") : "—"}</b>
          <small>VOLUMEN</small><b>${volMeta.n} de ${vols.length}</b>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <a class="book-cta" href="#/leer/${next ? next.n : 1}">${done ? "Continuar lectura" : "Comenzar lectura"} →</a>
      </div>`, "p-right");
  }

  app.innerHTML = `
    <div class="book-top-bar">
      <div class="edition-box"><span>AUTORA</span><b>${esc(n.author)}</b><em class="ed-tag">Vol. ${volMeta.n}/${vols.length}</em></div>
      <div class="ntabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${k === novelTab ? "on" : ""}">${l}</button>`).join("")}</div>
    </div>
    <div class="tome-wrap">
      <div class="tome">
        <i class="mc tl"></i><i class="mc tr"></i><i class="mc bl"></i><i class="mc br"></i>
        ${leftPage}
        <div class="spine"><div class="ribbon"></div></div>
        ${rightPage}
      </div>
      <div class="nav" style="margin-top:18px">
        ${volMeta.n > 1 ? `<a class="ghost" href="#/volumen/${volMeta.n - 1}">‹ Volumen ${volMeta.n - 1}</a>` : `<span></span>`}
        <a class="ghost" href="#/novela">☰ Todos los volúmenes (1–${vols.length})</a>
        ${volMeta.n < vols.length ? `<a class="ghost" href="#/volumen/${volMeta.n + 1}">Volumen ${volMeta.n + 1} ›</a>` : `<span></span>`}
      </div>
    </div>`;

  app.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { novelTab = b.dataset.t; viewNovelVolume(vn); });
  app.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.onclick = e => {
      e.preventDefault(); e.stopPropagation();
      const targetN = +btn.dataset.toggle;
      const set = new Set(store.get("nread", []));
      if (set.has(targetN)) set.delete(targetN);
      else set.add(targetN);
      store.set("nread", [...set]); if (typeof syncProgressToUser === "function") syncProgressToUser();
      store.set("nlast", new Date().toLocaleDateString("es"));
      store.set("nlastcap", targetN);
      viewNovelVolume(vn);
    };
  });
  const ma = document.getElementById("markallvol");
  if (ma) ma.onclick = () => {
    const set = new Set(store.get("nread", []));
    const allDone = listToShow.every(c => set.has(c.n));
    listToShow.forEach(c => allDone ? set.delete(c.n) : set.add(c.n));
    store.set("nread", [...set]); if (typeof syncProgressToUser === "function") syncProgressToUser();
    store.set("nlast", new Date().toLocaleDateString("es"));
    viewNovelVolume(vn);
  };
  const sv = document.getElementById("savevol");
  if (sv) sv.onclick = () => {
    const s = new Set(store.get("savedVols", []));
    s.has(volMeta.n) ? s.delete(volMeta.n) : s.add(volMeta.n);
    store.set("savedVols", [...s]);
    viewNovelVolume(vn);
  };
}

const THEMES = { claro: ["#ffffff", "#222222"], sepia: ["#f3e3c6", "#35281b"], gris: ["#2c2c30", "#dcdce0"], negro: ["#0e0e10", "#c9c9cc"] };
const FONTS = { serif: "Lora, Georgia, serif", sans: "system-ui, Arial, sans-serif", marcellus: "Marcellus, serif" };
const readerCfg = () => ({ theme: "sepia", size: 19, font: "serif", lh: 1.85, ...store.get("rcfg", {}) });

async function viewLeer(cn) {
  if (scrollHandler) { window.removeEventListener("scroll", scrollHandler); scrollHandler = null; }
  const n = await loadNovel();
  const i = n ? n.chapters.findIndex(c => c.n === cn) : -1;
  if (i < 0) return viewNovelVolume(1);
  const c = n.chapters[i];
  const pt = parseChapTitle(c.title, c.n);
  const vNum = volOfChapter(c.n);
  app.innerHTML = `<div class="panel muted">Cargando…</div>`;
  let text;
  try { text = await (await fetch("novela/" + c.file)).text(); } catch { text = "No se pudo cargar el capítulo."; }
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const body = lines.slice(1).join("\n").split(/\n\s*\n/).filter(p => p.trim()).map(p => {
    const t = p.trim();
    if (/^(\*\s*\*\s*\*|-+)$/.test(t)) return `<div class="scene-sep">═══ ✦ ✦ ═══</div>`;
    return `<p>${esc(t).replace(/\n/g, "<br>")}</p>`;
  }).join("");
  const wordCount = c.words || body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

  // Guardar lectura actual y fecha
  const rd = new Set(store.get("nread", [])); rd.add(cn); store.set("nread", [...rd]); if (typeof syncProgressToUser === "function") syncProgressToUser();
  store.set("nlast", new Date().toLocaleDateString("es"));
  store.set("nlastcap", cn);

  const prev = n.chapters[i - 1], nxt = n.chapters[i + 1];
  const cfg = readerCfg();
  const bookmarks = new Set(store.get("nbookmarks", []));
  const isBm = bookmarks.has(cn);

  app.innerHTML = `
    <div class="read-progress"><div class="read-progress-bar" id="rpbar"></div></div>
    <div class="rbar">
      <div class="rnav-pill">
        ${prev ? `<a class="rnav-arrow" href="#/leer/${prev.n}" title="Capítulo anterior">‹</a>` : `<span class="rnav-arrow off">‹</span>`}
        <div class="rnav-center">
          <small>${esc(n.author)} · ${esc(pt.short)}</small>
          <b>${esc(pt.name.toUpperCase())}</b>
          <span class="chev">▾</span>
          <select id="chsel" aria-label="Seleccionar capítulo">${n.chapters.map(x => {
            const xp = parseChapTitle(x.title, x.n);
            const doneMark = rd.has(x.n) ? "✓ " : "";
            return `<option value="${x.n}" ${x.n === cn ? "selected" : ""}>${doneMark}${esc(xp.badge)} · ${esc(xp.name)}</option>`;
          }).join("")}</select>
        </div>
        ${nxt ? `<a class="rnav-arrow" href="#/leer/${nxt.n}" title="Capítulo siguiente">›</a>` : `<span class="rnav-arrow off">›</span>`}
      </div>
      <div class="rbar-tools">
        <button class="ib ${isBm ? "active" : ""}" id="btnbm" title="Guardar marcador en este capítulo"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
        <button class="ib" id="btnsearch" title="Buscar en el capítulo"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>
        <a class="ib" href="#/volumen/${vNum}" title="Abrir libro del Volumen ${vNum}"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></a>
        <button class="ib" id="btnshare" title="Copiar enlace"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>
        <button class="ib" id="btntts" title="Lectura en voz alta"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg></button>
        <button class="ib" id="gear" title="Ajustes de lectura"><svg viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.5"/><circle cx="15" cy="17" r="2.5"/></svg></button>
        <button class="ib" id="btnfs" title="Pantalla completa"><svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg></button>
      </div>
    </div>
    <div class="search-bar" id="sbar" hidden>
      <input id="sinput" placeholder="Buscar palabra en este capítulo…">
      <span id="scount" class="muted" style="font-size:.8rem"></span>
      <button class="ib" id="sclose">✕</button>
    </div>
    <div class="sheet" id="sheet">
      <h1>${esc(pt.name.toUpperCase())}</h1>
      <div class="meta">${esc(pt.badge)} &nbsp;·&nbsp; ${wordCount.toLocaleString("es")} PALABRAS &nbsp;·&nbsp; ${fmtTime(wordCount).toUpperCase()} &nbsp;·&nbsp; <span id="spct">0%</span></div>
      <div class="scene-sep">══════ ✦ ★ ${esc(n.title.toUpperCase())} ★ ✦ ══════</div>
      <article id="txt">${body}</article>
      <div class="nav" style="margin-top:36px">${prev ? `<a class="ghost" href="#/leer/${prev.n}">‹ Anterior</a>` : "<span></span>"}<a class="ghost" href="#/volumen/${vNum}">✦ Volver al Volumen ${vNum}</a>${nxt ? `<a class="ghost" href="#/leer/${nxt.n}">Siguiente ›</a>` : "<span></span>"}</div>
    </div>
    <aside class="settings" id="settings"><div class="sh"><div><small>LECTOR DE NOVELA</small><h3>Ajustes de lectura</h3></div><button class="ib" id="closeset">✕</button></div>
      <h4>Fondo y brillo</h4><div class="swatches">${Object.keys(THEMES).map(k => `<button data-th="${k}" style="background:${THEMES[k][0]};color:${THEMES[k][1]}" class="${k === cfg.theme ? "on" : ""}">Aa<br><small>${k[0].toUpperCase() + k.slice(1)}</small></button>`).join("")}</div>
      <h4>Tipografía</h4><select id="fontsel">${Object.keys(FONTS).map(k => `<option value="${k}" ${k === cfg.font ? "selected" : ""}>${k === "serif" ? "Serif (Lora)" : k === "sans" ? "Sans-serif" : "Marcellus"}</option>`).join("")}</select>
      <h4>Tamaño de letra: <span id="sv">${cfg.size}</span>px</h4><input type="range" id="size" min="14" max="30" value="${cfg.size}">
      <h4>Interlineado: <span id="lv">${cfg.lh}</span></h4><input type="range" id="lh" min="1.3" max="2.4" step="0.05" value="${cfg.lh}">
      <button class="book-cta" id="done" style="width:100%;margin-top:22px">Volver a leer</button></aside>`;

  const sheet = document.getElementById("sheet"), txt = document.getElementById("txt");
  const apply = () => {
    const g = readerCfg(), [bg, fg] = THEMES[g.theme];
    sheet.style.background = bg; sheet.style.color = fg;
    txt.style.fontSize = g.size + "px"; txt.style.lineHeight = g.lh; txt.style.fontFamily = FONTS[g.font];
  };
  const save = patch => { store.set("rcfg", { ...readerCfg(), ...patch }); apply(); };
  apply();

  const panel = document.getElementById("settings");
  const toggle = open => panel.classList.toggle("open", open);
  document.getElementById("gear").onclick = () => toggle(!panel.classList.contains("open"));
  document.getElementById("closeset").onclick = document.getElementById("done").onclick = () => toggle(false);
  document.getElementById("chsel").onchange = e => location.hash = "#/leer/" + e.target.value;
  document.getElementById("fontsel").onchange = e => save({ font: e.target.value });
  document.getElementById("size").oninput = e => { document.getElementById("sv").textContent = e.target.value; save({ size: +e.target.value }); };
  document.getElementById("lh").oninput = e => { document.getElementById("lv").textContent = e.target.value; save({ lh: +e.target.value }); };
  panel.querySelectorAll("[data-th]").forEach(b => b.onclick = () => { save({ theme: b.dataset.th }); panel.querySelectorAll("[data-th]").forEach(x => x.classList.toggle("on", x === b)); });

  // Marcador del capítulo
  document.getElementById("btnbm").onclick = e => {
    const bm = new Set(store.get("nbookmarks", []));
    bm.has(cn) ? bm.delete(cn) : bm.add(cn);
    store.set("nbookmarks", [...bm]); if (typeof syncProgressToUser === "function") syncProgressToUser();
    e.currentTarget.classList.toggle("active", bm.has(cn));
  };

  document.getElementById("btnfs").onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  document.getElementById("btnshare").onclick = async e => {
    try { await navigator.clipboard.writeText(location.href); e.currentTarget.style.borderColor = "#c89b3c"; } catch {}
  };
  document.getElementById("btntts").onclick = e => {
    if (!("speechSynthesis" in window)) return;
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); e.currentTarget.classList.remove("active"); return; }
    const u = new SpeechSynthesisUtterance(txt.innerText); u.lang = "es-ES";
    u.onend = () => e.currentTarget.classList.remove("active");
    e.currentTarget.classList.add("active"); speechSynthesis.speak(u);
  };
  const sbar = document.getElementById("sbar"), sinput = document.getElementById("sinput"), scount = document.getElementById("scount");
  const baseHTML = body;
  document.getElementById("btnsearch").onclick = () => { sbar.hidden = !sbar.hidden; if (!sbar.hidden) sinput.focus(); };
  document.getElementById("sclose").onclick = () => { sbar.hidden = true; txt.innerHTML = baseHTML; scount.textContent = ""; };
  sinput.oninput = () => {
    const q = sinput.value.trim();
    if (q.length < 2) { txt.innerHTML = baseHTML; scount.textContent = ""; return; }
    let hits = 0;
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    txt.innerHTML = baseHTML.replace(/>([^<]+)</g, (m, seg) => ">" + seg.replace(rx, match => { hits++; return `<mark>${match}</mark>`; }) + "<");
    scount.textContent = `${hits} coincidencia(s)`;
  };

  // Restaurar posición de lectura exacta en este capítulo y guardar progreso al bajar
  const scrollMap = store.get("nscroll", {});
  const savedRatio = scrollMap[cn] || 0;
  setTimeout(() => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (savedRatio > 0.03 && savedRatio < 0.95) window.scrollTo({ top: savedRatio * maxScroll, behavior: "smooth" });
    else window.scrollTo(0, 0);
  }, 60);

  const rpbar = document.getElementById("rpbar"), spct = document.getElementById("spct");
  scrollHandler = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    if (rpbar) rpbar.style.width = (ratio * 100).toFixed(1) + "%";
    if (spct) spct.textContent = Math.round(ratio * 100) + "%";
    const map = store.get("nscroll", {});
    map[cn] = +ratio.toFixed(3);
    store.set("nscroll", map); if (typeof syncProgressToUser === "function") syncProgressToUser();
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
}

// Vista 3: Mi Cuenta / Registro de lectura (#/cuenta) con código portable para pasar entre celular y PC
async function viewAccount() {
  const n = await loadNovel();
  const chs = n?.chapters || [];
  const rd = new Set(store.get("nread", []));
  const bms = store.get("nbookmarks", []);
  const profile = store.get("nprofile", { name: "Viajero Kraniel" });
  const lastCap = store.get("nlastcap", null);
  const lastDate = store.get("nlast", "Nunca");
  const lastChObj = chs.find(c => c.n === lastCap) || chs.find(c => !rd.has(c.n)) || chs[0];
  const lastPt = lastChObj ? parseChapTitle(lastChObj.title, lastChObj.n) : { badge: "CAP. 0", name: "Capítulo 0" };
  const pct = chs.length ? Math.round((rd.size / chs.length) * 100) : 0;
  const wordsRead = chs.filter(c => rd.has(c.n)).reduce((a, c) => a + (c.words || 0), 0);

  // Generar código portable en base64 con todo el progreso del lector
  const exportPayload = {
    p: profile,
    r: [...rd],
    b: bms,
    l: lastCap,
    d: lastDate,
    s: store.get("nscroll", {})
  };
  const syncCode = btoa(unescape(encodeURIComponent(JSON.stringify(exportPayload))));

  app.innerHTML = head("Registro del Lector", "Mi Cuenta") + `
    <div class="panel">
      <div class="series-head">
        <div style="flex:1;min-width:250px">
          <div class="eyebrow" style="text-align:left">PERFIL DE LECTURA</div>
          <div style="display:flex;gap:10px;align-items:center;margin:8px 0 12px;flex-wrap:wrap">
            <input id="profname" value="${esc(profile.name)}" placeholder="Tu apodo de lector…" style="font-size:1.25rem;padding:6px 12px;background:#0d1222;color:var(--ink);border:1px solid var(--line);border-radius:8px;font-family:Marcellus,serif">
            <button class="ghost" id="savename">Guardar apodo</button>
          </div>
          <p class="muted">Tu progreso se guarda automáticamente en este navegador. Además puedes marcar hasta qué capítulo vas o copiar tu <b>Código de Sincronización</b> para continuar en otro dispositivo (celular o PC).</p>
        </div>
        <div style="min-width:230px">
          <div class="eyebrow" style="text-align:left">CONTINUAR LECTURA</div>
          <p style="color:var(--gold);margin:6px 0 2px;font-weight:600">${esc(lastPt.badge)} · ${esc(lastPt.name)}</p>
          <div class="muted" style="font-size:.82rem;margin-bottom:8px">Última sesión: ${esc(lastDate)}</div>
          <a class="cta" href="#/leer/${lastChObj ? lastChObj.n : 1}">Ir a mi capítulo actual →</a>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin:22px 0">
        <div class="stat-card"><small>PROGRESO TOTAL</small><b>${pct}%</b><span>${rd.size} de ${chs.length} partes</span></div>
        <div class="stat-card"><small>PALABRAS LEÍDAS</small><b>${wordsRead.toLocaleString("es")}</b><span>Tiempo aprox. ${fmtTime(wordsRead)}</span></div>
        <div class="stat-card"><small>MARCADORES</small><b>${bms.length}</b><span>Capítulos destacados</span></div>
      </div>

      <div style="border-top:1px solid var(--line);padding-top:20px;margin-top:10px">
        <h3 style="margin:0 0 8px">✦ ¿En qué capítulo vas? (Marcar rápido)</h3>
        <p class="muted" style="margin:0 0 12px;font-size:.9rem">Si ya habías leído en Wattpad, elige hasta qué capítulo llegaste y marcaremos todos los anteriores como leídos:</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <select id="uptosel" style="flex:1;min-width:220px;padding:9px;background:#0d1222;color:var(--ink);border:1px solid var(--line);border-radius:8px;font-family:Marcellus,serif">
            ${chs.map(c => {
              const pt = parseChapTitle(c.title, c.n);
              return `<option value="${c.n}" ${c.n === lastCap ? "selected" : ""}>#${c.n} · ${esc(pt.badge)} — ${esc(pt.name)}</option>`;
            }).join("")}
          </select>
          <button class="cta" id="btnupto" style="margin:0">✓ Marcar leídos hasta aquí</button>
          <button class="ghost" id="btnreset">Reiniciar todo a 0%</button>
        </div>
      </div>

      ${bms.length ? `<div style="border-top:1px solid var(--line);padding-top:20px;margin-top:22px">
        <h3 style="margin:0 0 10px">✦ Tus Marcadores Guardados</h3>
        ${bms.map(cn => {
          const ch = chs.find(x => x.n === cn);
          if (!ch) return "";
          const pt = parseChapTitle(ch.title, ch.n);
          return `<div class="dl"><a href="#/leer/${ch.n}"><b>${esc(pt.badge)}</b> — ${esc(pt.name)}</a><a class="ghost" href="#/leer/${ch.n}">Leer →</a></div>`;
        }).join("")}
      </div>` : ""}

      <div style="border-top:1px solid var(--line);padding-top:20px;margin-top:22px">
        <h3 style="margin:0 0 8px">✦ Pasar mi progreso a otro dispositivo (Código de respaldo)</h3>
        <p class="muted" style="margin:0 0 10px;font-size:.9rem">Copia este código para guardar tu avance o pégalo en tu celular/PC para restaurar exactamente tus capítulos leídos y posición:</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <input id="synccode" value="${syncCode}" style="flex:1;min-width:220px;padding:9px;background:#0d1222;color:var(--gold);border:1px solid var(--line);border-radius:8px;font-family:monospace;font-size:.8rem">
          <button class="ghost" id="btncopycode">📋 Copiar mi código</button>
          <button class="cta" id="btnloadcode" style="margin:0">📥 Restaurar desde código</button>
        </div>
        <div id="syncmsg" style="color:var(--gold);font-size:.85rem;margin-top:8px"></div>
      </div>
    </div>`;

  const updateNavBtn = () => {
    const p = store.get("nprofile", { name: "MI CUENTA" });
    const btn = document.getElementById("account-btn");
    if (btn) btn.textContent = `👤 ${p.name.toUpperCase()} (${pct}%)`;
  };
  updateNavBtn();

  document.getElementById("savename").onclick = () => {
    const val = document.getElementById("profname").value.trim() || "Viajero Kraniel";
    store.set("nprofile", { name: val });
    updateNavBtn();
    document.getElementById("syncmsg").textContent = "✓ Apodo guardado.";
  };
  document.getElementById("btnupto").onclick = () => {
    const target = +document.getElementById("uptosel").value;
    const set = new Set();
    chs.forEach(c => { if (c.n <= target) set.add(c.n); });
    store.set("nread", [...set]); if (typeof syncProgressToUser === "function") syncProgressToUser();
    store.set("nlastcap", target);
    store.set("nlast", new Date().toLocaleDateString("es"));
    viewAccount();
  };
  document.getElementById("btnreset").onclick = () => {
    store.set("nread", []); store.set("nscroll", {}); store.set("nlastcap", null);
    viewAccount();
  };
  document.getElementById("btncopycode").onclick = async () => {
    const inp = document.getElementById("synccode");
    inp.select();
    try { await navigator.clipboard.writeText(inp.value); } catch {}
    document.getElementById("syncmsg").textContent = "✓ Código copiado al portapapeles.";
  };
  document.getElementById("btnloadcode").onclick = () => {
    try {
      const raw = document.getElementById("synccode").value.trim();
      const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (data.p) store.set("nprofile", data.p);
      if (Array.isArray(data.r)) store.set("nread", data.r);
      if (Array.isArray(data.b)) store.set("nbookmarks", data.b);
      if (data.l) store.set("nlastcap", data.l);
      if (data.d) store.set("nlast", data.d);
      if (data.s) store.set("nscroll", data.s);
      viewAccount();
      document.getElementById("syncmsg").textContent = "✓ ¡Progreso restaurado con éxito!";
    } catch {
      document.getElementById("syncmsg").textContent = "⚠ El código ingresado no es válido.";
    }
  };
}

