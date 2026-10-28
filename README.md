# Velztek — Archivo Web Oficial

Sitio web de lectura para la novela **Velztek** de **WARYONI** (84 partes organizadas en 6 volúmenes interactivos).

## Cómo añadir un nuevo capítulo desde GitHub
1. Sube el archivo de texto en la carpeta `novela/` siguiendo la numeración (por ejemplo, `novela/cap-085.txt`). La primera línea del archivo debe ser el título (ej. `(Capítulo 71) Nuevo título`).
2. Ejecuta localmente `node build-manifest.js` (o agrega la entrada al final de `novela/manifest.json`).
3. Haz `git add . && git commit -m "Nuevo capítulo" && git push` y Vercel / GitHub Pages actualizará la web automáticamente en segundos.
