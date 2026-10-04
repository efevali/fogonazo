/* Saca la captura de una pantalla de Fogonazo, tal como se ve en el teléfono, para un boceto.

   Los bocetos de Fogonazo no se dibujan: son el juego real con los cambios propuestos (la rama de la tanda),
   capturado a 360 × 780 px con escala 3 (1080 px de ancho, como el teléfono de referencia). Con el avance y el
   estilo que se le pasen, la pantalla muestra el estado que se quiere aprobar.

   - Sirve la carpeta del repositorio en un puerto local y la abre en Chromium sin interfaz, como un navegador:
     aparece la tarjeta «Instalar» y la fila de versión con su botón.
   - Arranca siempre de cero: sin avance guardado ni service worker de antes.
   - Espera a que carguen las tipografías antes de capturar.

   Uso:  node herramientas/boceto.js salida.png [opciones]
     Opciones:
       --avance "1-7:3,8:1"   estrellas por nivel: «1-7:3» da tres estrellas del 1 al 7; «8:1», una al 8.
                              Sin avance, el juego arranca de cero.
       --16                   estilo 16 bits (por defecto, 8 bits)
       --accion "js"          JavaScript que se ejecuta antes de capturar (abrir Ajustes, simular una versión
                              nueva); se puede repetir y van en orden. Tiene a mano F = window.__fogonazo.
                              Después de las acciones se quita el foco, para que no se vea el anillo que deja un
                              toque simulado.
       --entera               la pantalla entera, de arriba abajo, en una sola imagen
   Ejemplos:
     node herramientas/boceto.js docs/bocetos/B-01a.png --avance "1-7:3"
     node herramientas/boceto.js docs/bocetos/B-01f.png --16 --accion "F.UI.settings()" \
         --accion "F.APPV.nueva = true; F.pintarVersion()"

   Requiere npm install (Playwright) y, fuera de este entorno, npx playwright install chromium. */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { abrir } = require('./navegador.js');
const RAIZ = path.join(__dirname, '..');
const CLAVE = 'chispazo.v1';   // KEY de codigo/game.js
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };

const args = process.argv.slice(2);
const salida = args[0];
if (!salida || salida.startsWith('--')) { console.error('Uso: node herramientas/boceto.js salida.png [--avance …] [--16] [--accion …] [--entera]'); process.exit(1); }
const acciones = [];
let avance = '', estilo = '8', entera = false;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--avance') avance = args[++i];
  else if (args[i] === '--16') estilo = '16';
  else if (args[i] === '--accion') acciones.push(args[++i]);
  else if (args[i] === '--entera') entera = true;
  else { console.error('Opción desconocida: ' + args[i]); process.exit(1); }
}
const stars = {}, best = {};
for (const parte of avance.split(',').filter(Boolean)) {
  const [rango, est] = parte.split(':');
  const [a, b] = rango.split('-').map(Number);
  for (let n = a; n <= (b || a); n++) { stars[n] = +est; best[n] = 10000; }
}
const guardado = { progress: { stars, best }, settings: { sfx: 0.7, music: 0.35, mute: false, style: estilo } };

const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
});

servidor.listen(0, async () => {
  const b = await abrir();
  try {
    const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => { console.error('Error en la página: ' + e.message); process.exitCode = 1; });
    await p.addInitScript(([k, v]) => { if (!sessionStorage.getItem('boceto')) { localStorage.setItem(k, v); sessionStorage.setItem('boceto', '1'); } }, [CLAVE, JSON.stringify(guardado)]);
    await p.goto(`http://localhost:${servidor.address().port}/`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(900);
    for (const a of acciones) { await p.evaluate(`(() => { const F = window.__fogonazo; ${a} })()`); await p.waitForTimeout(400); }
    await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await p.waitForTimeout(300);
    fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
    await p.screenshot({ path: salida, fullPage: entera });
    console.log(salida);
  } finally {
    await b.close();
    servidor.close();
  }
});
