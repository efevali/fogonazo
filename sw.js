/* Service worker de Fogonazo.
   Guarda el juego entero en el teléfono para que funcione sin conexión, y maneja las versiones: cuando se
   publica una versión nueva, el teléfono la baja en segundo plano y queda esperando hasta que se toca
   «Actualizar» en Ajustes (o hasta que el juego se cierra del todo).

   VERSION tiene que coincidir con FOGONAZO_VERSION de codigo/game.js: herramientas/version.js sube las dos.
   Cualquier cambio en este archivo es lo que le avisa al teléfono que hay algo nuevo: el teléfono no compara
   números, toma lo último que se publica. El número (MAYOR.MENOR.PARCHE) es para ordenarnos.

   Fogonazo comparte el origen efevali.github.io con Kasa: lo guardado lleva el prefijo «fogonazo-» y solo se
   borra lo propio. */
const VERSION = '0.0.0';
const CACHE = 'fogonazo-v' + VERSION;
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fuentes/silkscreen-400.woff2',
  'fuentes/silkscreen-700.woff2',
  'fuentes/pixelify-sans-400.woff2',
  'fuentes/pixelify-sans-600.woff2',
  'fuentes/jersey-15-400.woff2',
  'fuentes/jersey-25-400.woff2',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-maskable-192.png',
  'iconos/icono-maskable-512.png',
  'iconos/apple-touch-icon.png'
];

// Instalar: bajar todo de nuevo del servidor (sin copias viejas intermedias) y guardarlo junto
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, {cache: 'reload'})))));
});

// Activar: borrar lo guardado por versiones anteriores de Fogonazo (no lo de Kasa) y tomar el juego abierto
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('fogonazo-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// «Actualizar» en Ajustes: la versión que espera pasa a ser la activa
self.addEventListener('message', e => { if (e.data === 'actualizar') self.skipWaiting(); });

// Todo sale de lo guardado; la red solo si falta algo
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Abrir el juego: la página guardada. Otras páginas del sitio (como docs/muestrario.html) van a la red.
  const base = new URL('./', self.registration.scope).pathname;
  if (req.mode === 'navigate' && (url.pathname === base || url.pathname === base + 'index.html')){
    e.respondWith(
      caches.open(CACHE)
        .then(c => c.match('index.html').then(r => r || c.match('./')))
        .then(r => r || fetch(req))
    );
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true})).then(r => r || fetch(req)));
});
