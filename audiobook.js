// Reproductor flotante de Audiolibro con Motor Híbrido:
// 1) Voces Neuronales Cloud en Español (alta naturalidad, vía StreamElements / Google Translate TTS chunking)
// 2) Voces Neuronales nativas (Microsoft Natural / Google) + modelado prosódico de diálogos y narración.

let ttsState = {
  active: false,
  playing: false,
  paused: false,
  paras: [],
  idx: 0,
  rate: 1.0,
  vol: 1.0,
  voiceURI: "cloud:Mia",
  totalSec: 0,
  paraSec: [],
  cumSec: [],
  timer: null,
  paraElapsed: 0,
  audioEl: null,
  abortCtrl: null
};

// Voces en la nube (Amazon Polly Neural / Google Cloud TTS vía endpoints públicos sin API key)
const CLOUD_VOICES = [
  { id: "cloud:Mia", label: "★ IA Neural · Mía (Femenina · México, cálida)", lang: "es-MX", voice: "Mia" },
  { id: "cloud:Lucia", label: "★ IA Neural · Lucía (Femenina · España, clara)", lang: "es-ES", voice: "Lucia" },
  { id: "cloud:Lupe", label: "★ IA Neural · Lupe (Femenina · Latinoamérica)", lang: "es-US", voice: "Lupe" },
  { id: "cloud:Conchita", label: "★ IA Neural · Conchita (Narradora clásica)", lang: "es-ES", voice: "Conchita" },
  { id: "cloud:Enrique", label: "★ IA Neural · Enrique (Masculina · Narrador)", lang: "es-ES", voice: "Enrique" },
  { id: "cloud:Miguel", label: "★ IA Neural · Miguel (Masculina · Latinoamérica)", lang: "es-US", voice: "Miguel" }
];

function fmtClock(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
}

function getSpanishVoices() {
  if (!("speechSynthesis" in window)) return [];
  const all = speechSynthesis.getVoices() || [];
  const es = all.filter(v => /^es([-_]|$)/i.test(v.lang) || /spanish|español/i.test(v.name));
  const score = v => {
    const n = (v.name + " " + v.lang).toLowerCase();
    let s = 0;
    if (n.includes("natural") || n.includes("neural") || n.includes("online")) s += 60;
    if (n.includes("dalia") || n.includes("elvira") || n.includes("salome") || n.includes("camila") || n.includes("paloma") || n.includes("ximena")) s += 30;
    if (n.includes("google")) s += 25;
    if (n.includes("microsoft")) s += 15;
    if (/es[-_](mx|co|ar|lat|419|es|pe|cl)/i.test(v.lang)) s += 10;
    return s;
  };
  return es.sort((a, b) => score(b) - score(a));
}

