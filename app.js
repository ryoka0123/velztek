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

function viewHome() {
  app.innerHTML = head("Archivo de Velztek", "Velztek") + `
    <div class="panel"><div class="hero" style="display:flex;gap:28px;align-items:center;justify-content:center;flex-wrap:wrap;text-align:left">
    <img src="novela/cover.jpg" alt="Velztek" style="width:200px;border-radius:14px;border:2px solid var(--gold);box-shadow:0 10px 30px #000a">
    <div style="max-width:520px"><div class="eyebrow" style="text-align:left">Fantasía · Isekai y Reencarnación · por WARYONI</div>
    <h2>Dos almas unidas bajo la luna del bosque</h2>
    <p class="muted">Un bosque inmenso estaba delante de sus ojos y una vida nueva de la cual no se sabía quién era la protagonista. Orejas de lobo, cuernos del linaje Kraniel y un mundo que aguarda entre la niebla.</p>
    <a class="cta" href="#/novela">Explorar novela →</a> &nbsp; <a class="ghost" href="#/volumen/1" style="padding:12px 18px;display:inline-block">Abrir Volumen I</a></div></div>
    <div class="home-grid"><a href="#/novela">Novela</a><a href="#/arte">Galería de Arte</a><a href="#/descargas">Descargas</a><a href="#/proyectos">Proyectos</a><a href="#/creditos">Créditos</a></div></div>`;
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

function viewProjects() {
  app.innerHTML = head("Archivo arcano", "Proyectos") + `<p class="muted" style="text-align:center;margin-top:-10px">En lo que estamos trabajando.</p>` +
    PROJECTS.map(p => {
      const cells = []; for (let n = p.from; n <= p.to; n++) cells.push(`<span class="${p.done.includes(n) ? "done" : n === p.current ? "cur" : ""}">${String(n).padStart(2, "0")}${p.done.includes(n) ? "<br>✓" : ""}</span>`);
      return `<div class="panel"><div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:space-between">
        <div style="flex:1;min-width:260px"><h3 style="font-size:1.5rem;text-transform:uppercase;margin:0 0 8px">${p.title}</h3><p class="muted">${p.desc}</p></div>
        <div><div class="vgrid">${cells.join("")}</div><div style="text-align:right;margin-top:8px;font-size:1.4rem;color:var(--gold)">${p.done.length} <span class="muted" style="font-size:.9rem">/ ${p.to - p.from + 1} capítulos listos</span></div></div></div>
        <div class="ba"><div><small>FORMATO ORIGINAL</small>Texto exportado con saltos de página y guiones separadores sueltos.</div><div><small>EDICIÓN WEB</small>Párrafos limpios, separadores ornamentados y glosario interactivo en el libro antiguo.</div></div></div>`;
    }).join("");
}

function viewCredits() {
  app.innerHTML = head("Archivo arcano", "Créditos") + `<div class="panel">${CREDITS.map(([r, n]) => `<div class="dl"><span class="cinzel" style="font-size:.8rem;color:var(--gold)">${r}</span><span>${n}</span></div>`).join("")}</div>`;
}

// ---------- router ----------
const NAV = [["#/", "Inicio"], ["#/novela", "Novela"], ["#/arte", "Arte"], ["#/descargas", "Descargas"], ["#/proyectos", "Proyectos"], ["#/creditos", "Créditos"]];
function route() {
  const h = location.hash || "#/";
  const [r, a] = h.slice(2).split("/");
  const activeKey = ["volumen", "leer"].includes(r) ? "novela" : (r || "");
  document.getElementById("links").innerHTML = NAV.map(([href, l]) => `<a href="${href}" class="${(href.slice(2) || "") === activeKey ? "on" : ""}">${l}</a>`).join("");
  if (r === "novela") viewNovelsHub(+a || 1);
  else if (r === "volumen") viewNovelVolume(+a || 1);
  else if (r === "leer") viewLeer(+a || 1);
  else if (r === "arte") viewArt();
  else if (r === "cuenta") viewAccount();
  else if (r === "descargas") viewDownloads();
  else if (r === "proyectos") viewProjects();
  else if (r === "creditos") viewCredits();
  else viewHome();
}
document.getElementById("back").onclick = () => history.back();
addEventListener("hashchange", route);
route();
