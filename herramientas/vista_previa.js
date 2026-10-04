/* Arma la vista previa de Fogonazo para publicarla como artefacto en claude.ai.

   La vista previa es el mismo index.html, con dos diferencias que pide el visor de artefactos:
     - las tipografías van adentro del archivo (el visor no carga archivos sueltos);
     - sin manifiesto ni íconos de la versión instalable (ahí no se instala nada). El juego, además, no registra
       el service worker fuera de github.io: no aparece la tarjeta «Instalar» y la fila de versión va sin botón.
   En el visor, el avance se sincroniza con la cuenta de claude.ai (Cloud, en codigo/game.js); es aparte del de
   la versión instalable.

   Uso:  node herramientas/vista_previa.js [archivo de salida]
         (por defecto, dist/vista-previa.html, que no se sube al repositorio) */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const salida = path.resolve(process.argv[2] || path.join(RAIZ, 'dist', 'vista-previa.html'));

let html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let n = 0;
html = html.replace(/url\(fuentes\/([a-z0-9-]+\.woff2)\)/g, (_, f) => {
  n++;
  return 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(RAIZ, 'fuentes', f)).toString('base64') + ')';
});
html = html.replace(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n/g, '');
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, html);
console.log(`${path.relative(process.cwd(), salida)}: ${n} tipografías adentro, ${(fs.statSync(salida).size / 1024).toFixed(0)} KB`);
