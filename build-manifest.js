// Uso: node build-manifest.js
// Pon los capítulos en la carpeta novela/ como cap-001.txt, cap-002.txt, ...
// La primera línea de cada archivo es el título. Este script actualiza novela/manifest.json.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "novela");
const mfPath = path.join(dir, "manifest.json");
const mf = JSON.parse(fs.readFileSync(mfPath, "utf8"));
const files = fs.readdirSync(dir).filter(f => /^cap-\d+\.txt$/i.test(f)).sort();
mf.chapters = files.map(f => {
  const text = fs.readFileSync(path.join(dir, f), "utf8").replace(/^\uFEFF/, "");
  const title = text.split(/\r?\n/)[0].trim() || f;
  const words = text.split(/\r?\n/).slice(1).join(" ").split(/\s+/).filter(Boolean).length;
  return { n: parseInt(f.match(/\d+/)[0], 10), title, file: f, words };
});
fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));
console.log(`${mf.chapters.length} capítulos registrados.`);


