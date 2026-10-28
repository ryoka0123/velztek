// Uso: node split-chapters.js todo.txt
// Divide un único archivo con toda la novela en novela/cap-001.txt, cap-002.txt, ...
// Cada capítulo debe empezar con una línea que comience con "Capítulo" (o "Capitulo"/"Parte"), por ejemplo "Capítulo 12: El bosque".
// Después ejecuta: node build-manifest.js
const fs = require("fs");
const path = require("path");
const input = process.argv[2];
if (!input) { console.error("Indica el archivo: node split-chapters.js todo.txt"); process.exit(1); }
const lines = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
const chapters = [];
for (const line of lines) {
  if (/^\s*(cap[ií]tulo|parte)\b/i.test(line)) chapters.push([line.trim()]);
  else if (chapters.length) chapters.at(-1).push(line);
}
const dir = path.join(__dirname, "novela");
fs.mkdirSync(dir, { recursive: true });
chapters.forEach((c, i) => {
  const name = `cap-${String(i + 1).padStart(3, "0")}.txt`;
  fs.writeFileSync(path.join(dir, name), c.join("\n").trim() + "\n");
});
console.log(`${chapters.length} capítulos creados en novela/.`);
