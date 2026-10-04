/* Copia las tipografías del juego a fuentes/, con sus licencias, para que funcione sin conexión.

   Salen de los paquetes de Fontsource (npm install), que traen los archivos de Google Fonts ya recortados al
   alfabeto latino (con ñ, tildes, «», ¡¿ y rayas). Antes de copiar, verifica que todos los caracteres de los
   textos del juego estén en ese recorte; ★, ▶ y ✓ no cuentan porque son dibujos pixelados propios.

   Tipografías: Silkscreen (400 y 700) y Pixelify Sans (400 y 600) para 8 bits; Jersey 15 y Jersey 25 para 16.
   Si se suma una tipografía o un peso, se agrega en FUENTES, en el @font-face de codigo/page.html y en sw.js.

   node herramientas/fuentes.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'fuentes');

const FUENTES = [
  ['silkscreen', 'Silkscreen', [400, 700]],
  ['pixelify-sans', 'Pixelify-Sans', [400, 600]],
  ['jersey-15', 'Jersey-15', [400]],
  ['jersey-25', 'Jersey-25', [400]],
];

// Rango «latin» de Fontsource y Google Fonts
const LATIN = [[0, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2bb, 0x2bc], [0x2c6, 0x2c6], [0x2da, 0x2da], [0x2dc, 0x2dc],
  [0x304, 0x304], [0x308, 0x308], [0x329, 0x329], [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2191, 0x2191],
  [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd]];
const DIBUJADOS = new Set(['★', '▶', '✓']);

const textos = ['game.js', 'levels.js', 'page.html'].map(f => fs.readFileSync(path.join(RAIZ, 'codigo', f), 'utf8')).join('');
const faltan = [...new Set(textos)].filter(c => c.codePointAt(0) > 127 && !DIBUJADOS.has(c) &&
  !LATIN.some(([a, b]) => c.codePointAt(0) >= a && c.codePointAt(0) <= b));
if (faltan.length) {
  console.error('Estos caracteres de los textos no están en las tipografías: ' + faltan.join(' ') +
    '\nHay que sumar el recorte «latin-ext» (archivos *-latin-ext-*.woff2) o cambiar el texto.');
  process.exit(1);
}

fs.mkdirSync(DESTINO, { recursive: true });
let total = 0;
for (const [id, nombre, pesos] of FUENTES) {
  const paquete = path.join(RAIZ, 'node_modules', '@fontsource', id);
  if (!fs.existsSync(paquete)) { console.error('Falta el paquete @fontsource/' + id + ': npm install'); process.exit(1); }
  for (const p of pesos) {
    const origen = path.join(paquete, 'files', `${id}-latin-${p}-normal.woff2`);
    const destino = path.join(DESTINO, `${id}-${p}.woff2`);
    fs.copyFileSync(origen, destino);
    total += fs.statSync(destino).size;
  }
  fs.copyFileSync(path.join(paquete, 'LICENSE'), path.join(DESTINO, `OFL-${nombre}.txt`));
}
console.log(`fuentes/: ${FUENTES.reduce((n, f) => n + f[2].length, 0)} archivos, ${(total / 1024).toFixed(0)} KB, con sus licencias`);