function cleanTextForSpeech(raw) {
  return String(raw || "")
    .replace(/^[—–-]\s*/gm, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\.{2,}/g, "... ")
    .replace(/[*#_~`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Divide un párrafo en oraciones naturales para que la entonación humana respire en cada punto o diálogo
function splitSentences(text, maxLen = 220) {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];
  const rawParts = cleaned.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [cleaned];
  const chunks = [];
  let buf = "";
  for (const part of rawParts) {
    const p = part.trim();
    if (!p) continue;
    if ((buf + " " + p).trim().length <= maxLen) {
      buf = (buf ? buf + " " : "") + p;
    } else {
      if (buf) chunks.push(buf);
      if (p.length <= maxLen) buf = p;
      else {
        const sub = p.match(new RegExp(`.{1,${maxLen}}(\\s|$)`, "g")) || [p];
        sub.forEach(s => chunks.push(s.trim()));
        buf = "";
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function stopCurrentAudio() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (ttsState.audioEl) {
    try { ttsState.audioEl.pause(); ttsState.audioEl.src = ""; } catch {}
    ttsState.audioEl = null;
  }
  if (ttsState.timer) { clearInterval(ttsState.timer); ttsState.timer = null; }
}

function stopAudiobook(hidePanel = false) {
  stopCurrentAudio();
  ttsState.playing = false;
  ttsState.paused = false;
  document.querySelectorAll("#txt p.tts-reading").forEach(el => el.classList.remove("tts-reading"));
  const bar = document.getElementById("ab-player");
  if (bar) {
    bar.classList.remove("is-playing");
    if (hidePanel) bar.hidden = true;
  }
  const btn = document.getElementById("btntts");
  if (btn && hidePanel) btn.classList.remove("active");
  updatePlayerUI();
}

function updatePlayerUI() {
  const bar = document.getElementById("ab-player");
  if (!bar) return;
  const playBtn = document.getElementById("ab-play");
  const statusEl = document.getElementById("ab-status");
  const curEl = document.getElementById("ab-cur");
  const remEl = document.getElementById("ab-rem");
  const seekEl = document.getElementById("ab-seek");

  if (playBtn) playBtn.innerHTML = ttsState.playing ? "❚❚" : "▶";
  bar.classList.toggle("is-playing", ttsState.playing);

  const baseSec = ttsState.cumSec[ttsState.idx] || 0;
  const elapsed = Math.min(ttsState.totalSec, baseSec + ttsState.paraElapsed);
  const remain = Math.max(0, (ttsState.totalSec - elapsed) / (ttsState.rate || 1));

  if (curEl) curEl.textContent = fmtClock(elapsed / (ttsState.rate || 1));
  if (remEl) remEl.textContent = "-" + fmtClock(remain);
  if (seekEl && document.activeElement !== seekEl) {
    seekEl.max = Math.max(1, ttsState.paras.length - 1);
    seekEl.value = ttsState.idx;
  }
  if (statusEl) {
    if (ttsState.playing) statusEl.textContent = `Narrando párrafo ${ttsState.idx + 1} de ${ttsState.paras.length}`;
    else if (ttsState.paused) statusEl.textContent = `En pausa · Párrafo ${ttsState.idx + 1} de ${ttsState.paras.length}`;
    else statusEl.textContent = "Listo para escuchar (haz clic en cualquier párrafo o en ▶)";
  }
}

function highlightCurrentPara(scrollInto = true) {
  document.querySelectorAll("#txt p.tts-reading").forEach(el => el.classList.remove("tts-reading"));
  const el = ttsState.paras[ttsState.idx];
  if (el) {
    el.classList.add("tts-reading");
    if (scrollInto) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Reproduce una lista de frases con la voz en la nube (StreamElements Polly Neural); si falla o no hay internet, cae automáticamente al navegador con prosodia mejorada
async function playCloudParagraph(sentences, voiceName, onDone) {
  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    if (!ttsState.playing) return;
    const phrase = sentences[sIdx];
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voiceName)}&text=${encodeURIComponent(phrase)}`;
    const ok = await new Promise(resolve => {
      const audio = new Audio(url);
      ttsState.audioEl = audio;
      audio.volume = ttsState.vol;
      audio.playbackRate = ttsState.rate;
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.play().catch(() => resolve(false));
    });
    if (!ok) {
      // Fallback inmediato a síntesis expresiva local si el navegador bloquea o no hay red
      speakLocalParagraph(sentences.slice(sIdx), onDone);
      return;
    }
  }
  if (ttsState.playing) onDone();
}

// Síntesis local mejorada: ajusta dinámicamente tono y cadencia en diálogos, preguntas y exclamaciones para quitar lo robótico
function speakLocalParagraph(sentences, onDone) {
  if (!("speechSynthesis" in window)) { onDone(); return; }
  const voices = getSpanishVoices();
  const chosen = voices.find(v => v.voiceURI === ttsState.voiceURI) || voices[0];
  let sIdx = 0;

  const nextSentence = () => {
    if (!ttsState.playing) return;
    if (sIdx >= sentences.length) { onDone(); return; }
    const phrase = sentences[sIdx++];
    const u = new SpeechSynthesisUtterance(phrase);
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
    else u.lang = "es-MX";

    // Modelado prosódico humano según el tipo de oración
    const isQuestion = /[?¿]/.test(phrase);
    const isExclam = /[!¡]/.test(phrase);
    u.rate = ttsState.rate * (isExclam ? 1.04 : 0.98);
    u.pitch = isQuestion ? 1.08 : isExclam ? 1.06 : 1.02;
    u.volume = ttsState.vol;

    u.onend = () => {
      if (!ttsState.playing) return;
      setTimeout(nextSentence, 90); // micropausa de respiración entre frases
    };
    u.onerror = () => { if (ttsState.playing) nextSentence(); };
    speechSynthesis.speak(u);
  };
  nextSentence();
}

function speakCurrentPara() {
  stopCurrentAudio();

  if (ttsState.idx < 0) ttsState.idx = 0;
  if (ttsState.idx >= ttsState.paras.length) {
    ttsState.idx = 0;
    stopAudiobook(false);
    return;
  }

  const el = ttsState.paras[ttsState.idx];
  const raw = (el.innerText || "").trim();
  const sentences = splitSentences(raw);
  if (!sentences.length) {
    ttsState.idx++;
    speakCurrentPara();
    return;
  }

  highlightCurrentPara(true);
  ttsState.playing = true;
  ttsState.paused = false;
  ttsState.paraElapsed = 0;

  ttsState.timer = setInterval(() => {
    if (ttsState.playing) {
      ttsState.paraElapsed = Math.min(ttsState.paraSec[ttsState.idx] || 5, ttsState.paraElapsed + 0.5);
      updatePlayerUI();
    }
  }, 500);

  updatePlayerUI();

  const advanceNextPara = () => {
    if (!ttsState.playing) return;
    ttsState.idx++;
    ttsState.paraElapsed = 0;
    if (ttsState.idx < ttsState.paras.length) speakCurrentPara();
    else stopAudiobook(false);
  };

  if (String(ttsState.voiceURI).startsWith("cloud:")) {
    const voiceName = ttsState.voiceURI.slice(6) || "Mia";
    playCloudParagraph(sentences, voiceName, advanceNextPara);
  } else {
    speakLocalParagraph(sentences, advanceNextPara);
  }
}

function mountAudiobookPlayer(meta) {
  stopAudiobook(true);
  const paraEls = Array.from(document.querySelectorAll("#txt p"));
  ttsState.paras = paraEls;
  ttsState.idx = 0;
  ttsState.paraElapsed = 0;
  ttsState.rate = store.get("ab_rate", 1.0);
  ttsState.vol = store.get("ab_vol", 1.0);
  ttsState.voiceURI = store.get("ab_voice", "cloud:Mia");

  let cum = 0;
  ttsState.paraSec = [];
  ttsState.cumSec = [];
  paraEls.forEach(p => {
    ttsState.cumSec.push(cum);
    const w = (p.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    const sec = Math.max(2, Math.round(w / 2.6));
    ttsState.paraSec.push(sec);
    cum += sec;
  });
  ttsState.totalSec = cum;

  paraEls.forEach((p, i) => {
    p.addEventListener("click", () => {
      const bar = document.getElementById("ab-player");
      if (!bar || bar.hidden) return;
      ttsState.idx = i;
      speakCurrentPara();
    });
  });

  const host = document.createElement("div");
  host.innerHTML = `
    <div class="ab-player" id="ab-player" hidden>
      <div class="ab-top">
        <div class="ab-info">
          <div class="ab-wave"><span></span><span></span><span></span><span></span><span></span></div>
          <div>
            <small class="ab-eyebrow">AUDIOLIBRO · ${esc(meta.short)}</small>
            <h4 class="ab-title">${esc(meta.name.toUpperCase())}</h4>
            <div class="ab-status"><i class="ab-dot"></i> <span id="ab-status">Listo para escuchar</span></div>
          </div>
        </div>
        <div class="ab-controls">
          <button type="button" class="ab-step" id="ab-prev" title="Retroceder (~15s)">
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
            <span>15</span>
          </button>
          <button type="button" class="ab-play" id="ab-play" title="Reproducir / Pausar">▶</button>
          <button type="button" class="ab-step" id="ab-next" title="Adelantar (~30s)">
            <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
            <span>30</span>
          </button>
        </div>
        <div class="ab-win">
          <button type="button" id="ab-min" title="Minimizar">—</button>
          <button type="button" id="ab-close" title="Cerrar audiolibro">✕</button>
        </div>
      </div>

      <div class="ab-body" id="ab-body">
        <div class="ab-progress-wrap">
          <input type="range" id="ab-seek" min="0" max="${Math.max(1, paraEls.length - 1)}" value="0">
          <div class="ab-times"><span id="ab-cur">0:00</span><span id="ab-rem">-${fmtClock(cum)}</span></div>
        </div>

        <div class="ab-bottom">
          <div class="ab-vol">
            <span>🔊</span>
            <input type="range" id="ab-vol" min="0" max="1" step="0.05" value="${ttsState.vol}">
          </div>
          <div class="ab-field">
            <small>VELOCIDAD</small>
            <select id="ab-rate">
              <option value="0.85" ${ttsState.rate === 0.85 ? "selected" : ""}>0.85x (Pausada)</option>
              <option value="1" ${ttsState.rate === 1 ? "selected" : ""}>Normal (1.0x)</option>
              <option value="1.15" ${ttsState.rate === 1.15 ? "selected" : ""}>1.15x (Fluida)</option>
              <option value="1.3" ${ttsState.rate === 1.3 ? "selected" : ""}>1.3x (Rápida)</option>
              <option value="1.5" ${ttsState.rate === 1.5 ? "selected" : ""}>1.5x (Muy rápida)</option>
            </select>
          </div>
          <div class="ab-field">
            <small>VOZ</small>
            <select id="ab-voice"></select>
          </div>
          <div class="ab-dl">
            <button type="button" id="ab-dl-cap" title="Descargar este capítulo para lectura offline">⬇ Descargar capítulo</button>
            <button type="button" id="ab-dl-vol" title="Guardar volumen completo sin conexión">⬇ Guardar volumen</button>
          </div>
        </div>
      </div>
    </div>`;
  app.appendChild(host.firstElementChild);

  const populateVoices = () => {
    const sel = document.getElementById("ab-voice");
    if (!sel) return;
    const localVoices = getSpanishVoices();

    // Si en este navegador hay una voz Microsoft Natural (Edge), la ponemos también arriba
    const naturalLocal = localVoices.filter(v => /natural|neural|online/i.test(v.name));
    const otherLocal = localVoices.filter(v => !/natural|neural|online/i.test(v.name));

    const groups = [];
    groups.push(`<optgroup label="Voces IA en la Nube (Recomendadas)">${CLOUD_VOICES.map(cv =>
      `<option value="${cv.id}" ${cv.id === ttsState.voiceURI ? "selected" : ""}>${esc(cv.label)}</option>`
    ).join("")}</optgroup>`);

    if (naturalLocal.length) {
      groups.push(`<optgroup label="Voces Neuronales del Navegador">${naturalLocal.map(v => {
        const clean = v.name.replace(/^Microsoft\s+|Online\s*\(Natural\)\s*-\s*/gi, "");
        return `<option value="${esc(v.voiceURI)}" ${v.voiceURI === ttsState.voiceURI ? "selected" : ""}>★ ${esc(clean)} (${v.lang})</option>`;
      }).join("")}</optgroup>`);
    }
    if (otherLocal.length) {
      groups.push(`<optgroup label="Voces Locales (Sin conexión)">${otherLocal.map(v => {
        const clean = v.name.replace(/^Microsoft\s+/gi, "");
        return `<option value="${esc(v.voiceURI)}" ${v.voiceURI === ttsState.voiceURI ? "selected" : ""}>${esc(clean)} (${v.lang})</option>`;
      }).join("")}</optgroup>`);
    }
    sel.innerHTML = groups.join("");
  };
  populateVoices();
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = populateVoices;

  const player = document.getElementById("ab-player");
  const gearTts = document.getElementById("btntts");
  if (gearTts) {
    gearTts.onclick = () => {
      const opening = player.hidden;
      player.hidden = !opening;
      gearTts.classList.toggle("active", opening);
      if (opening && !ttsState.playing) speakCurrentPara();
      else if (!opening) stopAudiobook(true);
    };
  }

  document.getElementById("ab-play").onclick = () => {
    if (ttsState.playing) {
      stopCurrentAudio();
      ttsState.playing = false;
      ttsState.paused = true;
      updatePlayerUI();
    } else {
      speakCurrentPara();
    }
  };
  document.getElementById("ab-prev").onclick = () => {
    ttsState.idx = Math.max(0, ttsState.idx - 1);
    speakCurrentPara();
  };
  document.getElementById("ab-next").onclick = () => {
    ttsState.idx = Math.min(paraEls.length - 1, ttsState.idx + 2);
    speakCurrentPara();
  };
  document.getElementById("ab-seek").oninput = e => {
    ttsState.idx = +e.target.value;
    if (ttsState.playing) speakCurrentPara();
    else { highlightCurrentPara(true); updatePlayerUI(); }
  };
  document.getElementById("ab-vol").oninput = e => {
    ttsState.vol = +e.target.value;
    store.set("ab_vol", ttsState.vol);
    if (ttsState.audioEl) ttsState.audioEl.volume = ttsState.vol;
  };
  document.getElementById("ab-rate").onchange = e => {
    ttsState.rate = +e.target.value;
    store.set("ab_rate", ttsState.rate);
    if (ttsState.audioEl) ttsState.audioEl.playbackRate = ttsState.rate;
    updatePlayerUI();
  };
  document.getElementById("ab-voice").onchange = e => {
    ttsState.voiceURI = e.target.value;
    store.set("ab_voice", ttsState.voiceURI);
    if (ttsState.playing) speakCurrentPara();
  };
  document.getElementById("ab-min").onclick = () => {
    player.classList.toggle("minimized");
  };
  document.getElementById("ab-close").onclick = () => stopAudiobook(true);

  document.getElementById("ab-dl-cap").onclick = () => {
    const blob = new Blob([meta.rawText || ""], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Velztek - ${meta.badge} - ${meta.name}.txt`;
    a.click();
  };
  document.getElementById("ab-dl-vol").onclick = e => {
    const s = new Set(store.get("savedVols", []));
    s.add(meta.vNum);
    store.set("savedVols", [...s]);
    if (typeof syncProgressToUser === "function") syncProgressToUser();
    e.currentTarget.textContent = "✓ Volumen guardado";
  };

  updatePlayerUI();
}
