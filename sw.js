/* Service worker de la colección.
   Guarda la app entera en el teléfono para que funcione sin conexión. Cuando se publica una versión nueva, el
   teléfono la baja en segundo plano y la deja esperando: entra sola al cerrar la app del todo y volver a abrirla, o
   con «Actualizar» en los ajustes de la sala.

   Cualquier cambio en este archivo es lo que le avisa al teléfono que hay algo nuevo. La lista de archivos y el
   número los escribe herramientas/version.js; el número (MAYOR.MENOR.PARCHE) es para ordenarnos.

   El sitio, efevali.github.io, es el mismo de Kasa: lo guardado lleva el prefijo «coleccion-» y solo se borra lo
   propio, más lo que guardaba el Fogonazo publicado («fogonazo-»), al que esta versión reemplaza. */
const VERSION = '0.27.0';
const FECHA = '13/11/2026';
const CACHE = 'coleccion-v' + VERSION;
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'codigo/calibrated.json',
  'codigo/engine.js',
  'codigo/levels.js',
  'codigo/persona.js',
  'codigo/persona.json',
  'comun/app.js',
  'comun/fuentes/barlow-semi-condensed-latin-500-normal.woff2',
  'comun/fuentes/barlow-semi-condensed-latin-600-normal.woff2',
  'comun/fuentes/barlow-semi-condensed-latin-700-normal.woff2',
  'comun/fuentes/caveat-latin-600-normal.woff2',
  'comun/fuentes/fraunces-latin-soft-normal.woff2',
  'comun/fuentes/ibm-plex-mono-latin-600-normal.woff2',
  'comun/fuentes/noto-serif-jp-mahjong-700.woff2',
  'comun/fuentes/pt-serif-latin-400-italic.woff2',
  'comun/fuentes/pt-serif-latin-400-normal.woff2',
  'comun/fuentes/pt-serif-latin-700-normal.woff2',
  'comun/fuentes/special-elite-latin-400-normal.woff2',
  'comun/pantalla.js',
  'comun/registro.js',
  'comun/sonido.js',
  'sala/gata-cola.webm',
  'sala/gata-estira.webm',
  'sala/gata-mira.webm',
  'sala/gata-respira.webm',
  'sala/index.html',
  'sala/mask-audio.png',
  'sala/mask-bench.png',
  'sala/mask-biblioteca.png',
  'sala/mask-cuadro.png',
  'sala/mask-rain.png',
  'sala/mask-table.png',
  'sala/sala-luz.jpg',
  'sala/sala.jpg',
  'fogonazo/estado.js',
  'fogonazo/fondo-tiempo.webp',
  'fogonazo/fondo-zen.webp',
  'fogonazo/fondo.webp',
  'fogonazo/instrumento.html',
  'fogonazo/instrumento.webp',
  'fogonazo/mapa.html',
  'fogonazo/partida.html',
  'fogonazo/piezas/bateria.png',
  'fogonazo/piezas/pad1.png',
  'fogonazo/piezas/pad2.png',
  'fogonazo/piezas/padOk.png',
  'fogonazo/piezas/pieza0.png',
  'fogonazo/piezas/pieza1.png',
  'fogonazo/piezas/pieza2.png',
  'fogonazo/piezas/pieza3.png',
  'fogonazo/piezas/pieza4.png',
  'fogonazo/piezas/pieza5.png',
  'fogonazo/piezas/pieza6.png',
  'fogonazo/piezas/quemado1.png',
  'fogonazo/piezas/quemado2.png',
  'fogonazo/piezas/valvula.png',
  'fogonazo/piezas/zocalo.png',
  'mahjong/estado.js',
  'mahjong/estuche.html',
  'mahjong/fichas.js',
  'mahjong/fondo.webp',
  'mahjong/partida.html',
  'mahjong/tableros.js',
  'buenojo/color.js',
  'buenojo/estado.js',
  'buenojo/fondo-block.webp',
  'buenojo/fondo.webp',
  'buenojo/index.html',
  'buenojo/mesa.css',
  'buenojo/partida.html',
  'biblioteca/arte/dif-dificil.webp',
  'biblioteca/arte/dif-facil.webp',
  'biblioteca/arte/dif-normal.webp',
  'biblioteca/arte/fondo-entrada.webp',
  'biblioteca/arte/fondo-partida-facil.webp',
  'biblioteca/arte/fondo-partida.webp',
  'biblioteca/arte/objetos/auto.webp',
  'biblioteca/arte/objetos/avion.webp',
  'biblioteca/arte/objetos/cactus.webp',
  'biblioteca/arte/objetos/camara.webp',
  'biblioteca/arte/objetos/casete.webp',
  'biblioteca/arte/objetos/caseteA.webp',
  'biblioteca/arte/objetos/caseteAhumado.webp',
  'biblioteca/arte/objetos/caseteB.webp',
  'biblioteca/arte/objetos/caseteBlanco.webp',
  'biblioteca/arte/objetos/caseteTransparente.webp',
  'biblioteca/arte/objetos/despertador.webp',
  'biblioteca/arte/objetos/eiffel.webp',
  'biblioteca/arte/objetos/enciclopedia.webp',
  'biblioteca/arte/objetos/enciclopediaVerde.webp',
  'biblioteca/arte/objetos/globo.webp',
  'biblioteca/arte/objetos/libros.webp',
  'biblioteca/arte/objetos/librosAlt.webp',
  'biblioteca/arte/objetos/llave.webp',
  'biblioteca/arte/objetos/llaveReja.webp',
  'biblioteca/arte/objetos/mamushka.webp',
  'biblioteca/arte/objetos/pila.webp',
  'biblioteca/arte/objetos/radio.webp',
  'biblioteca/arte/objetos/tomo.webp',
  'biblioteca/arte/objetos/tomoAzul.webp',
  'biblioteca/arte/puerta.webp',
  'biblioteca/arte/reja.webp',
  'biblioteca/estado.js',
  'biblioteca/index.html',
  'biblioteca/mueble.css',
  'biblioteca/objetos.js',
  'biblioteca/partida.html',
  'biblioteca/repartos.js',
  'iconos/apple-touch-icon.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-maskable-192.png',
  'iconos/icono-maskable-512.png',
];

