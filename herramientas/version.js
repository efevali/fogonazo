/* Sube la versión de Fogonazo: el número y la fecha en codigo/game.js y el número en sw.js, y vuelve a armar
   index.html.

   Fogonazo usa versionado semántico, MAYOR.MENOR.PARCHE:
     parche  0.1.0 → 0.1.1   arreglos que no suman nada nuevo
     menor   0.1.1 → 0.2.0   algo nuevo que no rompe lo anterior (una función, un ajuste de dificultad)
     mayor   0.9.0 → 1.0.0   el salto grande. Mientras el primero es 0, el juego está en desarrollo; la 1.0.0 es
                             la versión estable y revisada. Después de la 1.0, el mayor sube solo cuando algo rompe
                             lo anterior (por ejemplo, el avance guardado).

   Se corre antes de cada publicación. El título del commit empieza con el número («0.2.0: …») y se suma la
   versión a CHANGELOG.md. Cambiar sw.js es lo que le avisa al teléfono que hay una versión nueva (aparece «Hay
   una versión nueva» en Ajustes y el LED verde en el engranaje). El teléfono no compara números: toma lo último
   que se publica. Volver atrás es publicar el contenido viejo con un número nuevo.

   Uso:  node herramientas/version.js parche|menor|mayor [fecha]
         node herramientas/version.js fecha [fecha]     solo cambia la fecha (si se publica otro día)
         (la fecha, D/M/AAAA, por defecto la de hoy) */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');

const tipo = process.argv[2];
if (!['parche', 'menor', 'mayor', 'fecha'].includes(tipo)) {
  console.error('Uso: node herramientas/version.js parche|menor|mayor|fecha [D/M/AAAA]');
  process.exit(1);
}
const hoy = new Date();
const fecha = process.argv[3] || `${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`;
const rutaJuego = path.join(RAIZ, 'codigo', 'game.js');
const rutaSw = path.join(RAIZ, 'sw.js');
let juego = fs.readFileSync(rutaJuego, 'utf8');
let sw = fs.readFileSync(rutaSw, 'utf8');
const reJuego = /const FOGONAZO_VERSION = \{ v: '(\d+)\.(\d+)\.(\d+)', fecha: '[^']*' \};/;
const reSw = /const VERSION = '(\d+\.\d+\.\d+)';/;
const m = juego.match(reJuego), s = sw.match(reSw);
if (!m || !s) { console.error('No encontré FOGONAZO_VERSION en codigo/game.js o VERSION en sw.js'); process.exit(1); }
const actual = m.slice(1, 4).join('.');
if (actual !== s[1]) { console.error(`Las versiones no coinciden: game.js ${actual}, sw.js ${s[1]}`); process.exit(1); }
let [mayor, menor, parche] = m.slice(1, 4).map(Number);
if (tipo === 'mayor') { mayor++; menor = 0; parche = 0; }
else if (tipo === 'menor') { menor++; parche = 0; }
else if (tipo === 'parche') parche++;
const nueva = `${mayor}.${menor}.${parche}`;
juego = juego.replace(reJuego, `const FOGONAZO_VERSION = { v: '${nueva}', fecha: '${fecha}' };`);
sw = sw.replace(reSw, `const VERSION = '${nueva}';`);
fs.writeFileSync(rutaJuego, juego);
fs.writeFileSync(rutaSw, sw);
console.log(tipo === 'fecha' ? `${nueva}, ahora del ${fecha}` : `${actual} → ${nueva}, del ${fecha}`);
execFileSync(process.execPath, [path.join(__dirname, 'armar.js')], { stdio: 'inherit' });
