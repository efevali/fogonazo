// Mide la tasa de victoria de los niveles de pedido de piezas con y sin la ayuda de piezas del pedido.
// node herramientas/ayuda_piezas.js 3,4,6
const E = require('../codigo/engine.js');
const { LEVELS } = require('../codigo/levels.js');
const fs = require('fs');
const CAL = JSON.parse(fs.readFileSync(__dirname + '/../codigo/calibrated.json', 'utf8'));
const skill = { best: 0.62, second: 0.2 };
function play(L, seed) {
  const g = E.createGame(L, seed); const rnd = E.rngFrom(seed * 2654435761 >>> 0); let time = 0;
  while (!g.over) {
    const m = E.botChoose(g, rnd, skill); if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += 1.7 + rnd() * 1.4; for (const s of r.steps) time += E.stepDuration(s) / 1000;
    if (g.mode === 'time') { g.timeLeft = L.time - time; E.evaluateEnd(g, time >= L.time); } else E.evaluateEnd(g);
  }
  if (g.won) E.bonus(g);
  return { won: g.won, score: g.score };
}
const q = (a, p) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))] : 0; };
const r100 = v => Math.max(100, Math.round(v / 100) * 100);
const ids = process.argv[2].split(',').map(Number), n = 400, out = {};
for (const id of ids) {
  const base = Object.assign({}, LEVELS[id - 1]); base.goals = base.goals.map(o => Object.assign({}, o));
  if (CAL[id].moves) base.moves = CAL[id].moves; if (CAL[id].time) base.time = CAL[id].time;
  const res = {};
  for (const [tag, L] of [['antes', Object.assign({}, base, { bias: 0 })], ['ahora', base]]) {
    const wins = []; let w = 0;
    for (let s = 0; s < n; s++) { const r = play(L, 70000 + s); if (r.won) { w++; wins.push(r.score); } }
    res[tag] = { win: w / n, s2: r100(q(wins, 0.5)), s3: Math.max(r100(q(wins, 0.5)) + 100, r100(q(wins, 0.86))) };
  }
  out[id] = res;
  console.log(`L${String(id).padStart(2)} ${LEVELS[id - 1].name.padEnd(22)} ${(base.moves ? base.moves + ' mov' : base.time + ' s').padEnd(7)} antes ${(res.antes.win * 100).toFixed(0).padStart(3)}%  →  ahora ${(res.ahora.win * 100).toFixed(0).padStart(3)}%   ★ 0/${res.ahora.s2}/${res.ahora.s3}`);
}
