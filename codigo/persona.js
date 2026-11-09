/* El bot persona: elige jugadas como una persona, no como una máquina que ve el futuro (ver docs/fogonazo/README.md,
   «El bot persona»). Solo para las herramientas (Node): no se carga en el juego.

   Cada jugada posible se describe con lo que una persona ve en el tablero (rasgos), separando lo que pasa en el primer
   golpe de lo que agregan después las cascadas, que para una persona son suerte. La elección es probabilística: cada
   jugada tiene un puntaje (la suma de sus rasgos por sus pesos) y se elige con probabilidad proporcional a e^puntaje
   (modelo logit). Los pesos salen de ajustar el modelo a las movidas reales del registro de partidas
   (herramientas/persona.js) y viven en codigo/persona.json. */
const E = require('./engine.js');
const MODELO = require('./persona.json');
const W = 10;
const X = i => i % W, Y = i => (i / W) | 0;

// lo que falta en el tablero para los objetivos de casillas (como targetsLeft del motor, que no se exporta)
function targetsLeft(g) {
  const t = [];
  for (const o of g.goals) {
    if (o.have >= o.need) continue;
    if (o.type === 'pads') { for (let i = 0; i < E.N; i++) if (g.pad[i] > 0) t.push(i); }
    else if (o.type === 'burnt') { for (let i = 0; i < E.N; i++) { const p = g.p[i]; if (p && p.k === E.K.BURNT) t.push(i); } }
    else if (o.type === 'locks') { for (let i = 0; i < E.N; i++) { const p = g.p[i]; if (p && p.lock) t.push(i); } }
  }
  return t;
}

// cuánto vale cada tipo de objetivo cumplido (los mismos pesos relativos que el bot de siempre)
const GOAL_W = { collect: 30, pads: 45, burnt: 45, locks: 35, tubes: 320 };
const SPECIAL_VALUE = [0, 35, 35, 50, 85, 0, 0, 45];

const RASGOS = [
  'meta1',       // avance de objetivos en el primer golpe (lo que se ve), en cientos de puntos-objetivo
  'metaCasc',    // avance de objetivos que agregan las cascadas (suerte; una persona no lo ve)
  'piezas1',     // piezas que se van en el primer golpe, en decenas
  'especial1',   // especial que se arma en el primer golpe (valor), en cientos
  'usaEsp',      // especiales que se gastan con la jugada (tocar o intercambiar uno), en cientos
  'combo',       // la jugada junta dos especiales
  'cerca',       // qué tan cerca de lo que falta cae el primer golpe (0 a 1)
  'puntos1',     // puntos del primer golpe, en miles (pesa sobre todo en los niveles de puntos)
  'abajo',       // qué tan abajo está la jugada (0 arriba, 1 abajo)
  'valvula',     // piezas que el primer golpe saca debajo de una válvula (la hace bajar), en tercios; solo si faltan válvulas
  'bajaValvula', // filas que bajan las válvulas con la jugada entera, cascadas incluidas (la intuición de quien ya jugó)
  'valorBot',    // la evaluación completa del bot de siempre, en cientos (para comparar)
];

function goalGain(before, after, goals) {
  let v = 0;
  goals.forEach((o, k) => {
    const rem = Math.max(0, o.need - before[k]);
    const gained = Math.max(0, after[k] - before[k]);
    if (GOAL_W[o.type]) v += Math.min(gained, rem) * GOAL_W[o.type];
  });
  return v;
}

// los rasgos de intercambiar a con b (o tocar a, si a === b)
function rasgos(g, a, b, targets, sinBot) {
  const c = E.clone(g);
  const pa = g.p[a], pb = g.p[b];
  const r = E.trySwap(c, a, b);
  if (!r.valid) return null;
  const before = g.goals.map(o => o.have);
  const clears = r.steps.filter(s => s.t === 'clear');
  const first = clears.find(s => s.cascade === 1);
  const after1 = first ? first.snap.have : before;
  const afterAll = c.goals.map(o => o.have);
  const meta1 = goalGain(before, after1, g.goals);
  const metaAll = goalGain(before, afterAll, g.goals);
  let esp1 = 0;
  if (first) for (const cr of first.created) esp1 += SPECIAL_VALUE[cr.k];
  const isSp = p => p && ((p.k >= 1 && p.k <= 4) || p.k === 7);
  let usa = 0;
  if (a === b) usa = SPECIAL_VALUE[pa.k];
  else { if (isSp(pa)) usa += SPECIAL_VALUE[pa.k]; if (isSp(pb)) usa += SPECIAL_VALUE[pb.k]; }
  let valvula = 0;
  if (first && g.goals.some(o => o.type === 'tubes' && o.have < o.need)) {
    for (let i = 0; i < E.N; i++) {
      const p = g.p[i];
      if (!p || p.k !== E.K.TUBE) continue;
      for (const cl of first.cleared) if (X(cl.i) === X(i) && Y(cl.i) > Y(i)) valvula++;
    }
  }
  let baja = 0;
  if (g.tubes) {
    const pos = new Map();
    for (let i = 0; i < E.N; i++) { const p = c.p[i]; if (p && p.k === E.K.TUBE) pos.set(p.id, Y(i)); }
    for (let i = 0; i < E.N; i++) { const p = g.p[i]; if (p && p.k === E.K.TUBE) baja += pos.has(p.id) ? pos.get(p.id) - Y(i) : 8 - Y(i); }
  }
  let cerca = 0;
  if (targets.length && first) {
    let d = 99;
    for (const cl of first.cleared) for (const t of targets) d = Math.min(d, Math.abs(X(cl.i) - X(t)) + Math.abs(Y(cl.i) - Y(t)));
    for (const t of first.burnt.concat(first.pads, first.unlocks)) d = 0;
    cerca = Math.max(0, 5 - d) / 5;
  }
  return {
    meta1: meta1 / 100,
    metaCasc: Math.max(0, metaAll - meta1) / 100,
    piezas1: first ? first.cleared.length / 10 : 0,
    especial1: esp1 / 100,
    usaEsp: usa / 100,
    combo: a !== b && isSp(pa) && isSp(pb) ? 1 : 0,
    cerca,
    puntos1: first ? first.score / 1000 : 0,
    abajo: (Y(a) + Y(b)) / 2 / 7,
    valvula: valvula / 3,
    bajaValvula: baja / 3,
    valorBot: sinBot ? 0 : E.evalMove(g, a, b, targets) / 100,
  };
}

