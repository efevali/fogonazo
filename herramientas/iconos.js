/* Dibuja los íconos de la versión instalable en iconos/, a partir de herramientas/iconos.html (que usa los
   dibujos de 16 bits del juego): 192 y 512 px, sus versiones adaptables (maskable) y el de iPhone.
   node herramientas/iconos.js */
const fs = require('fs');
const path = require('path');
const { abrir } = require('./navegador.js');
const RAIZ = path.join(__dirname, '..');

(async () => {
  const b = await abrir();
  const p = await b.newPage();
  p.on('pageerror', e => { console.error(e.message); process.exitCode = 1; });
  await p.goto('file://' + path.join(__dirname, 'iconos.html'));
  await p.waitForFunction(() => window.ICONS);
  const iconos = await p.evaluate(() => window.ICONS);
  fs.mkdirSync(path.join(RAIZ, 'iconos'), { recursive: true });
  for (const [nombre, url] of Object.entries(iconos)) fs.writeFileSync(path.join(RAIZ, 'iconos', nombre), Buffer.from(url.split(',')[1], 'base64'));
  console.log('iconos/: ' + Object.keys(iconos).join(', '));
  await b.close();
})();
