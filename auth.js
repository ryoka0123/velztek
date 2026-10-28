// Sistema de Autenticación (Iniciar Sesión / Crear Cuenta / Google / Nube opcional con Firebase)
// Guarda cada cuenta con su propio progreso de capítulos, scroll, marcadores y volúmenes descargados.

// Si deseas sincronización en la nube entre dispositivos sin código, pega aquí tu config de Firebase (gratis):
const FIREBASE_CONFIG = null; // Ej: { apiKey: "...", authDomain: "...", projectId: "..." }

const AVATARS = [
  "novela/cover.jpg",
  "novela/art/clan.jpg",
  "novela/art/flor.jpg",
  "novela/art/sketch1.jpg",
  "novela/art/sketch2.jpg",
  "novela/art/sketch3.png"
];

function getUsersDB() {
  return store.get("velz_users", {});
}
function saveUsersDB(db) {
  store.set("velz_users", db);
}
function currentSessionEmail() {
  return store.get("velz_session", null);
}
function getCurrentUser() {
  const email = currentSessionEmail();
  if (!email) return null;
  const db = getUsersDB();
  return db[email] || null;
}

// Sincroniza las claves activas de lectura con el perfil del usuario que tiene sesión iniciada (local + nube si está disponible)
let cloudSyncTimer = null;
async function callCloudAuth(payload) {
  try {
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await r.json();
  } catch {
    return { cloud: false };
  }
}

function syncProgressToUser() {
  const email = currentSessionEmail();
  if (!email) return;
  const db = getUsersDB();
  if (!db[email]) return;
  db[email].progress = {
    nread: store.get("nread", []),
    nbookmarks: store.get("nbookmarks", []),
    nlastcap: store.get("nlastcap", null),
    nlast: store.get("nlast", null),
    nscroll: store.get("nscroll", {}),
    savedVols: store.get("savedVols", []),
    rcfg: store.get("rcfg", {})
  };
  saveUsersDB(db);
  updateHeaderAccountBtn();

  // Enviar actualización a la base de datos en la nube (con debounce de 1s)
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    callCloudAuth({
      action: "sync",
      email,
      name: db[email].name,
      avatar: db[email].avatar,
      progress: db[email].progress,
      user: db[email]
    });
  }, 900);
}

function loadUserProgressIntoActive(user) {
  const p = user?.progress || {};
  store.set("nread", p.nread || []);
  store.set("nbookmarks", p.nbookmarks || []);
  store.set("nlastcap", p.nlastcap || null);
  store.set("nlast", p.nlast || null);
  store.set("nscroll", p.nscroll || {});
  store.set("savedVols", p.savedVols || []);
  if (p.rcfg) store.set("rcfg", p.rcfg);
  store.set("nprofile", { name: user.name, avatar: user.avatar });
  updateHeaderAccountBtn();
}

function updateHeaderAccountBtn() {
  const btn = document.getElementById("account-btn");
  if (!btn) return;
  const user = getCurrentUser();
  const rd = store.get("nread", []);
  const pct = Math.min(100, Math.round((rd.length / 84) * 100));
  if (user) {
    btn.innerHTML = `<img src="${user.avatar || AVATARS[0]}" alt="" class="nav-ava"> <span>${esc(user.name)} · ${pct}%</span>`;
  } else {
    btn.innerHTML = `👤 <span>INICIAR SESIÓN</span>`;
  }
}

async function hashPass(pw) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("velz_" + pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "plain_" + pw;
  }
}

let authMode = "login"; // "login" | "register"
let selectedAvatar = AVATARS[0];

async function renderAuthView() {
  const user = getCurrentUser();
  updateHeaderAccountBtn();
  if (!user) {
    renderLoginRegisterCard();
  } else {
    await renderLoggedProfile(user);
  }
}

