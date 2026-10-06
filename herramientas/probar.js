// Prueba del motor: juega 180 partidas con el bot (6 por nivel) y verifica después de cada jugada que el
// tablero quede consistente: sin piezas en huecos, sin ids repetidos, la placa quieta y los únicos lugares
// vacíos, los tapados por quemados o cinta.
// node herramientas/probar.js
const E = require('../codigo/engine.js');
const { LEVELS, ZEN } = require('../codigo/levels.js');

let emptySeen = 0;
function checkBoard(g, where) {
  const ids = new Set();
  for (let i = 0; i < E.N; i++) {
    const p = g.p[i];
    if (g.hole[i]) { if (p) throw new Error(where + ': pieza en hueco'); continue; }
    if (!p) { if (!E.shadowed(g, i)) throw new Error(where + ': celda vacía sin tapar ' + i); emptySeen++; continue; }
    if (ids.has(p.id)) throw new Error(where + ': id duplicado');
    ids.add(p.id);
    if ((p.k <= 3 || p.k === E.K.ANT) && (p.c < 0 || p.c >= g.colors)) throw new Error(where + ': color inválido ' + JSON.stringify(p));
  }
  if (!E.isStable(g)) throw new Error(where + ': la placa no quedó quieta');
}

const skill = { best: 0.65, second: 0.2 };
let t0 = Date.now(), games = 0, moves = 0, shuffles = 0;
for (let li = 0; li < LEVELS.length; li++) {
  const L = Object.assign({}, LEVELS[li]);
  if (!L.time) L.moves = 60;
  for (let s = 1; s <= 6; s++) {
    const g = E.createGame(L, s * 7919 + li);
    checkBoard(g, 'init L' + (li + 1));
    const rnd = E.rngFrom(s * 31 + 5);
    let time = 0;
    while (!g.over) {
      const m = E.botChoose(g, rnd, skill);
      if (!m) throw new Error('sin jugadas L' + (li + 1));
      const r = E.trySwap(g, m.a, m.b);
      if (!r.valid) throw new Error('jugada inválida elegida');
      moves++;
      for (const st of r.steps) { time += E.stepDuration(st) / 1000; if (st.t === 'shuffle') shuffles++; }
      time += 2;
      checkBoard(g, 'L' + (li + 1) + ' mov ' + g.movesUsed);
      if (g.mode === 'time') { g.timeLeft = L.time - time; E.evaluateEnd(g, time >= L.time); }
      else E.evaluateEnd(g);
    }
    if (g.won) { E.bonus(g); checkBoard(g, 'bonus L' + (li + 1)); }
    games++;
  }
}
// Modo zen: 6 partidas de 300 jugadas. No termina nunca y el encargo se renueva.
let orders = 0;
for (let s = 1; s <= 6; s++) {
  const g = E.createGame(ZEN, s * 104729);
  checkBoard(g, 'init zen');
  const rnd = E.rngFrom(s * 17 + 3);
  for (let k = 0; k < 300; k++) {
    const m = E.botChoose(g, rnd, skill);
    if (!m) throw new Error('sin jugadas en zen');
    const r = E.trySwap(g, m.a, m.b);
    if (!r.valid) throw new Error('jugada inválida elegida en zen');
    moves++;
    for (const st of r.steps) if (st.t === 'shuffle') shuffles++;
    checkBoard(g, 'zen mov ' + g.movesUsed);
    const before = g.goals[0].color;
    if (E.zenOrder(g)) { orders++; if (g.goals[0].color === before || g.goals[0].have !== 0) throw new Error('encargo mal renovado'); }
    E.evaluateEnd(g, true);
    if (g.over) throw new Error('el modo zen terminó solo');
  }
  games++;
}
console.log(`zen: ${orders} encargos cumplidos en 1800 jugadas`);
const dt = Date.now() - t0;
console.log(`${games} partidas, ${moves} jugadas, ${shuffles} mezclas, ${dt} ms (${(dt / moves).toFixed(2)} ms/jugada), ${emptySeen} celdas vacías tapadas vistas`);
