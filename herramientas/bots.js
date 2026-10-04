// Compara la tasa de victoria de tres bots en los 30 niveles: el de la calibración (62% la mejor jugada),
// uno fuerte (80%) y uno perfecto (siempre la mejor).
// node herramientas/bots.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const E = require('../codigo/engine.js');
const { LEVELS } = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');
function def(n) {
  const b = LEVELS[n - 1], c = CAL[n]; const d = Object.assign({}, b);
  d.goals = b.goals.map(o => Object.assign({}, o));
  if (c.moves) d.moves = c.moves; if (c.time) d.time = c.time;
  if (b.tune === 'score') d.goals[0].n = c.scoreTarget;
  return d;
}
function play(L, seed, skill) {
  const g = E.createGame(L, seed); const rnd = E.rngFrom(seed * 7 + 1); let time = 0;
  while (!g.over) {
    const m = E.botChoose(g, rnd, skill); if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += 1.7 + rnd() * 1.4; for (const s of r.steps) time += E.stepDuration(s) / 1000;
    if (g.mode === 'time') { g.timeLeft = L.time - time; E.evaluateEnd(g, time >= L.time); } else E.evaluateEnd(g);
  }
  if (g.scoreOnly) { E.bonus(g); return E.goalsDone(g); }
  return g.won;
}
if (isMainThread) {
  const skills = [[0.62, 0.2], [0.8, 0.12], [1, 0]];
  const n = 150, res = {};
  let done = 0;
  for (let k = 0; k < 2; k++) {
    const w = new Worker(__filename, { workerData: { ids: LEVELS.map((_, i) => i + 1).filter(i => i % 2 === k), skills, n } });
    w.on('message', m => { res[m.id] = m.r; });
    w.on('exit', () => { if (++done === 2) {
      console.log('nivel  base   fuerte  perfecto');
      for (let i = 1; i <= LEVELS.length; i++) console.log(String(i).padStart(5), res[i].map(v => (v * 100).toFixed(0).padStart(6) + '%').join(' '));
    } });
  }
} else {
  for (const id of workerData.ids) {
    const L = def(id);
    const r = workerData.skills.map(([b, s]) => { let w = 0; for (let k = 0; k < workerData.n; k++) if (play(L, 90000 + k, { best: b, second: s })) w++; return w / workerData.n; });
    parentPort.postMessage({ id, r });
  }
}
