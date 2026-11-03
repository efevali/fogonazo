/* La página contenedora de la colección (index.html): muestra una pantalla por vez en un marco y resuelve lo común.

   - Pantallas: la sala (sala/) y las de cada juego (fogonazo/…). Se pasa de una a otra con un fundido corto.
   - «Atrás» de Android: cada paso que «atrás» tiene que deshacer (entrar a una pantalla, abrir un panel) suma una
     entrada al historial, siempre al tocar algo: Chrome saltea las entradas que una página suma sin que la toquen.
     Al volver, si el paso era un panel, la pantalla lo cierra (Pantalla.atras); si era una pantalla, se vuelve a la
     anterior. Desde la sala, «atrás» sale de la app.
   - Sonido: la música, los efectos y la lluvia viven acá (comun/sonido.js), así que no se cortan entre pantallas.
     La lluvia suena solo en la sala; cada juego elige su música.
   - Instalación: guarda el cuadro de instalación de Chrome para el panel de ajustes de la sala.
   - Versión: el service worker deja la versión nueva esperando; entra sola al cerrar la app del todo, o con
     «Actualizar» en los ajustes de la sala (App.version), que muestran también la versión instalada.

   Las pantallas lo usan como «App» a través de comun/pantalla.js. */
(() => {
  'use strict';
  const velo = document.getElementById('velo'), aviso = document.getElementById('aviso');
  let frame = null, nFrames = 0;
  const base = new URL('./', location.href).pathname;

  // ------------------------------------------------------------ ambiente de cada pantalla
  // lluvia: la de la sala; música: el tema de cada lugar (en Fogonazo, Taller fuera de la partida). En la partida la
  // elige la pantalla (Placa, Urgente en el contrarreloj o Siesta en el zen), con App.sonido.musica.
  const AMBIENTE = [
    [/^sala\//, { lluvia: true, musica: null }],
    [/^fogonazo\/partida\.html/, { lluvia: false, musica: 'pantalla' }],
    [/^fogonazo\//, { lluvia: false, musica: 'map' }],
    // el mahjong: las primas orientales, Taller en el estuche y Siesta en la partida
    [/^mahjong\/partida\.html/, { lluvia: false, musica: 'zenO' }],
    [/^mahjong\//, { lluvia: false, musica: 'mapO' }],
    // Buen ojo: Taller renacentista en todo el juego, sin cortarse al pasar de una pantalla a otra; en la partida (no en
    // la práctica), un 30 % más baja, para concentrarse
    [/^buenojo\/partida\.html\?d=/, { lluvia: false, musica: 'tallerR', foco: 0.7 }],
    [/^buenojo\//, { lluvia: false, musica: 'tallerR' }],
  ];
  function ambiente(url) {
    const a = (AMBIENTE.find(([re]) => re.test(url)) || [null, { lluvia: false, musica: null }])[1];
    Sound.rain(a.lluvia);
    Sound.duck(false); Sound.focus(a.foco || 1);
    if (a.musica === 'pantalla') return;
    if (a.musica) Sound.music(a.musica); else Sound.stopMusic();
  }

  // ------------------------------------------------------------ pantallas e historial
  const INICIO = 'sala/';
  // pila de pantallas; cada una con cuántas entradas del historial tiene encima (paneles o pasos propios)
  const pila = [{ url: INICIO, extra: 0 }];
  let pos = 0;                        // índice de la entrada actual del historial
  const top = () => pila[pila.length - 1];
  history.replaceState({ i: 0 }, '');

  // Cada pantalla va en un marco nuevo, con nombre propio. Si fuera siempre el mismo, al ir hacia atrás en el
  // historial Chrome le devolvería al marco la página que tenía en ese paso, por su cuenta.
  function cargar(url, primera) {
    velo.classList.add('on');
    setTimeout(() => {
      const nuevo = document.createElement('iframe');
      nuevo.className = 'pantalla'; nuevo.title = 'Minijuegos'; nuevo.name = 'pantalla' + (++nFrames);
      nuevo.addEventListener('load', () => alCargar(nuevo));
      nuevo.src = url;
      document.body.insertBefore(nuevo, velo);
      if (frame) frame.remove();
      frame = nuevo;
    }, primera ? 0 : 220);
  }
  function alCargar(f) {
    if (f !== frame) return;
    const doc = f.contentDocument;
    if (!doc || f.contentWindow.location.href === 'about:blank') return;
    // el primer toque en cualquier pantalla habilita el sonido (los navegadores lo piden)
    doc.addEventListener('pointerdown', desbloquear, true);
    doc.addEventListener('keydown', desbloquear, true);
    const url = frame.contentWindow.location.pathname.replace(base, '') + frame.contentWindow.location.search;
    ambiente(url);
    requestAnimationFrame(() => velo.classList.remove('on'));
    // the sign goes away with the veil (it is inside it), and then it is hidden for good
    if (!aviso.hidden) setTimeout(() => { aviso.hidden = true; }, 300);
  }
  function desbloquear() { Sound.ensure(); girar(); }

  // En horizontal. La ficha de instalación lo pide, pero una app instalada antes (la 0.6.1, en vertical) conserva su
  // orientación hasta que Chrome actualiza la ficha, y eso puede tardar días. Por eso se pide también desde acá; en
  // el navegador, sin pantalla completa, Chrome no lo permite y no pasa nada.
  let horizontal = false;
  function girar() {
    if (horizontal || !screen.orientation || !screen.orientation.lock) return;
    screen.orientation.lock('landscape').then(() => { horizontal = true; }).catch(() => {});
  }

  function empujar() { pos++; history.pushState({ i: pos }, ''); }

  // los pasos de «atrás»
  addEventListener('popstate', e => {
    const i = (e.state && Number.isInteger(e.state.i)) ? e.state.i : 0;
    let pasos = pos - i;
    if (pasos <= 0) { pos = i; return; }
    pos = i;
    const antes = top().url;
    if (pasos === 1 && top().extra > 0) {
      // un solo paso sobre una pantalla con algo encima: lo resuelve la pantalla
      top().extra--;
      const p = frame.contentWindow && frame.contentWindow.Pantalla;
      if (p && p.atras) p.atras();
      return;
    }
    while (pasos > 0 && pila.length) {
      if (top().extra > 0) { const n = Math.min(top().extra, pasos); top().extra -= n; pasos -= n; continue; }
      if (pila.length === 1) break;
      pila.pop(); pasos--;
    }
    if (top().url !== antes) cargar(top().url);
  });

  // ------------------------------------------------------------ instalación
  let cuadro = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); cuadro = e; });
  addEventListener('appinstalled', () => { cuadro = null; instalada = true; });
  let instalada = false;
  const enApp = () => instalada || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;

  // ------------------------------------------------------------ versión
  // El service worker activo es la versión instalada; si hay otro esperando, es la nueva. Cada uno dice su número.
  let reg = null;
  const oyentes = new Set();
  const avisar = () => oyentes.forEach(f => { try { f(); } catch (e) {} });
  function preguntar(sw) {
    return new Promise(r => {
      if (!sw) return r(null);
      const ch = new MessageChannel(), t = setTimeout(() => r(null), 1500);
      ch.port1.onmessage = e => { clearTimeout(t); r(e.data && e.data.version || null); };
      try { sw.postMessage('version', [ch.port2]); } catch (e) { clearTimeout(t); r(null); }
    });
  }
  function vigilar(r) {
    reg = r; avisar();
    r.addEventListener('updatefound', () => {
      const w = r.installing;
      if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' || w.state === 'activated') avisar(); });
    });
  }

  // ------------------------------------------------------------ la App que ven las pantallas
  window.App = {
    // ir a otra pantalla; extra: entradas del historial que la pantalla nueva usa para sus propios pasos (la partida, 1)
    ir(url, extra = 0) {
      empujar(); pila.push({ url, extra: 0 });
      for (let k = 0; k < extra; k++) { empujar(); top().extra++; }
      cargar(url);
    },
    // cambiar la pantalla actual por otra, sin sumar un paso (de un nivel al siguiente)
    reemplazar(url, extra = top().extra) {
      while (top().extra < extra) { empujar(); top().extra++; }
      top().url = url;
      cargar(url);
    },
    // algo que «atrás» tiene que deshacer: un panel abierto, la pausa por abrir
    abrir() { empujar(); top().extra++; },
    // deshacer pasos, como el «atrás» del teléfono
    volver(n = 1) { if (n > 0) history.go(-n); },
    // cerrar la app («Salir», en la sala). Chrome solo deja que una página se cierre sola en algunos casos;
    // si no se cerró, devuelve false y la sala explica cómo salir
    salir() {
      try { window.close(); } catch (e) {}
      return new Promise(r => setTimeout(() => r(!!window.closed), 350));
    },
    // cuántas entradas tiene encima la pantalla actual
    get extra() { return top().extra; },
    sonido: {
      fx(name, arg, gap) { Sound.play(name, arg, gap); },
      volumen: k => Sound.volume(k),
      setVolumen(k, v) { Sound.ensure(); Sound.setVolume(k, v); },
      duck(on) { Sound.duck(on); },
      musica(tema) { Sound.music(tema); },
    },
    version: {
      // { actual, nueva }: la versión instalada y la que espera (null si no hay)
      async estado() {
        const [actual, nueva] = await Promise.all([preguntar(reg && reg.active), preguntar(reg && reg.waiting)]);
        return { actual, nueva };
      },
      // buscar en el servidor si hay una versión nueva; si aparece, avisa a quien escucha con alCambiar.
      // Devuelve si quedó una esperando (espera a que termine de bajar, si encontró una)
      async buscar() {
        if (!reg) return false;
        try { await reg.update(); } catch (e) { return !!reg.waiting; }
        const w = reg.installing;
        if (w) await new Promise(r => { const f = () => { if (w.state !== 'installing') { w.removeEventListener('statechange', f); r(); } }; w.addEventListener('statechange', f); f(); });
        return !!reg.waiting;
      },
      alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); },
      // la versión que espera pasa a ser la activa y la app se recarga en la sala: antes se funde a oscuro con
      // «Actualizando», que sigue ahí hasta que la sala nueva está cargada (la recarga la hace Chrome, con su barra)
      actualizar() {
        if (!reg || !reg.waiting) return false;
        const w = reg.waiting;
        aviso.hidden = false; velo.classList.add('on'); Sound.duck(true);
        try { sessionStorage.setItem('actualizando', '1'); } catch (e) {}
        navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
        setTimeout(() => w.postMessage('actualizar'), 300);
        return true;
      },
    },
    instalacion: {
      get disponible() { return !enApp(); },
      get cuadro() { return !!cuadro; },
      async abrir() {
        if (!cuadro) return false;
        const c = cuadro; cuadro = null;
        try { c.prompt(); const r = await c.userChoice; if (r && r.outcome === 'accepted') instalada = true; } catch (e) {}
        return true;
      },
      samsung: /SamsungBrowser/i.test(navigator.userAgent),
      ios: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    },
  };

  // ------------------------------------------------------------ arranque
  // el avance del Fogonazo publicado y de la maqueta no se conservan: la colección arranca de cero
  try { localStorage.removeItem('chispazo.v1'); localStorage.removeItem('fogonazo.maqueta.v1'); } catch (e) {}
  try { if (sessionStorage.getItem('actualizando')) { sessionStorage.removeItem('actualizando'); aviso.hidden = false; } } catch (e) {}
  Sound.ensure();   // instalada, Chrome deja sonar sin esperar un toque; si no, arranca con el primero
  girar();
  cargar(INICIO, true);

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').then(vigilar).catch(() => {});
  }
})();
