/* Abre Chromium sin interfaz para las herramientas que sacan capturas (iconos.js y boceto.js).
   Usa el Chromium que instala Playwright (npx playwright install chromium); si no está, prueba con el de
   PLAYWRIGHT_CHROMIUM o con el preinstalado en /opt/pw-browsers. */
const fs = require('fs');
const { chromium } = require('playwright');

async function abrir() {
  try {
    return await chromium.launch();
  } catch (e) {
    const ruta = [process.env.PLAYWRIGHT_CHROMIUM, '/opt/pw-browsers/chromium'].find(r => r && fs.existsSync(r));
    if (!ruta) throw new Error('No encontré Chromium: npx playwright install chromium');
    return chromium.launch({ executablePath: ruta });
  }
}

module.exports = { abrir };
