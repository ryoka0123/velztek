// Novela: catálogo de novelas/volúmenes, libro ornamentado y lector con barra superior.
let NOVEL = null;
async function loadNovel() {
  if (NOVEL) return NOVEL;
  try { NOVEL = await (await fetch("novela/manifest.json")).json(); } catch { NOVEL = false; }
  return NOVEL;
}
const novelCover = n => n.cover || ph(n.title, n.author || "", n.hue || 175);
const fmtTime = w => { const m = Math.max(1, Math.round(w / 200)); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
let novelTab = "capitulos";

// Parsea títulos del EPUB como "(Capítulo 2) Depredador" o "Velztek #1" o "Epílogo 1"
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
  const next = chs.find(c => !rd.has(c.n)) || chs[0] || { n: 1, title: "(Capítulo 0)" };
  const nextParsed = parseChapTitle(next.title, next.n);
  const nextVol = volOfChapter(next.n);
  const totalWords = chs.reduce((a, c) => a + (c.words || 0), 0);

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
          <p class="muted" style="font-size:.85rem">Total acumulado: <b style="color:var(--gold)">${totalWords.toLocaleString("es")} palabras</b> · ${chs.length} capítulos listos para leer</p>
        </div>
        <div style="min-width:220px">
          <div class="eyebrow" style="text-align:left">${rd.size ? "Continuar obra" : "Inicio de la obra"}</div>
          <p style="color:var(--gold);margin:6px 0 2px;font-weight:600">${esc(nextParsed.name)}</p>
          <div class="muted" style="font-size:.82rem;margin-bottom:8px">Volumen ${nextVol} · ${esc(nextParsed.badge)}</div>
          <a class="cta" href="#/leer/${next.n}">${rd.size ? "Continuar lectura" : "Comenzar lectura"} →</a>
          <div class="muted" style="font-size:.82rem;margin-top:6px">${s.volumes.length} volúmenes disponibles</div>
        </div>
      </div>
      <div class="vols">
        ${s.volumes.map(v => {
          const inVol = chs.filter(c => c.n >= v.from && c.n <= v.to);
          const vCover = v.cover || ph(s.title, "Volumen " + v.n, s.hue + v.n * 18);
          return `<a class="vol" href="#/volumen/${v.n}">
            <img src="${vCover}" alt="Volumen ${v.n}">
            <span class="new">${inVol.length} PARTES</span>
            <div class="cap">VOLUMEN ${v.n}<small>${esc(v.label || `${inVol.length} CAPÍTULOS`)}</small></div>
          </a>`;
        }).join("")}
      </div>
    </div>`;
}

// Vista 2: Libro antiguo abierto de un Volumen (#/volumen/1..6)
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
      <div class="psub">✦ CAPÍTULOS ✦</div>
      <div class="pbody chl">${listToShow.map(c => {
        const pt = parseChapTitle(c.title, c.n);
        const isCurrent = next && next.n === c.n;
        return `<a href="#/leer/${c.n}" class="${isCurrent ? "active" : ""}">
          <span><small>✦ ${esc(pt.badge)}</small><b>${esc(pt.name)}</b></span>
          <span class="dot ${rd.has(c.n) ? "read" : ""}"></span>
        </a>`;
      }).join("")}</div>
      <button class="btn-l save-btn" id="savevol">${saved ? "✓ Volumen guardado sin conexión (quitar)" : "⬇ Guardar volumen sin conexión"}</button>`, "p-left");

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
  const rd = new Set(store.get("nread", [])); rd.add(cn); store.set("nread", [...rd]);
  store.set("nlast", new Date().toLocaleDateString("es"));
  const prev = n.chapters[i - 1], nxt = n.chapters[i + 1];
  const cfg = readerCfg();

  app.innerHTML = `
    <div class="rbar">
      <div class="rnav-pill">
        ${prev ? `<a class="rnav-arrow" href="#/leer/${prev.n}" title="Capítulo anterior">‹</a>` : `<span class="rnav-arrow off">‹</span>`}
        <div class="rnav-center">
          <small>${esc(n.author)} · ${esc(pt.short)}</small>
          <b>${esc(pt.name.toUpperCase())}</b>
          <span class="chev">▾</span>
          <select id="chsel" aria-label="Seleccionar capítulo">${n.chapters.map(x => {
            const xp = parseChapTitle(x.title, x.n);
            return `<option value="${x.n}" ${x.n === cn ? "selected" : ""}>${esc(xp.badge)} · ${esc(xp.name)}</option>`;
          }).join("")}</select>
        </div>
        ${nxt ? `<a class="rnav-arrow" href="#/leer/${nxt.n}" title="Capítulo siguiente">›</a>` : `<span class="rnav-arrow off">›</span>`}
      </div>
      <div class="rbar-tools">
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
      <div class="meta">${esc(pt.badge)} &nbsp;·&nbsp; ${wordCount.toLocaleString("es")} PALABRAS &nbsp;·&nbsp; ${fmtTime(wordCount).toUpperCase()}</div>
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
  scrollTo(0, 0);
}
