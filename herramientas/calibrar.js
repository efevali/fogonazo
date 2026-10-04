/* Calibración de dificultad con un bot imperfecto: elige los movimientos, el tiempo o la meta de puntos
   de cada nivel para que el bot gane con la tasa que pide levels.js (target).
   node herramientas/calibrar.js [partidas] [mejor] [niveles] → escribe codigo/calibrated.json
   Ejemplo: node herramientas/calibrar.js 400 0.62 16,17,18  (sin lista de niveles, recalibra los 30) */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const E = require('../codigo/engine.js');
const { LEVELS } = require('../codigo/levels.js');

const SKILL = { best: 0.62, second: 0.2 };   // 62% la mejor, 20% la segunda, 18% cualquiera

function play(L, seed, skill) {
  const g = E.createGame(L, seed);
  const rnd = E.rngFrom(seed * 2654435761 >>> 0);
  let time = 0, doneAt = null, doneTime = null;
  while (!g.over) {
    const m = E.botChoose(g, rnd, skill);
    if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += 1.7 + rnd() * 1.4;
    for (const st of r.steps) time += E.stepDuration(st) / 1000;
    if (g.mode === 'time') { g.timeLeft = L.time - time; E.evaluateEnd(g, time >= L.time); }
    else E.evaluateEnd(g);
    if (g.won && doneAt === null) { doneAt = g.movesUsed; doneTime = time; }
  }
  if (g.won) E.bonus(g);
  return { won: g.won, movesUsed: doneAt, time: doneTime, score: g.score };
}

function quantile(arr, q) {
  const a = arr.slice().sort((x, y) => x - y);
  if (!a.length) return 0;
  const pos = Math.min(a.length - 1, Math.max(0, q * (a.length - 1)));
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return a[lo] + (a[hi] - a[lo]) * (pos - lo);
}
const roundTo = (v, s) => Math.max(s, Math.round(v / s) * s);

function calibrate(li, n, skill) {
  const base = LEVELS[li];
  const out = { id: li + 1, name: base.name, tune: base.tune, target: base.target };
  if (base.tune === 'score') {
    const L = Object.assign({}, base);
    const scores = [];
    for (let s = 0; s < n; s++) scores.push(play(L, 1000 + s, skill).score);
    const step = scores.length && quantile(scores, 0.5) > 20000 ? 500 : 100;
    const t = Math.floor(quantile(scores, 1 - base.target) / step) * step;
    const s2 = roundTo(quantile(scores, 1 - base.target * 0.45), step);
    const s3 = roundTo(quantile(scores, 1 - base.target * 0.12), step);
    out.scoreTarget = t;
    out.stars = [t, Math.max(s2, t + step), Math.max(s3, t + 2 * step)];
    out.winRate = scores.filter(x => x >= t).length / scores.length;
    out.medianScore = quantile(scores, 0.5);
    if (base.time) out.time = base.time; else out.moves = base.moves;
    return out;
  }
  // pass 1: distribución de cuándo se completa
  const L1 = Object.assign({}, base);
  if (base.tune === 'moves') L1.moves = 150; else L1.time = 900;
  const done = [];
  for (let s = 0; s < n; s++) {
    const r = play(L1, 1000 + s, skill);
    done.push(r.won ? (base.tune === 'moves' ? r.movesUsed : r.time) : Infinity);
  }
  const finite = done.filter(Number.isFinite);
  out.neverRate = 1 - finite.length / done.length;
  const step = base.tune === 'moves' ? 1 : 5;
  let knob = step, bestErr = 9;
  for (let m = step; m <= (base.tune === 'moves' ? 150 : 900); m += step) {
    const cdf = done.filter(v => v <= m).length / done.length;
    const err = Math.abs(cdf - base.target);
    if (err < bestErr) { bestErr = err; knob = m; }
    if (cdf > base.target + 0.1) break;
  }
  // pass 2: estrellas y verificación con el valor elegido
  const L2 = Object.assign({}, base);
  if (base.tune === 'moves') L2.moves = knob; else L2.time = knob;
  const wins = [];
  let w = 0;
  for (let s = 0; s < n; s++) {
    const r = play(L2, 50000 + s, skill);
    if (r.won) { w++; wins.push(r.score); }
  }
  const st2 = quantile(wins, 0.5) > 20000 ? 500 : 100;
  const s2 = roundTo(quantile(wins, 0.5), st2);
  const s3 = Math.max(s2 + st2, roundTo(quantile(wins, 0.86), st2));
  out.stars = [0, s2, s3];
  out.winRate = w / n;
  if (base.tune === 'moves') out.moves = knob; else out.time = knob;
  out.medianDone = quantile(finite, 0.5);
  return out;
}

if (isMainThread) {
  const n = +process.argv[2] || 300;
  const skill = process.argv[3] ? { best: +process.argv[3], second: 0.2 } : SKILL;
  const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
  const ids = LEVELS.map((_, i) => i).filter(i => !only || only.includes(i + 1));
  const nW = 2;
  const results = [];
  let finished = 0;
  const t0 = Date.now();
  for (let k = 0; k < nW; k++) {
    const mine = ids.filter((_, j) => j % nW === k);
    const wk = new Worker(__filename, { workerData: { ids: mine, n, skill } });
    wk.on('message', m => {
      results.push(m);
      const r = m;
      const knob = r.tune === 'score' ? `obj ${r.scoreTarget}` : r.tune === 'moves' ? `${r.moves} mov` : `${r.time} s`;
      console.log(`L${String(r.id).padStart(2)} ${r.name.padEnd(24)} ${knob.padEnd(12)} win ${(r.winRate * 100).toFixed(0).padStart(3)}% (meta ${(r.target * 100).toFixed(0)}%)  ★ ${r.stars.join(' / ')}${r.neverRate ? '  nunca ' + (r.neverRate * 100).toFixed(1) + '%' : ''}`);
    });
    wk.on('exit', () => {
      finished++;
      if (finished === nW) {
        results.sort((a, b) => a.id - b.id);
        const fs = require('fs');
        let prev = {};
        try { prev = JSON.parse(fs.readFileSync(__dirname + '/../codigo/calibrated.json', 'utf8')); } catch (e) {}
        for (const r of results) prev[r.id] = r;
        fs.writeFileSync(__dirname + '/../codigo/calibrated.json', JSON.stringify(prev, null, 1));
        console.log(`listo en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    });
  }
} else {
  for (const li of workerData.ids) parentPort.postMessage(calibrate(li, workerData.n, workerData.skill));
}
