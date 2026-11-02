/* Sube la versión de la colección y rehace la lista de archivos que el service worker guarda en el teléfono.

   node herramientas/version.js parche|menor|mayor   sube el número y pone la fecha de hoy
   node herramientas/version.js                      solo rehace la lista (después de sumar o quitar archivos)

   La lista sale de las carpetas de la app (codigo/, comun/, sala/, fogonazo/, mahjong/, buenojo/, iconos/) más la página y la ficha de
   instalación: todo lo que la app necesita para andar sin conexión. Cualquier cambio en sw.js es lo que le avisa al
   teléfono que hay una versión nueva. */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const SW = path.join(RAIZ, 'sw.js');
const CARPETAS = ['codigo', 'comun', 'sala', 'fogonazo', 'mahjong', 'buenojo', 'iconos'];
const SUELTOS = ['./', 'index.html', 'manifest.webmanifest'];
const FUERA = /\.(txt|md)$/;   // licencias y notas: van en el repositorio, no hacen falta en el teléfono

function archivos(dir) {
  return fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap(e => {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) return archivos(rel);
    return FUERA.test(e.name) ? [] : [rel];
  });
}

let sw = fs.readFileSync(SW, 'utf8');
let [, version] = /const VERSION = '([\d.]+)'/.exec(sw);
const paso = process.argv[2];
if (paso) {
  let [M, m, p] = version.split('.').map(Number);
  if (paso === 'mayor') { M++; m = 0; p = 0; } else if (paso === 'menor') { m++; p = 0; } else if (paso === 'parche') p++;
  else { console.error('Uso: node herramientas/version.js [parche|menor|mayor]'); process.exit(1); }
  version = [M, m, p].join('.');
  const hoy = new Date();
  sw = sw.replace(/const VERSION = '[\d.]+'/, `const VERSION = '${version}'`)
    .replace(/const FECHA = '[^']*'/, `const FECHA = '${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}'`);
}
const lista = SUELTOS.concat(...CARPETAS.map(archivos).map(l => l.sort()));
sw = sw.replace(/const ARCHIVOS = \[[\s\S]*?\];/, 'const ARCHIVOS = [\n' + lista.map(f => `  '${f}',`).join('\n') + '\n];');
fs.writeFileSync(SW, sw);
console.log(`Versión ${version}: ${lista.length} archivos en el service worker.`);
