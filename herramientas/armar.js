/* Arma el juego: une el código de codigo/ en un solo index.html, en la raíz del repositorio, que es lo que
   publica GitHub Pages. index.html no se edita a mano: se cambia el código y se vuelve a armar.

   El orden importa: el motor y los niveles primero, después los valores calibrados (solo lo que usa el
   juego), los dibujos, el sonido y la interfaz.

   node herramientas/armar.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(RAIZ, 'codigo', f), 'utf8');

const cal = JSON.parse(rd('calibrated.json'));
const slim = {};
for (const [k, v] of Object.entries(cal)) {
  slim[k] = {};
  for (const f of ['moves', 'time', 'scoreTarget', 'stars']) if (v[f] !== undefined) slim[k][f] = v[f];
}
const js = [
  rd('engine.js'),
  rd('levels.js'),
  'const CAL = ' + JSON.stringify(slim) + ';',
  rd('sprites.js'),
  rd('sprites16.js'),
  rd('audio.js'),
  rd('clave.js'),
  rd('game.js'),
].join('\n');

// page.html tiene la cabecera (título, tipografías, estilos) y el cuerpo, que empieza en <div id="app">
const page = rd('page.html');
const corte = page.indexOf('<div id="app">');
if (corte < 0) throw new Error('No encontré <div id="app"> en codigo/page.html');
const cabeza = page.slice(0, corte).trim();
const cuerpo = page.slice(corte).trim();

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<!-- Armado con herramientas/armar.js a partir de codigo/. No se edita a mano. -->
<meta name="description" content="Juego de juntar tres con componentes electrónicos: 30 circuitos para armar.">
<meta name="theme-color" content="#1a252d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Fogonazo">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="iconos/icono-192.png">
<link rel="apple-touch-icon" href="iconos/apple-touch-icon.png">
<style>
:root { box-sizing: border-box; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; padding: 0; touch-action: manipulation; }
[hidden] { display: none !important; }
</style>
${cabeza}
</head>
<body>
${cuerpo}
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(RAIZ, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(1) + ' KB');