// todas las jugadas posibles con sus rasgos; cada par se cuenta una vez, en el sentido que más deja en el primer golpe
// (sinBot: sin la evaluación completa del bot de siempre, que el persona no usa y es lo más lento)
function opciones(g, sinBot) {
  const targets = targetsLeft(g);
  const out = [];
  for (const [a, b] of E.listMoves(g)) {
    if (a === b) { const f = rasgos(g, a, a, targets, sinBot); if (f) out.push({ a, b, f }); continue; }
    const f1 = rasgos(g, a, b, targets, sinBot), f2 = rasgos(g, b, a, targets, sinBot);
    const v = f => f ? f.meta1 + f.especial1 + f.piezas1 : -1e9;
    const f = v(f1) >= v(f2) ? f1 : f2;
    if (f) out.push(v(f1) >= v(f2) ? { a, b, f } : { a: b, b: a, f });
  }
  return out;
}

const puntaje = (f, w) => RASGOS.reduce((s, k) => s + (w[k] || 0) * f[k], 0);

// elige una jugada al azar según los pesos; temple (1 si falta) multiplica los puntajes: más alto, elige más decidido
function elegir(g, rnd, w, temple) {
  const ops = opciones(g, !w.valorBot);
  if (!ops.length) return null;
  const s = ops.map(o => puntaje(o.f, w) * (temple || 1));
  const m = Math.max(...s);
  const e = s.map(x => Math.exp(x - m));
  let r = rnd() * e.reduce((a, x) => a + x, 0);
  for (let k = 0; k < ops.length; k++) { r -= e[k]; if (r <= 0) return ops[k]; }
  return ops[ops.length - 1];
}

// lo que tarda en pensar: un valor al azar de la distribución medida en las partidas reales (cuantiles, interpolados), en segundos
function piensa(rnd, q) {
  const x = rnd() * (q.length - 1), k = Math.floor(x);
  return (q[k] + (q[Math.min(k + 1, q.length - 1)] - q[k]) * (x - k)) / 1000;
}

// una partida entera del bot persona con el nivel d (como lo arma levelAt/applyMode, o una copia con d.n). M: persona.json;
// el reloj suma lo que piensa y las animaciones, como en la partida. Si piensa más de lo que tarda la pista, la ve y a veces
// la sigue. Devuelve si ganó, en qué jugada y segundo completó el pedido, los puntos antes del bonus y al final.
function partida(d, seed, M = MODELO) {
  const g = E.createGame(d, seed), rnd = E.rngFrom(seed * 2654435761 >>> 0), demoraPista = d.n >= 1 && d.n <= 3 ? 5 : 8;
  let time = 0, usadas = null, segundos = null;
  while (!g.over) {
    const t = piensa(rnd, g.mode === 'time' ? M.piensa : M.piensaMovidas);
    const m = (t > demoraPista && rnd() < M.siguePista ? E.rankMoves(g, null)[0] : null) || elegir(g, rnd, M.pesos, M.temple);
    if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += t;
    for (const s of r.steps) time += E.stepDuration(s) / 1000;
    if (g.mode === 'time') { g.timeLeft = d.time - time; E.evaluateEnd(g, time >= d.time); } else E.evaluateEnd(g);
    if (g.won && usadas === null) { usadas = g.movesUsed; segundos = time; }
  }
  const pre = g.score;
  if (g.won) E.bonus(g);
  return { won: g.won, usadas, segundos, pre, puntos: g.score };
}

module.exports = { RASGOS, rasgos, opciones, puntaje, elegir, piensa, partida };
