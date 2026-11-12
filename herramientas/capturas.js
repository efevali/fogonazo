/* Recorre la app como en el teléfono y saca una captura de cada pantalla, para revisar antes de publicar.

   node herramientas/capturas.js [carpeta]      (por defecto, dist/capturas)

   Sirve el repositorio en un puerto local, abre la app en horizontal a 915 × 412 con densidad 2,625 (unos
   2400 × 1080 píxeles, como el teléfono de referencia) y verifica el camino y el «atrás» de Android:
   sala → ajustes (LEDs y versión) → Fogonazo → sonido → manual → mapa → partida → pausa → mapa → … → sala. Después abre partidas
   puntuales (la nota, el contrarreloj, los obstáculos, los especiales, el fin de nivel y el zen) con un tablero fijo
   (?semilla=…). Después, el mahjong: el estuche, la partida, la pausa, el final y las dos tortugas; y Biblioteca: la entrada, una
   movida arrastrando, deshacer, la pausa, una partida resuelta hasta el final (Fácil y Normal, con su puerta), Difícil con
   sus dos puertas y la ficha de sin lugar. Al final prueba que la
   app abra sin conexión. Si algo no da lo esperado, lo dice y termina con error. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { abrir } = require('./navegador');

const RAIZ = path.join(__dirname, '..');
const SALIDA = path.resolve(process.argv[2] || path.join(RAIZ, 'dist', 'capturas'));
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

function servidor() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(RAIZ, p);
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

const espera = ms => new Promise(r => setTimeout(r, ms));
let fallas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fallas++; };

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const URL0 = `http://localhost:${srv.address().port}/`;
  const nav = await abrir();
  const ctx = await nav.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, locale: 'es-AR' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });

  const pantalla = () => page.frames().find(f => f !== page.mainFrame());
  const ruta = () => new URL(pantalla().url()).pathname.replace(/^\//, '');
  async function listo() {
    await page.waitForFunction(() => !document.getElementById('velo').classList.contains('on'), null, { timeout: 8000 });
    await pantalla().evaluate(() => document.fonts.ready);
    await espera(500);
  }
  async function partida() { await listo(); await pantalla().waitForFunction(() => window.__partida && window.__partida.g, null, { timeout: 8000 }); await espera(300); }
  // una partida puntual, abierta desde donde se esté (como si se la eligiera en el mapa)
  async function abrirPartida(q) { await page.evaluate(u => App.ir(u, 1), 'fogonazo/partida.html?' + q); await partida(); }
  const estado = () => pantalla().evaluate(() => window.__partida.state());
  // unas jugadas de verdad (las mejores que encuentra el motor) y el final forzado, ganado o perdido
  async function fin(gano, jugadas = 3) {
    for (let i = 0; i < jugadas; i++) await pantalla().evaluate(() => { const P = window.__partida; if (P.state().ended) return; const m = Engine.rankMoves(P.g, null)[0]; return m && P.mover(m.a, m.b); });
    await pantalla().evaluate(v => window.__partida.terminar(v), gano); await pantalla().waitForFunction(() => !document.getElementById('end').hidden, null, { timeout: 30000 }); await espera(1800); }
  async function foto(nombre) { await page.screenshot({ path: path.join(SALIDA, nombre + '.png') }); console.log('    → ' + nombre + '.png'); }
  async function tocar(sel) { await pantalla().locator(sel).first().click({ force: true }); await espera(450); }
  async function atras() { await page.goBack({ waitUntil: 'commit' }).catch(() => {}); await espera(450); }
  const abierto = sel => pantalla().evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !(e.classList.contains('sheet') && e.tagName === 'g' && !e.classList.contains('open')); }, sel);

  console.log('Sala');
  await page.goto(URL0); await listo();
  ok(ruta().startsWith('sala/'), 'arranca en la sala');
  ok(await abierto('#salir'), 'la sala tiene «Salir», abajo a la derecha'); await foto('01-sala');
  await tocar('#hitAudio'); await espera(300);
  ok(await abierto('#sheetAudio'), 'el equipo de audio abre los ajustes');
  ok(await abierto('#instRow'), 'en el navegador, los ajustes ofrecen instalar'); await foto('02-sala-ajustes');
  // el rack: un toque en el cuarto LED de la lluvia la deja en 4; otro toque en el mismo la baja a 3
  const lluvia = () => pantalla().evaluate(() => +document.querySelector('.meter[data-vol=lluvia]').getAttribute('aria-valuenow'));
  const antesLluvia = await lluvia();
  const led = async i => { const m = await (await pantalla().$('.meter[data-vol=lluvia]')).boundingBox(), f = await (await pantalla().frameElement()).boundingBox();
    await page.touchscreen.tap(f.x + m.x + m.width * (i - .5) / 10, f.y + m.y + m.height / 2); await espera(250); };
  await led(4); const en4 = await lluvia(); await led(4);
  ok(en4 === 4 && await lluvia() === 3, 'los LEDs del rack fijan el volumen y el más alto encendido se apaga con otro toque');
  await pantalla().evaluate(v => App.sonido.setVolumen('lluvia', v), antesLluvia);
  const versionSW = /const VERSION = '([\d.]+)'/.exec(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8'))[1];
  await pantalla().waitForFunction(() => /\d/.test(document.getElementById('verTxt').textContent), null, { timeout: 5000 }).catch(() => {});
  ok(await pantalla().evaluate(() => document.getElementById('verTxt').textContent) === 'VERSIÓN ' + versionSW, 'el módulo Sistema muestra la versión instalada (' + versionSW + ')');
  await pantalla().waitForFunction(() => !document.getElementById('updBtn').disabled, null, { timeout: 5000 }).catch(() => {});
  ok(await pantalla().evaluate(() => { const b = document.getElementById('updBtn'); return b.classList.contains('busca') && document.getElementById('updTxt').textContent === 'Buscar'; }),
    'sin versión nueva, el botón dice «Buscar»');
  await tocar('#instBtn');
  ok(await abierto('#sheetSteps'), 'sin el cuadro de Chrome, «Instalar» abre los pasos'); await foto('03-sala-instalar');
  await atras(); ok(!(await abierto('#sheetSteps')) && await abierto('#sheetAudio'), '«atrás» cierra los pasos y vuelve a los ajustes');
  await atras(); ok(!(await abierto('#sheetAudio')), '«atrás» cierra los ajustes');

  console.log('Fogonazo');
  await tocar('#hitBench'); await listo();
  ok(ruta() === 'fogonazo/instrumento.html', 'el banco lleva al instrumento');
  // las aureolas respiran por turno; para la captura se muestran las dos en su punto más alto
  await pantalla().evaluate(() => document.querySelectorAll('.aura').forEach(a => { a.style.animation = 'none'; a.style.opacity = '1'; }));
  await foto('05-fogonazo-instrumento');
  await pantalla().evaluate(() => document.querySelectorAll('.aura').forEach(a => { a.style.animation = ''; a.style.opacity = ''; }));
  const tema = () => page.evaluate(() => (Sound.nowPlaying() || {}).name || null);
  ok(await tema() === 'Taller', 'en el instrumento suena Taller');
  await tocar('#hitSound'); ok(await abierto('#sound'), 'la placa abre el sonido'); await foto('06-fogonazo-sonido');
  await atras(); ok(!(await abierto('#sound')) && ruta() === 'fogonazo/instrumento.html', '«atrás» cierra el sonido');
  await tocar('#hitManual'); ok(await abierto('#manual'), 'la revista abre el manual'); await foto('07-fogonazo-manual');
  const choca = await pantalla().evaluate(() => { const a = document.getElementById('closeManual').getBoundingClientRect(), b = document.getElementById('back').getBoundingClientRect();
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
  ok(!choca, '«Cerrar» no queda encima de «Volver»');
  // el texto de cada columna entra en su hoja, con la letra del manual (PT Serif) cargada
  const entra = () => pantalla().evaluate(() => [...document.querySelectorAll('.pg:not([hidden])')].every(pg => {
    const next = pg.querySelector('.pg-next').getBoundingClientRect(), fondo = pg.getBoundingClientRect().bottom;
    return [...pg.querySelectorAll('.col')].every(c => { const r = c.getBoundingClientRect(), bajo = r.left < next.right && next.left < r.right;
      return c.lastElementChild.getBoundingClientRect().bottom <= (bajo ? next.top : fondo); });
  }) && document.fonts.check('24px "PT Serif"'));
  ok(await entra(), 'el texto de la primera hoja entra, con PT Serif');
  await tocar('[data-pg="2"]'); ok(await abierto('#pg2') && !(await abierto('#pg1')), 'el triangulito pasa a la segunda hoja'); await foto('07b-fogonazo-manual-2');
  ok(await entra(), 'el texto de la segunda hoja entra, con PT Serif');
  await tocar('#closeManual'); ok(!(await abierto('#manual')), '«Cerrar» cierra el manual');
  await tocar('#hitManual'); ok(await abierto('#pg1'), 'el manual vuelve a abrir en la primera hoja');
  await tocar('#closeManual');
  await tocar('#hitScreen'); await listo();
  ok(ruta() === 'fogonazo/mapa.html', 'la pantalla del osciloscopio abre el mapa'); await foto('08-fogonazo-mapa');
  await tocar('.lvl[data-n="1"]'); await partida();
  ok(ruta() === 'fogonazo/partida.html', 'el nivel 1 abre la partida');
  ok(await abierto('#nota'), 'el nivel 1 trae la nota de cuaderno'); await foto('09-fogonazo-partida');
  ok(await tema() === 'Placa', 'en la partida suena Placa');
  // un intercambio con dos toques: hay que encontrar uno que forme línea (gasta un movimiento)
  const movs = () => pantalla().evaluate(() => window.__partida.state().movesUsed);
  const tablero = await (await pantalla().$('#board')).boundingBox();
  const marco = await (await pantalla().frameElement()).boundingBox();
  const celda = (r, c) => [marco.x + tablero.x + (c + .5) * tablero.width / 10, marco.y + tablero.y + (r + .5) * tablero.height / 8];
  const antes = await movs(); let jugo = false;
  for (let r = 0; r < 8 && !jugo; r++) for (let c = 0; c < 9 && !jugo; c++) {
    await page.touchscreen.tap(...celda(r, c)); await espera(60);
    await page.touchscreen.tap(...celda(r, c + 1)); await espera(500);
    jugo = (await movs()) !== antes;
  }
  ok(jugo, 'las piezas se intercambian con dos toques');
  await espera(1500);
  await atras(); ok(await abierto('#menu') && ruta() === 'fogonazo/partida.html', 'en la partida, «atrás» abre la pausa'); await foto('10-fogonazo-pausa');
  await tocar('#menu [data-act="resume"]'); ok(!(await abierto('#menu')), '«Seguir» cierra la pausa');
  await atras(); ok(await abierto('#menu'), 'después de seguir, «atrás» vuelve a abrir la pausa');
  await atras(); await listo(); ok(ruta() === 'fogonazo/mapa.html', 'desde la pausa, «atrás» va al mapa');
  await tocar('.lvl[data-n="1"]'); await partida();
  await tocar('#pause'); ok(await abierto('#menu'), 'el botón de pausa abre la pausa');
  await tocar('#menu [data-act="map"]'); await listo(); ok(ruta() === 'fogonazo/mapa.html', '«Volver al mapa» va al mapa');
  await tocar('.lvl[data-n="1"]'); await partida();
  await tocar('#volver'); await listo(); ok(ruta() === 'fogonazo/mapa.html', 'en la partida, «Volver» va al mapa sin pasar por la pausa');
  await atras(); await listo(); ok(ruta() === 'fogonazo/instrumento.html', 'desde el mapa, «atrás» va al instrumento');
  await atras(); await listo(); ok(ruta().startsWith('sala/'), 'desde el instrumento, «atrás» va a la sala');
  ok(await tema() === null, 'en la sala no hay música');
  const fuera = await page.evaluate(() => history.state && history.state.i);
  ok(fuera === 0, 'en la sala no quedan pasos en el historial: el próximo «atrás» sale de la app');

  console.log('Partidas');
  await abrirPartida('nivel=2&semilla=7');
  ok(await pantalla().evaluate(() => document.getElementById('nota').textContent.includes('RAYO')), 'el nivel 2 presenta el rayo en la nota'); await foto('11-fogonazo-nota');
  await tocar('#volver'); await listo(); ok(ruta().startsWith('sala/'), '«Volver» deja la partida');
  await abrirPartida('nivel=5&semilla=3');
  ok((await estado()).mode === 'time' && await tema() === 'Urgente', 'el contrarreloj (nivel 5) cuenta el tiempo y suena Urgente'); await foto('12-fogonazo-contrarreloj');
  await tocar('#volver'); await listo();
  await abrirPartida('nivel=18&semilla=7'); await foto('13-fogonazo-huecos-quemados'); await tocar('#volver'); await listo();
  await abrirPartida('nivel=20&semilla=7');
  // los especiales se arman jugando; para la captura se ponen unos a mano
  await pantalla().evaluate(() => { const P = window.__partida, g = P.g, K = Engine.K, put = (i, k) => { const p = g.p[i]; if (p && p.k === 0 && !p.lock) { p.k = k; if (k === K.BAT) p.c = -1; } };
    put(0, K.LH); put(11, K.LV); put(9, K.BOMB); put(70, K.ANT); put(79, K.BAT); P.redibujar(); });
  await espera(400); await foto('14-fogonazo-especiales-obstaculos'); await tocar('#volver'); await listo();
  await abrirPartida('nivel=25&semilla=7');
  ok(await pantalla().evaluate(() => window.__partida.g.p.some(p => p && p.k === Engine.K.TUBE)), 'el nivel 25 arranca con una válvula'); await foto('15-fogonazo-valvulas');
  // una jugada de verdad: la mejor que encuentra el motor, con sus animaciones
  const antesJ = (await estado()).movesUsed;
  await pantalla().evaluate(() => { const m = Engine.rankMoves(window.__partida.g, null)[0]; return window.__partida.mover(m.a, m.b); });
  ok((await estado()).movesUsed === antesJ + 1, 'una jugada del motor se anima y gasta un movimiento');
  await tocar('#volver'); await listo();
  await abrirPartida('nivel=4&semilla=3'); await fin(true);
  ok(await pantalla().evaluate(() => document.getElementById('endStamp').textContent === 'APROBADA'), 'al ganar, la etiqueta sale aprobada'); await foto('16-fogonazo-fin-gano');
  await atras(); await listo(); ok(ruta().startsWith('sala/'), 'desde el fin del nivel, «atrás» sale de la partida');
  await abrirPartida('nivel=7&semilla=3'); await fin(false);
  ok(await pantalla().evaluate(() => document.getElementById('endLines').textContent.startsWith('Falt')), 'al perder, la etiqueta dice lo que faltó'); await foto('17-fogonazo-fin-perdio');
  await tocar('#end [data-act="map"]'); await listo();

  console.log('Zen');
  await tocar('#hitBench'); await listo();
  await tocar('[data-knob="modo"][data-i="1"]'); await foto('18-fogonazo-instrumento-zen');
  await tocar('#hitScreen'); await partida();
  ok((await estado()).mode === 'zen' && await tema() === 'Siesta', 'la pantalla en Zen abre la partida zen y suena Siesta');
  await pantalla().evaluate(() => { const m = Engine.rankMoves(window.__partida.g, null)[0]; return window.__partida.mover(m.a, m.b); });
  await espera(1200); await foto('19-fogonazo-zen');
  await atras(); ok(await abierto('#menu') && await pantalla().evaluate(() => !!document.querySelector('#menu [data-act="end"]')), 'en el zen, «atrás» abre la pausa con «Terminar»'); await foto('20-fogonazo-zen-pausa');
  await tocar('#menu [data-act="end"]'); await espera(800);
  ok(await abierto('#end') && await pantalla().evaluate(() => document.getElementById('endHead').textContent === 'PARTE DE TRABAJO'), '«Terminar» muestra el parte de trabajo'); await foto('21-fogonazo-zen-fin');
  await tocar('#end [data-act="map"]'); await listo();
  ok(ruta() === 'fogonazo/instrumento.html' && await pantalla().evaluate(() => /RÉCORD\s+[\d.]+ · \d+:\d\d/.test(document.getElementById('screen').textContent)), 'el instrumento muestra el récord del zen');
  await atras(); await listo(); ok(ruta().startsWith('sala/'), 'del instrumento, «atrás» vuelve a la sala');

  console.log('Mahjong');
  const mj = async () => { await listo(); await pantalla().waitForFunction(() => window.__mahjong && document.querySelectorAll('.ficha').length > 0, null, { timeout: 8000 }); await espera(1000); };
  const mjEstado = () => pantalla().evaluate(() => window.__mahjong.state());
  await tocar('#hitTable'); await listo();
  ok(ruta() === 'mahjong/estuche.html', 'la mesa ratona lleva al estuche');
  ok(await tema() === 'Taller oriental', 'en el estuche suena Taller oriental');
  ok(await pantalla().evaluate(() => document.querySelectorAll('.tarjeta').length) === 6, 'el estuche ofrece los seis tableros'); await foto('22-mahjong-estuche');
  ok(await pantalla().evaluate(() => { const f = document.getElementById('tarjetas').getBoundingClientRect(), u = document.querySelector('.tarjeta:last-child').getBoundingClientRect();
    return u.left < f.right - 8 && u.right > f.right; }), 'la última tarjeta asoma en el borde: la fila se desliza');
  await tocar('.tarjeta[data-id="pagoda"]'); await mj();
  ok(ruta() === 'mahjong/partida.html' && (await mjEstado()).quedan === 88, 'la tarjeta de la pagoda abre su partida, con 88 fichas');
  ok(await tema() === 'Siesta oriental', 'en la partida suena Siesta oriental');
  ok(await pantalla().evaluate(() => document.fonts.check('700 20px "Mahjong JP"')), 'los ideogramas tienen su letra (Mahjong JP)');
  ok(await pantalla().evaluate(() => { const f = [...document.querySelectorAll('.ficha')], a = e => +e.style.getPropertyValue('--a');
    return f.some(e => e.classList.contains('libre') && a(e) === 0) && f.filter(e => !e.classList.contains('libre')).every(e => a(e) >= .18); }),
    'las fichas libres, más claras; las bloqueadas, más oscuras (S-23)');
  const par = await pantalla().evaluate(() => window.__mahjong.parLibre());
  await tocar(`.ficha[data-i="${par[0]}"]`); await tocar(`.ficha[data-i="${par[1]}"]`);
  ok((await mjEstado()).quedan === 86, 'dos toques en un par libre lo juntan');
  await tocar('#b-deshacer'); ok((await mjEstado()).quedan === 88, '«Deshacer» devuelve el par');
  await tocar('#b-pista'); ok(await pantalla().evaluate(() => document.querySelectorAll('.ficha.pista').length === 2), '«Pista» marca un par libre'); await foto('23-mahjong-partida');
  await atras(); ok(await abierto('#menu') && ruta() === 'mahjong/partida.html', 'en la partida, «atrás» abre la pausa'); await foto('24-mahjong-pausa');
  await tocar('#menu [data-act="seguir"]'); ok(!(await abierto('#menu')), '«Seguir» cierra la pausa');
  await pantalla().evaluate(() => window.__mahjong.limpiar()); await espera(2000);
  ok(await abierto('#fin'), 'el tablero limpio muestra la tarjeta del final'); await foto('25-mahjong-fin');
  await atras(); await listo(); ok(ruta() === 'mahjong/estuche.html', 'desde el final, «atrás» vuelve al estuche');
  ok(await pantalla().evaluate(() => /\d:\d\d/.test(document.querySelector('.tarjeta[data-id="pagoda"] i').textContent)), 'la tarjeta de la pagoda anota su récord');
  await tocar('.tarjeta[data-id="tortugamediana"]'); await mj(); await foto('26-mahjong-tortuga');
  ok((await mjEstado()).quedan === 96, 'la tortuga tiene sus 96 fichas');
  await tocar('#volver'); await listo();
  await pantalla().evaluate(() => { const t = document.getElementById('tarjetas'); t.scrollLeft = t.scrollWidth; }); await espera(300);
  await tocar('.tarjeta[data-id="tortuga"]'); await mj(); await foto('27-mahjong-tortuga-grande');
  ok((await mjEstado()).quedan === 144, 'deslizando la fila, la tortuga grande, con sus 144 fichas');
  await tocar('#volver'); await listo(); ok(ruta() === 'mahjong/estuche.html', 'en la partida, «Volver» va al estuche sin pasar por la pausa');
  await atras(); await listo(); ok(ruta().startsWith('sala/'), 'desde el estuche, «atrás» vuelve a la sala');
  const enSala = await page.evaluate(() => history.state && history.state.i);
  ok(enSala === 0, 'en la sala no quedan pasos del mahjong en el historial');

  console.log('Biblioteca');
  const bb = async () => { await listo(); await pantalla().waitForFunction(() => window.__biblioteca && (!window.__biblioteca.state || document.querySelectorAll('.casillero').length > 0), null, { timeout: 8000 }); await espera(300); };
  const bbEstado = () => pantalla().evaluate(() => window.__biblioteca.state());
  await tocar('#hitBiblioteca'); await bb();
  ok(ruta() === 'biblioteca/index.html', 'la biblioteca baja lleva a la entrada de Biblioteca');
  await espera(4200); await foto('30-biblioteca-entrada');
  await tocar('.libro[data-id="facil"]');
  ok(await pantalla().evaluate(() => window.__biblioteca.dificultad()) === 'facil', 'un libro elige la dificultad');
  await tocar('#jugar'); await bb();
  ok(ruta() === 'biblioteca/partida.html' && (await bbEstado()).objetos === 45 && (await bbEstado()).puertas === 1 && await pantalla().evaluate(() => document.querySelectorAll('.casillero').length) === 9, 'Fácil abre una partida de 9 casilleros, 45 objetos y una puerta');
  await foto('31-biblioteca-facil');
  // una movida arrastrando: el primer objeto de adelante, al primer casillero con lugar (los dos, sin puerta cerrada:
  // desde la 0.20.0, Fácil también tiene una)
  const mov = await pantalla().evaluate(() => { const G = window.__biblioteca.G, B = G.bib, R = window.Repartos, abierto = k => !R.cerrada(G.puertas, k); const a = B.findIndex((c, k) => abierto(k) && R.objetos(c).length), i = R.objetos(B[a])[0]; return { a, i, b: B.findIndex((c, k) => k !== a && abierto(k) && R.libres(c).length) }; });
  const de = await pantalla().locator(`.obj.frente[data-k="${mov.a}"][data-i="${mov.i}"]`).boundingBox(), a = await pantalla().locator(`.casillero[data-k="${mov.b}"]`).boundingBox();
  await page.mouse.move(de.x + de.width / 2, de.y + de.height / 2); await page.mouse.down();
  await page.mouse.move(de.x + 30, de.y, { steps: 4 }); await page.mouse.move(a.x + a.width / 2, a.y + a.height * .7, { steps: 8 }); await page.mouse.up(); await espera(900);
  ok((await bbEstado()).movidas === 1, 'arrastrar un objeto a un lugar libre es una movida');
  await tocar('#deshacer'); ok(await pantalla().evaluate(() => JSON.stringify(window.__biblioteca.G.bib) === JSON.stringify(window.__biblioteca.G.inicial)), '«Deshacer» vuelve atrás la movida');
  // tocar arriba del objeto, en la parte de la fila en sombra, también lo agarra; después, tocar otro casillero lo lleva
  const col = await pantalla().locator(`.obj.frente[data-k="${mov.a}"][data-i="${mov.i}"]`).boundingBox(), cas = await pantalla().locator(`.casillero[data-k="${mov.a}"]`).boundingBox();
  await page.mouse.click(col.x + col.width / 2, cas.y + 8); await espera(150);
  ok(await pantalla().evaluate(() => !!document.querySelector('.obj.frente.elegido')), 'toda la columna del casillero agarra el objeto de adelante');
  await page.mouse.click(a.x + a.width / 2, a.y + a.height * .7); await espera(600);
  ok((await bbEstado()).movidas === 2, 'y tocar otro casillero lo lleva ahí');
  await tocar('#deshacer');
  await atras(); ok(await abierto('#menu') && ruta() === 'biblioteca/partida.html', 'en la partida, «atrás» abre la pausa'); await foto('32-biblioteca-pausa');
  await tocar('#menu [data-act="denuevo"]'); ok(!(await bbEstado()).abierta && (await bbEstado()).movidas === 0, '«Empezar de nuevo» repite el reparto desde cero');
  // la solución anotada, entera: la biblioteca queda vacía y aparece la ficha del final
  while (await pantalla().evaluate(() => window.__biblioteca.paso())) await espera(760);
  await espera(800);
  ok(await abierto('#fin') && (await bbEstado()).objetos === 0, 'la solución anotada vacía la biblioteca y muestra el final'); await foto('33-biblioteca-fin');
  await tocar('#fin [data-act="otra"]'); ok(!(await bbEstado()).abierta && (await bbEstado()).objetos === 45, '«Otra partida» reparte otra');
  await tocar('#volver'); await listo(); ok(ruta() === 'biblioteca/index.html', 'en la partida, «Volver» va a la entrada');
  // Normal: una puerta de vidrio; la solución anotada trae su llave, la abre y vacía la biblioteca
  await tocar('.libro[data-id="normal"]'); await tocar('#jugar'); await bb();
  ok((await bbEstado()).objetos === 75 && (await bbEstado()).puertas === 2 && await pantalla().evaluate(() => !!document.querySelector('.casillero .puerta') && !!document.querySelector('.casillero .reja')), 'Normal: 75 objetos, la puerta de vidrio y la reja');
  ok(await pantalla().evaluate(() => { const G = window.__biblioteca.G, k = G.puertas[0].k; return !window.Repartos.mover(window.Repartos.copiar(G.bib), k, window.Repartos.objetos(G.bib[k])[0], (k + 1) % 12, 0, window.Repartos.copiarPuertas(G.puertas)); }), 'lo que está detrás de la puerta no se puede sacar');
  while (await pantalla().evaluate(() => window.__biblioteca.paso())) await espera(760);
  await espera(800);
  ok(await abierto('#fin') && (await bbEstado()).puertas === 0, 'Normal: la solución abre las dos puertas con sus llaves y termina');
  await tocar('#fin [data-act="salir"]'); await listo();
  await tocar('.libro[data-id="dificil"]'); await tocar('#jugar'); await bb();
  ok(await pantalla().evaluate(() => document.querySelectorAll('.casillero').length) === 12 && (await bbEstado()).objetos === 78 && (await bbEstado()).puertas === 2 && await pantalla().evaluate(() => !!document.querySelector('.casillero .reja')), 'Difícil: 12 casilleros, 78 objetos, la puerta de vidrio y la reja');
  ok(await pantalla().evaluate(() => document.getElementById('mueble').classList.contains('silueta') && getComputedStyle(document.querySelector('.obj.atras')).filter.includes('brightness(0)')), 'Difícil: la fila de atrás, en silueta'); await foto('34-biblioteca-dificil');
  // sin lugar: se llenan los lugares libres a mano (sin trío) para ver la ficha
  await pantalla().evaluate(() => { const G = window.__biblioteca.G; G.bib.forEach(c => { c[0] = c[0].map((x, i) => x === null ? (i + 3) % 14 : x); }); window.__biblioteca.repintar(); });
  ok((await bbEstado()).abierta === 'trabada', 'sin lugares libres, aparece «No queda lugar»'); await foto('35-biblioteca-sin-lugar');
  await tocar('#trabada [data-act="denuevo"]'); ok(!(await bbEstado()).abierta && (await bbEstado()).hayMovida, '«Empezar de nuevo» lo deja como al principio');
  await tocar('#volver'); await listo(); await atras(); await listo();
  ok(ruta().startsWith('sala/'), 'desde la entrada, «atrás» vuelve a la sala');
  ok(await page.evaluate(() => history.state && history.state.i) === 0, 'en la sala no quedan pasos de Biblioteca en el historial');

  console.log('Sonido');
  const volFog = await pantalla().evaluate(() => App.sonido.volumen('musica'));
  ok(Number.isInteger(volFog), 'los volúmenes vienen de la colección (música ' + volFog + ')');

  console.log('Sin conexión');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  const conSW = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  if (!conSW) { await page.reload(); await listo(); }
  await ctx.setOffline(true);
  await page.reload(); await listo();
  ok(ruta().startsWith('sala/'), 'sin conexión, la app abre en la sala');
  await tocar('#hitTable'); await listo(); await tocar('.tarjeta[data-id="mariposa"]'); await mj();
  ok(ruta() === 'mahjong/partida.html' && await pantalla().evaluate(() => document.fonts.check('700 20px "Mahjong JP"')), 'sin conexión, el mahjong abre, con su letra');
  await tocar('#volver'); await listo(); await atras(); await listo();
  await tocar('#hitBench'); await listo();
  ok(ruta() === 'fogonazo/instrumento.html', 'sin conexión, Fogonazo abre');
  await ctx.setOffline(false);

  ok(errores.length === 0, 'sin errores en la consola' + (errores.length ? ': ' + errores.join(' | ') : ''));
  await nav.close(); srv.close();
  console.log(fallas ? `\n${fallas} falla(s).` : `\nTodo bien. Capturas en ${SALIDA}`);
  process.exit(fallas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