// Instalar: bajar todo de nuevo del servidor (sin copias viejas intermedias) y guardarlo junto
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))));
});

// Activar: borrar lo guardado por versiones anteriores (no lo de Kasa) y tomar la app abierta
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => (k.startsWith('coleccion-') || k.startsWith('fogonazo-')) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// «Actualizar» (los ajustes de la sala; antes, el Fogonazo publicado): la versión que espera pasa a ser la activa.
// «version»: los ajustes preguntan el número de la instalada y de la que espera
self.addEventListener('message', e => {
  if (e.data === 'actualizar') self.skipWaiting();
  if (e.data === 'version' && e.ports[0]) e.ports[0].postMessage({ version: VERSION, fecha: FECHA });
});

// Todo sale de lo guardado; la red solo si falta algo (por ejemplo, las páginas de docs/)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // los videos (la gata de la sala) se piden por partes: se responde la parte pedida de lo guardado
  if (req.headers.has('range')) { e.respondWith(parte(req)); return; }
  const base = new URL('./', self.registration.scope).pathname;
  e.respondWith(caches.open(CACHE).then(c => {
    if (req.mode === 'navigate' && (url.pathname === base || url.pathname === base + 'index.html')) {
      return c.match('index.html').then(r => r || c.match('./'));
    }
    // una carpeta (sala/) es su index.html
    if (url.pathname.endsWith('/')) return c.match(url.pathname + 'index.html');
    return c.match(req, { ignoreSearch: true });
  }).then(r => r || fetch(req)));
});

// Un pedido «Range» (así pide Chrome los videos): de lo guardado se responde solo el tramo pedido, con 206
async function parte(req) {
  const c = await caches.open(CACHE);
  const r = await c.match(req, { ignoreSearch: true });
  if (!r) return fetch(req);
  const b = await r.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '') || [];
  let ini = m[1] ? Number(m[1]) : 0, fin = m[2] ? Number(m[2]) : b.size - 1;
  if (!m[1] && m[2]) { ini = Math.max(0, b.size - Number(m[2])); fin = b.size - 1; }
  fin = Math.min(fin, b.size - 1);
  return new Response(b.slice(ini, fin + 1), {
    status: 206, statusText: 'Partial Content',
    headers: { 'Content-Type': r.headers.get('Content-Type') || 'video/webm', 'Content-Range': `bytes ${ini}-${fin}/${b.size}`,
      'Content-Length': String(fin - ini + 1), 'Accept-Ranges': 'bytes' },
  });
}