function renderLoginRegisterCard(errorMsg = "") {
  const isLogin = authMode === "login";
  app.innerHTML = head("Archivo de Velztek", isLogin ? "Iniciar Sesión" : "Crear Cuenta") + `
    <div class="auth-wrap">
      <div class="auth-card panel">
        <div id="cloud-badge" style="text-align:center;font-size:.76rem;padding:6px 10px;border-radius:999px;margin-bottom:14px;background:rgba(240,196,109,.08);border:1px solid var(--line);color:var(--muted)">
          ⏳ Verificando conexión con la base de datos…
        </div>
        <div class="auth-tabs">
          <button type="button" class="${isLogin ? "on" : ""}" id="tab-login">Iniciar Sesión</button>
          <button type="button" class="${!isLogin ? "on" : ""}" id="tab-reg">Registrarse</button>
        </div>
        <form id="auth-form" autocomplete="on">
          ${!isLogin ? `
            <label class="flabel">APODO DE LECTOR</label>
            <input class="finput" id="f-name" required placeholder="Ej. Viajero Kraniel">
            <label class="flabel">ELIGE TU AVATAR DEL CLAN</label>
            <div class="ava-grid">
              ${AVATARS.map(a => `<img src="${a}" data-ava="${a}" class="ava-pick ${a === selectedAvatar ? "on" : ""}" alt="Avatar">`).join("")}
            </div>
          ` : ""}
          <label class="flabel">CORREO O USUARIO</label>
          <input class="finput" id="f-email" required placeholder="tucorreo@ejemplo.com">
          <label class="flabel">CONTRASEÑA</label>
          <input class="finput" id="f-pass" type="password" required minlength="4" placeholder="••••••••">
          ${errorMsg ? `<div class="auth-err">⚠ ${esc(errorMsg)}</div>` : ""}
          <button type="submit" class="cta" style="width:100%;margin-top:16px;padding:13px">${isLogin ? "Entrar a mi cuenta →" : "Crear cuenta y guardar mi progreso →"}</button>
        </form>
        <div class="auth-foot">
          <span class="muted">${isLogin ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta?"}</span>
          <button type="button" class="link-btn" id="switch-auth">${isLogin ? "Crear una cuenta gratis" : "Iniciar sesión"}</button>
        </div>
        <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:14px">
          <small class="eyebrow" style="display:block;margin-bottom:8px">¿TIENES UN CÓDIGO DE RESPALDO?</small>
          <div style="display:flex;gap:8px">
            <input class="finput" id="quick-code" placeholder="Pegar código de otro dispositivo…" style="margin:0;flex:1;font-size:.8rem">
            <button type="button" class="ghost" id="btn-quick-restore">Restaurar</button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("tab-login").onclick = () => { authMode = "login"; renderLoginRegisterCard(); };
  document.getElementById("tab-reg").onclick = () => { authMode = "register"; renderLoginRegisterCard(); };
  document.getElementById("switch-auth").onclick = () => { authMode = isLogin ? "register" : "login"; renderLoginRegisterCard(); };

  callCloudAuth({ action: "status" }).then(st => {
    const el = document.getElementById("cloud-badge");
    if (!el) return;
    if (st && st.cloud) {
      el.style.borderColor = "rgba(80,210,140,.45)";
      el.style.color = "#8ff0b8";
      el.innerHTML = "🟢 Base de Datos en la Nube Conectada · Guardado 24/7 activo";
    } else {
      el.innerHTML = "💾 Modo Local del Navegador · Crea o restaura tu cuenta aquí";
    }
  });

  app.querySelectorAll("[data-ava]").forEach(img => {
    img.onclick = () => {
      selectedAvatar = img.dataset.ava;
      app.querySelectorAll("[data-ava]").forEach(x => x.classList.toggle("on", x === img));
    };
  });

  document.getElementById("btn-quick-restore").onclick = () => {
    const raw = document.getElementById("quick-code").value.trim();
    if (!raw) return;
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
      const email = (data.email || "lector@velztek.local").toLowerCase();
      const db = getUsersDB();
      db[email] = {
        email,
        name: data.p?.name || "Viajero Kraniel",
        avatar: data.p?.avatar || AVATARS[0],
        passHash: data.h || "",
        createdAt: new Date().toLocaleDateString("es"),
        progress: {
          nread: data.r || [],
          nbookmarks: data.b || [],
          nlastcap: data.l || null,
          nlast: data.d || new Date().toLocaleDateString("es"),
          nscroll: data.s || {},
          savedVols: data.v || []
        }
      };
      saveUsersDB(db);
      store.set("velz_session", email);
      loadUserProgressIntoActive(db[email]);
      renderAuthView();
    } catch {
      renderLoginRegisterCard("El código de respaldo no es válido.");
    }
  };

  document.getElementById("auth-form").onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById("f-email").value.trim().toLowerCase();
    const pass = document.getElementById("f-pass").value;
    const db = getUsersDB();
    const passHash = await hashPass(pass);

    if (isLogin) {
      // 1. Intentar autenticar primero contra la base de datos en la nube (/api/auth)
      const cloudRes = await callCloudAuth({ action: "login", email, passHash });
      if (cloudRes && cloudRes.cloud) {
        if (!cloudRes.ok) return renderLoginRegisterCard(cloudRes.error || "Error al iniciar sesión.");
        db[email] = cloudRes.user;
        saveUsersDB(db);
        store.set("velz_session", email);
        loadUserProgressIntoActive(cloudRes.user);
        return renderAuthView();
      }
      // 2. Respaldo local en el navegador si la base de datos en la nube aún no está conectada
      const u = db[email];
      if (!u) return renderLoginRegisterCard("No existe esa cuenta en este navegador. Haz clic en la pestaña «Registrarse» arriba a la derecha para crearla.");
      if (u.passHash && u.passHash !== passHash) return renderLoginRegisterCard("Contraseña incorrecta.");
      store.set("velz_session", email);
      loadUserProgressIntoActive(u);
      renderAuthView();
    } else {
      const name = document.getElementById("f-name").value.trim() || "Viajero Kraniel";
      const newUser = {
        email,
        name,
        avatar: selectedAvatar,
        passHash,
        createdAt: new Date().toLocaleDateString("es"),
        progress: {
          nread: store.get("nread", []),
          nbookmarks: store.get("nbookmarks", []),
          nlastcap: store.get("nlastcap", null),
          nlast: store.get("nlast", new Date().toLocaleDateString("es")),
          nscroll: store.get("nscroll", {}),
          savedVols: store.get("savedVols", []),
          rcfg: store.get("rcfg", {})
        }
      };
      const cloudRes = await callCloudAuth({ action: "register", email, user: newUser });
      if (cloudRes && cloudRes.cloud && !cloudRes.ok) {
        return renderLoginRegisterCard(cloudRes.error || "Ese usuario ya existe.");
      }
      if (!cloudRes?.cloud && db[email]) {
        return renderLoginRegisterCard("Ese correo/usuario ya está registrado. Inicia sesión.");
      }
      db[email] = newUser;
      saveUsersDB(db);
      store.set("velz_session", email);
      loadUserProgressIntoActive(newUser);
      renderAuthView();
    }
  };
}

async function renderLoggedProfile(user) {
  const n = await loadNovel();
  const chs = n?.chapters || [];
  const rd = new Set(store.get("nread", []));
  const bms = store.get("nbookmarks", []);
  const lastCap = store.get("nlastcap", null);
  const lastDate = store.get("nlast", "Nunca");
  const lastChObj = chs.find(c => c.n === lastCap) || chs.find(c => !rd.has(c.n)) || chs[0];
  const lastPt = lastChObj ? parseChapTitle(lastChObj.title, lastChObj.n) : { badge: "CAP. 0", name: "Capítulo 0" };
  const pct = chs.length ? Math.round((rd.size / chs.length) * 100) : 0;
  const wordsRead = chs.filter(c => rd.has(c.n)).reduce((a, c) => a + (c.words || 0), 0);

  const exportPayload = {
    email: user.email,
    h: user.passHash,
    p: { name: user.name, avatar: user.avatar },
    r: [...rd],
    b: bms,
    l: lastCap,
    d: lastDate,
    s: store.get("nscroll", {}),
    v: store.get("savedVols", [])
  };
  const syncCode = btoa(unescape(encodeURIComponent(JSON.stringify(exportPayload))));

  app.innerHTML = head("Sesión Iniciada", "Mi Cuenta") + `
    <div class="panel">
      <div class="series-head" style="align-items:center">
        <div style="display:flex;gap:18px;align-items:center;flex:1;min-width:260px;flex-wrap:wrap">
          <img src="${user.avatar || AVATARS[0]}" alt="Avatar" class="prof-ava">
          <div style="flex:1;min-width:200px">
            <div class="eyebrow" style="text-align:left">CUENTA ACTIVA · ${esc(user.email)} <span id="prof-cloud-badge" style="margin-left:8px;color:#8ff0b8;font-size:.72rem"></span></div>
            <div style="display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap">
              <input id="profname" value="${esc(user.name)}" class="finput" style="margin:0;font-size:1.2rem;max-width:240px">
              <button class="ghost" id="savename">Guardar</button>
              <button class="ghost" id="btnlogout" style="border-color:rgba(235,95,120,.5);color:#ff9aa8">Cerrar sesión</button>
            </div>
            <div class="ava-grid" style="margin-top:8px">
              ${AVATARS.map(a => `<img src="${a}" data-chava="${a}" class="ava-pick small ${a === user.avatar ? "on" : ""}" title="Cambiar avatar">`).join("")}
            </div>
          </div>
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
        <p class="muted" style="margin:0 0 12px;font-size:.9rem">Elige hasta qué capítulo ya leíste y se guardará automáticamente en tu cuenta <b>${esc(user.name)}</b>:</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <select id="uptosel" class="finput" style="margin:0;flex:1;min-width:220px">
            ${chs.map(c => {
              const pt = parseChapTitle(c.title, c.n);
              return `<option value="${c.n}" ${c.n === lastCap ? "selected" : ""}>#${c.n} · ${esc(pt.badge)} — ${esc(pt.name)}</option>`;
            }).join("")}
          </select>
          <button class="cta" id="btnupto" style="margin:0">✓ Marcar leídos hasta aquí</button>
          <button class="ghost" id="btnreset">Reiniciar a 0%</button>
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
        <h3 style="margin:0 0 8px">✦ Llevar mi cuenta a otro dispositivo (Celular ↔ PC)</h3>
        <p class="muted" style="margin:0 0 10px;font-size:.9rem">Copia tu llave de cuenta o pégala en otro navegador para iniciar sesión con todo tu historial:</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <input id="synccode" value="${syncCode}" class="finput" style="margin:0;flex:1;min-width:220px;color:var(--gold);font-family:monospace;font-size:.8rem">
          <button class="ghost" id="btncopycode">📋 Copiar llave</button>
          <button class="cta" id="btnloadcode" style="margin:0">📥 Importar llave</button>
        </div>
        <div id="syncmsg" style="color:var(--gold);font-size:.85rem;margin-top:8px"></div>
      </div>
    </div>`;

  callCloudAuth({ action: "status" }).then(st => {
    const b = document.getElementById("prof-cloud-badge");
    if (b && st && st.cloud) b.textContent = "· 🟢 Guardado en la Nube Activo";
  });

  document.getElementById("savename").onclick = () => {
    const val = document.getElementById("profname").value.trim() || user.name;
    const db = getUsersDB();
    db[user.email].name = val;
    saveUsersDB(db);
    syncProgressToUser();
    updateHeaderAccountBtn();
    document.getElementById("syncmsg").textContent = "✓ Nombre actualizado y guardado en la nube.";
  };
  app.querySelectorAll("[data-chava]").forEach(img => {
    img.onclick = () => {
      const db = getUsersDB();
      db[user.email].avatar = img.dataset.chava;
      saveUsersDB(db);
      syncProgressToUser();
      renderAuthView();
    };
  });
  document.getElementById("btnlogout").onclick = () => {
    syncProgressToUser();
    store.set("velz_session", null);
    updateHeaderAccountBtn();
    renderAuthView();
  };
  document.getElementById("btnupto").onclick = () => {
    const target = +document.getElementById("uptosel").value;
    const set = new Set();
    chs.forEach(c => { if (c.n <= target) set.add(c.n); });
    store.set("nread", [...set]);
    store.set("nlastcap", target);
    store.set("nlast", new Date().toLocaleDateString("es"));
    syncProgressToUser();
    renderAuthView();
  };
  document.getElementById("btnreset").onclick = () => {
    store.set("nread", []); store.set("nscroll", {}); store.set("nlastcap", null);
    syncProgressToUser();
    renderAuthView();
  };
  document.getElementById("btncopycode").onclick = async () => {
    const inp = document.getElementById("synccode");
    inp.select();
    try { await navigator.clipboard.writeText(inp.value); } catch {}
    document.getElementById("syncmsg").textContent = "✓ Llave de cuenta copiada al portapapeles.";
  };
  document.getElementById("btnloadcode").onclick = () => {
    try {
      const raw = document.getElementById("synccode").value.trim();
      const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (Array.isArray(data.r)) store.set("nread", data.r);
      if (Array.isArray(data.b)) store.set("nbookmarks", data.b);
      if (data.l) store.set("nlastcap", data.l);
      if (data.d) store.set("nlast", data.d);
      if (data.s) store.set("nscroll", data.s);
      syncProgressToUser();
      renderAuthView();
      document.getElementById("syncmsg").textContent = "✓ ¡Progreso importado en tu cuenta!";
    } catch {
      document.getElementById("syncmsg").textContent = "⚠ El código ingresado no es válido.";
    }
  };
}
