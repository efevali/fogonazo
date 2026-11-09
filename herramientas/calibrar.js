/* Calibración de dificultad con el bot persona (codigo/persona.js), que elige y piensa como una persona.
   Primero, en cada modo, el límite: los movimientos, el tiempo o la primera meta de puntos de cada nivel, para que el bot
   gane con la tasa que busca el modo (target de levels.js en Difícil; en Normal y Fácil, tasaDe con el recorte de MODES).
   Después, en cada modo (S-28), las estrellas: en los niveles de pedido,
   la cantidad máxima de movidas (o de segundos) para dos y para tres; en los de puntos, la segunda y la tercera meta (o las de `metas`, si el nivel las fija a mano). Se
   eligen para que, de las partidas que el bot gana en ese modo, lleguen a dos estrellas o más y a tres las fracciones de
   `reparto` (MODES, en levels.js). También el fondo de escala del vúmetro de los de pedido. Al final, una verificación
   con las reglas de verdad.
   node herramientas/calibrar.js [partidas] [niveles] [--estrellas] → escribe codigo/calibrated.json
   Ejemplos: node herramientas/calibrar.js 400 16,17,18
             node herramientas/calibrar.js 300 todos --estrellas   (deja el límite de cada modo y rehace las estrellas) */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { partida: play } = require('../codigo/persona.js');
const LV = require('../codigo/levels.js');
const { LEVELS, MODES, resumen } = LV;
const ARCHIVO = __dirname + '/../codigo/calibrated.json';

function quantile(arr, q) {
  const a = arr.slice().sort((x, y) => x - y);
  if (!a.length) return 0;
  const pos = Math.min(a.length - 1, Math.max(0, q * (a.length - 1)));
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return a[lo] + (a[hi] - a[lo]) * (pos - lo);
}
const roundTo = (v, s) => Math.max(s, Math.round(v / s) * s);
const paso = v => v > 20000 ? 500 : 100;
// el umbral de a `step` cuya fracción de valores ≤ umbral queda más cerca de `share`
function umbral(vals, share, step, max) {
  let best = step, err = 9;
  for (let m = step; m <= max; m += step) {
    const f = vals.filter(v => v <= m + 1e-9).length / vals.length, e = Math.abs(f - share);
    if (e < err - 1e-9) { err = e; best = m; }
  }
  return best;
}
// el nivel tal como se juega en un modo, con lo que haya en la calibración
function defIn(id, cal, M) {
  return LV.applyMode(LV.levelAt(id, { [id]: cal }), M);
}

// el límite de un modo: en pedido, los movimientos o el tiempo (de a 1 segundo) para que el bot gane con la tasa que busca
// el modo (tasaDe), con su ayuda de piezas; en puntos, la primera meta, con las mismas movidas o el mismo tiempo
function limite(li, M, n) {
  const base = Object.assign({}, LEVELS[li], { n: li + 1 }), t = LV.tasaDe(base.target, M), out = {};
  if (base.tune === 'score') {
    // con una meta inalcanzable, los puntos de jugar hasta el final (sin bonus): la meta deja ganar a la tasa buscada
    const L = Object.assign({}, base, { goals: [{ type: 'score', n: 1e9 }], ayuda: M.ayuda });
    const scores = [];
    for (let s = 0; s < n; s++) scores.push(play(L, 1000 + s).pre);
    const step = paso(quantile(scores, 0.5));
    out.limite = Math.max(step, Math.floor(quantile(scores, 1 - t) / step) * step);
    out.medianScore = quantile(scores, 0.5);
    return out;
  }
  const L1 = Object.assign({}, base, { ayuda: M.ayuda });
  if (base.tune === 'moves') L1.moves = 150; else L1.time = 900;
  const done = [];
  for (let s = 0; s < n; s++) {
    const r = play(L1, 1000 + s);
    done.push(r.won ? (base.tune === 'moves' ? r.usadas : r.segundos) : Infinity);
  }
  const finite = done.filter(Number.isFinite);
  out.neverRate = 1 - finite.length / done.length;
  let knob = 1, bestErr = 9;
  for (let m = 1; m <= (base.tune === 'moves' ? 150 : 900); m++) {
    const cdf = done.filter(v => v <= m).length / done.length;
    const err = Math.abs(cdf - t);
    if (err < bestErr) { bestErr = err; knob = m; }
    if (cdf > t + 0.1) break;
  }
  out.limite = knob;
  out.medianDone = quantile(finite, 0.5);
  return out;
}

