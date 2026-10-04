// Tasa de victoria del bot (62% mejor jugada) con los movimientos y tiempos calibrados actuales.
// Sirve para ver cuánto cambia un nivel después de tocar reglas.
// node herramientas/medir.js 16,17,18 [partidas]
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const E = require('../codigo/engine.js');
const { LEVELS } = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');
function def(id) {
  const b = LEVELS[id - 1], c = CAL[id]; const d = Object.assign({}, b);
  d.goals = b.goals.map(o => Object.assign({}, o));
  if (c.moves) d.moves = c.moves; if (c.time) d.time = c.time;
  if (b.tune === 'score') d.goals[0].n = c.scoreTarget;
  return d;
}
function play(L, seed) {
  const g = E.createGame(L, seed); const rnd = E.rngFrom(seed * 2654435761 >>> 0); let time = 0;
  while (!g.over) {
    const m = E.botChoose(g, rnd, { best: 0.62, second: 0.2 }); if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += 1.7 + rnd() * 1.4; for (const s of r.steps) time += E.stepDuration(s) / 1000;
    if (g.mode === 'time') { g.timeLeft = L.time - time; E.evaluateEnd(g, time >= L.time); } else E.evaluateEnd(g);
  }
  if (g.scoreOnly) { E.bonus(g); return E.goalsDone(g); }
  return g.won;
}
if (isMainThread) {
  const ids = process.argv[2].split(',').map(Number), n = +process.argv[3] || 300;
  const nW = Math.min(ids.length, require('os').cpus().length), res = {}; let done = 0;
  for (let k = 0; k < nW; k++) {
    const w = new Worker(__filename, { workerData: { ids: ids.filter((_, j) => j % nW === k), n } });
    w.on('message', m => { res[m.id] = m.r; });
    w.on('exit', () => { if (++done === nW) for (const id of ids) console.log(`L${String(id).padStart(2)} ${LEVELS[id - 1].name.padEnd(22)} ${(CAL[id].moves ? CAL[id].moves + ' mov' : CAL[id].time + ' s').padEnd(7)} gana ${(res[id] * 100).toFixed(0).padStart(3)}%   (calibrado: ${(CAL[id].winRate * 100).toFixed(0)}%)`); });
  }
} else {
  for (const id of workerData.ids) { const L = def(id); let w = 0; for (let s = 0; s < workerData.n; s++) if (play(L, 90000 + s)) w++; parentPort.postMessage({ id, r: w / workerData.n }); }
}