// las estrellas de un modo
function estrellas(id, cal, M, n) {
  const d = defIn(id, cal, M), [r2, r3] = M.reparto;
  if (d.starsBy === 'score') {
    // se juegan todas las movidas (o todo el tiempo) y, si se pasó la primera meta, el bonus de los especiales que quedaron
    const L = Object.assign({}, d, { stars: [d.stars[0], 1e12, 1e12] });
    const fin = [];
    for (let s = 0; s < n; s++) { const r = play(L, 50000 + s); if (r.won) fin.push(r.puntos); }
    const st = paso(quantile(fin, 0.5)), m1 = d.stars[0];
    if (d.metas) { const s2 = roundTo(m1 * d.metas[0], st); return { estrellas: [m1, s2, Math.max(s2 + st, roundTo(m1 * d.metas[1], st))] }; }   // fijadas a mano
    const s2 = Math.max(m1 + st, roundTo(quantile(fin, 1 - r2), st));
    return { estrellas: [m1, s2, Math.max(s2 + st, roundTo(quantile(fin, 1 - r3), st))] };
  }
  const tiempo = d.starsBy === 'time', lim = d.stars[0], step = tiempo ? 5 : 1;
  const u = [], fin = [];
  for (let s = 0; s < n; s++) { const r = play(d, 50000 + s); if (r.won) { u.push(tiempo ? r.segundos : r.usadas); fin.push(r.puntos); } }
  const t2 = umbral(u, r2, step, lim), t3 = umbral(u, r3, step, lim);
  return { estrellas: LV.umbralesDe(lim, t2, t3, step), escala: roundTo(quantile(fin, 0.9), paso(quantile(fin, 0.9))) };
}

// la verificación, con las reglas de verdad: cuántas gana, cuántas llegan a dos estrellas o más y cuántas a tres
function verificar(id, cal, M, n) {
  const d = defIn(id, cal, M), h = [0, 0, 0, 0];
  for (let s = 0; s < n; s++) { const r = play(d, 90000 + s); h[LV.estrellasDe(d, r)]++; }
  return { gana: (n - h[0]) / n, dos: (h[2] + h[3]) / n, tres: h[3] / n };
}

function calibrar(li, n, soloEstrellas, prev) {
  const base = LEVELS[li], id = li + 1;
  const out = { id, name: resumen(base), tune: base.tune, target: base.target, modos: {} };
  for (const M of MODES) {
    const viejo = soloEstrellas && prev && prev.modos && prev.modos[M.id];
    out.modos[M.id] = viejo && viejo.limite ? { limite: viejo.limite } : limite(li, M, n);
  }
  // un modo más fácil nunca da menos movimientos (o tiempo) ni pide una meta más alta que uno más difícil: con la ayuda de
  // piezas, los de pedido de piezas saldrían con menos movimientos en Fácil que en Difícil, y eso no se entiende
  const [F, No, D] = ['facil', 'normal', 'dificil'].map(k => out.modos[k]);
  if (base.tune === 'score') { No.limite = Math.min(No.limite, D.limite); F.limite = Math.min(F.limite, No.limite); }
  else { No.limite = Math.max(No.limite, D.limite); F.limite = Math.max(F.limite, No.limite); }
  // los valores de Difícil, también arriba: el límite de base del nivel
  const dl = out.modos.dificil.limite;
  if (base.tune === 'score') { out.scoreTarget = dl; if (base.time) out.time = base.time; else out.moves = base.moves; }
  else if (base.tune === 'moves') out.moves = dl; else out.time = dl;
  for (const M of MODES) Object.assign(out.modos[M.id], estrellas(id, out, M, n));
  for (const M of MODES) Object.assign(out.modos[M.id], verificar(id, out, M, n), { tasa: LV.tasaDe(base.target, M) });
  out.winRate = out.modos.dificil.gana;
  return out;
}

if (isMainThread) {
  const args = process.argv.slice(2), soloEstrellas = args.includes('--estrellas');
  const [a, c] = args.filter(x => !x.startsWith('--'));
  const n = +a || 300;
  const only = c && c !== 'todos' ? c.split(',').map(Number) : null;
  const ids = LEVELS.map((_, i) => i).filter(i => !only || only.includes(i + 1));
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')); } catch (e) {}
  const nW = Math.min(ids.length, require('os').cpus().length), results = [];
  let finished = 0;
  const t0 = Date.now(), pc = v => String(Math.round(v * 100)).padStart(3) + '%';
  for (let k = 0; k < nW; k++) {
    const mine = ids.filter((_, j) => j % nW === k);
    const wk = new Worker(__filename, { workerData: { ids: mine, n, soloEstrellas, prev } });
    wk.on('error', e => { console.error(e); process.exit(1); });
    wk.on('message', r => {
      results.push(r);
      const knob = r.tune === 'score' ? `obj ${r.scoreTarget}` : r.tune === 'moves' ? `${r.moves} mov` : `${r.time} s`;
      console.log(`L${String(r.id).padStart(2)} ${r.name.padEnd(16)} ${knob.padEnd(10)} meta ${pc(r.target)} · ` + MODES.map(M => {
        const m = r.modos[M.id];
        return `${M.name} ★ ${m.estrellas.join('/')} gana ${pc(m.gana)} (busca ${pc(m.tasa)}) ≥2 ${pc(m.dos)} 3 ${pc(m.tres)}`;
      }).join(' · '));
    });
    wk.on('exit', () => {
      if (++finished < nW) return;
      results.sort((x, y) => x.id - y.id);
      for (const r of results) prev[r.id] = r;
      fs.writeFileSync(ARCHIVO, JSON.stringify(prev, null, 1));
      console.log(`listo en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    });
  }
} else {
  for (const li of workerData.ids) parentPort.postMessage(calibrar(li, workerData.n, workerData.soloEstrellas, workerData.prev[li + 1]));
}
