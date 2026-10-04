/* Chispazo — motor de juego (sin DOM). Corre igual en el navegador y en Node. */
(function (root) {
'use strict';

const W = 8, H = 8, N = W * H;
// Tipos de pieza
const K = { N: 0, LH: 1, LV: 2, BOMB: 3, BAT: 4, TUBE: 5, BURNT: 6, ANT: 7 };

function rngFrom(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const X = i => i % W;
const Y = i => (i / W) | 0;
const I = (x, y) => y * W + x;
const inB = (x, y) => x >= 0 && x < W && y >= 0 && y < H;

function matchable(p) { return p !== null && p.k <= 3 && p.c >= 0; }
function isSpecialK(k) { return k >= 1 && k <= 4; }
function fixed(p) { return p !== null && (p.k === K.BURNT || p.lock === 1); }
function swappable(p) { return p !== null && p.k !== K.BURNT && p.lock !== 1; }
function same(p, c) { return p !== null && p.k <= 3 && p.c === c && c >= 0; }

function mk(g, c, k) { return { id: g.nextId++, c, k: k || 0, hp: 0, lock: 0 }; }

// ---------------------------------------------------------------- creación
function createGame(level, seed) {
  const g = {
    level, rng: rngFrom(seed || 1), nextId: 1,
    hole: new Uint8Array(N), pad: new Uint8Array(N), padOrig: new Uint8Array(N),
    p: new Array(N).fill(null),
    colors: level.colors, score: 0,
    mode: level.time ? 'time' : 'moves',
    moves: level.moves || 0, movesUsed: 0, timeLeft: level.time || 0,
    goals: [], tubes: null, preview: false, over: false, won: false, scoreOnly: false,
  };
  const L = level.layout || null;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L ? L[y][x] : '.';
    const i = I(x, y);
    if (ch === 'x') g.hole[i] = 1;
    else if (ch === '1') g.pad[i] = 1;
    else if (ch === '2') g.pad[i] = 2;
    else if (ch === 'b' || ch === 'B') g.p[i] = { id: g.nextId++, c: -1, k: K.BURNT, hp: ch === 'B' ? 2 : 1, lock: 0 };
    else if (ch === 'k' || ch === 'q') { g.p[i] = { id: g.nextId++, c: -2, k: K.N, hp: 0, lock: 1 }; if (ch === 'q') g.pad[i] = 1; }
    g.padOrig[i] = g.pad[i];
  }
  for (const gl of level.goals) {
    const o = { type: gl.type, color: gl.color, need: 0, have: 0 };
    if (gl.type === 'score' || gl.type === 'collect' || gl.type === 'tubes') o.need = gl.n || 0;
    else if (gl.type === 'pads') for (let i = 0; i < N; i++) o.need += g.pad[i];
    else if (gl.type === 'burnt') for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.BURNT) o.need += p.hp; }
    else if (gl.type === 'locks') for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.lock) o.need++; }
    g.goals.push(o);
  }
  g.scoreOnly = g.goals.length === 1 && g.goals[0].type === 'score';
  g.hasCollect = g.goals.some(o => o.type === 'collect');
  if (level.tubes) g.tubes = { total: level.tubes.n, maxOn: level.tubes.max || 1, spawned: 0, collected: 0 };
  fillInitial(g);
  return g;
}

function pickColorNoMatch(g, i) {
  const x = X(i), y = Y(i);
  for (let tries = 0; tries < 40; tries++) {
    const c = (g.rng() * g.colors) | 0;
    if (x >= 2 && same(g.p[I(x - 1, y)], c) && same(g.p[I(x - 2, y)], c)) continue;
    if (y >= 2 && same(g.p[I(x, y - 1)], c) && same(g.p[I(x, y - 2)], c)) continue;
    return c;
  }
  return (g.rng() * g.colors) | 0;
}

function fillInitial(g) {
  for (let attempt = 0; attempt < 60; attempt++) {
    for (let i = 0; i < N; i++) {
      if (g.hole[i]) continue;
      const p = g.p[i];
      if (p && p.k === K.BURNT) continue;
      if (p && p.lock) p.c = -2; else g.p[i] = null;
    }
    for (let i = 0; i < N; i++) {
      if (g.hole[i]) continue;
      const p = g.p[i];
      if (p && p.k === K.BURNT) continue;
      if (p && p.lock) p.c = pickColorNoMatch(g, i);
      else g.p[i] = mk(g, pickColorNoMatch(g, i), 0);
    }
    if (g.tubes) {
      // arriba de todo, en columnas con camino libre al zócalo; si no hay ninguna, en cualquiera
      const n = Math.min(g.tubes.maxOn, g.tubes.total);
      const cols = [];
      for (let x = 0; x < W; x++) { const t = colTop(g, x); if (t >= 0 && !fixed(g.p[t])) cols.push(x); }
      for (let k = cols.length - 1; k > 0; k--) { const j = (g.rng() * (k + 1)) | 0; [cols[k], cols[j]] = [cols[j], cols[k]]; }
      const free = cols.filter(x => tubeColFree(g, x));
      let placed = 0;
      for (const x of (free.length ? free : cols)) {
        if (placed >= n) break;
        g.p[colTop(g, x)] = mk(g, -1, K.TUBE); placed++;
      }
      g.tubes.spawned = placed;
    }
    if (findRuns(g).length === 0 && hasValidMove(g)) return;
  }
  if (!hasValidMove(g)) shuffle(g);
}

// ---------------------------------------------------------------- jugadas
function wouldMatch(g, i, c) {
  const x = X(i), y = Y(i);
  let n = 1;
  for (let xx = x - 1; xx >= 0 && same(g.p[I(xx, y)], c); xx--) n++;
  for (let xx = x + 1; xx < W && same(g.p[I(xx, y)], c); xx++) n++;
  if (n >= 3) return true;
  n = 1;
  for (let yy = y - 1; yy >= 0 && same(g.p[I(x, yy)], c); yy--) n++;
  for (let yy = y + 1; yy < H && same(g.p[I(x, yy)], c); yy++) n++;
  return n >= 3;
}

function swapMakesMatch(g, a, b) {
  const pa = g.p[a], pb = g.p[b];
  g.p[a] = pb; g.p[b] = pa;
  const r = (matchable(pb) && wouldMatch(g, a, pb.c)) || (matchable(pa) && wouldMatch(g, b, pa.c));
  g.p[a] = pa; g.p[b] = pb;
  return r;
}

// 0 = inválida, 1 = forma línea, 2 = combinación de especiales.
// Una válvula se intercambia como cualquier pieza: solo si el cambio forma una línea.
function moveKind(g, a, b) {
  const pa = g.p[a], pb = g.p[b];
  if (!swappable(pa) || !swappable(pb)) return 0;
  if (pa.k === K.BAT || pb.k === K.BAT) return (pa.k === K.TUBE || pb.k === K.TUBE) ? 0 : 2;
  if (isSpecialK(pa.k) && isSpecialK(pb.k)) return 2;
  if (swapMakesMatch(g, a, b)) return 1;
  return 0;
}

function listMoves(g) {
  const out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = I(x, y);
    if (x + 1 < W && moveKind(g, a, a + 1)) out.push([a, a + 1]);
    if (y + 1 < H && moveKind(g, a, a + W)) out.push([a, a + W]);
  }
  return out;
}

function hasValidMove(g) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = I(x, y);
    if (x + 1 < W && moveKind(g, a, a + 1)) return true;
    if (y + 1 < H && moveKind(g, a, a + W)) return true;
  }
  return false;
}

// ---------------------------------------------------------------- líneas
function findRuns(g) {
  const runs = [];
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const p = g.p[I(x, y)];
      if (!matchable(p)) { x++; continue; }
      let x2 = x + 1;
      while (x2 < W && same(g.p[I(x2, y)], p.c)) x2++;
      if (x2 - x >= 3) { const cells = []; for (let k = x; k < x2; k++) cells.push(I(k, y)); runs.push({ dir: 'h', cells, c: p.c }); }
      x = x2;
    }
  }
  for (let x = 0; x < W; x++) {
    let y = 0;
    while (y < H) {
      const p = g.p[I(x, y)];
      if (!matchable(p)) { y++; continue; }
      let y2 = y + 1;
      while (y2 < H && same(g.p[I(x, y2)], p.c)) y2++;
      if (y2 - y >= 3) { const cells = []; for (let k = y; k < y2; k++) cells.push(I(x, k)); runs.push({ dir: 'v', cells, c: p.c }); }
      y = y2;
    }
  }
  return runs;
}

function groupRuns(runs) {
  const parent = runs.map((_, i) => i);
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const owner = new Map();
  runs.forEach((r, ri) => {
    for (const c of r.cells) {
      if (owner.has(c)) { const a = find(ri), b = find(owner.get(c)); if (a !== b) parent[a] = b; }
      else owner.set(c, ri);
    }
  });
  const map = new Map();
  runs.forEach((r, ri) => {
    const root = find(ri);
    let gr = map.get(root);
    if (!gr) { gr = { runs: [], cells: new Set(), c: r.c }; map.set(root, gr); }
    gr.runs.push(r);
    for (const c of r.cells) gr.cells.add(c);
  });
  return [...map.values()];
}

function decideSpecial(g, gr, prefer) {
  let maxLen = 0, hasH = false, hasV = false, longest = null;
  for (const r of gr.runs) {
    if (r.cells.length > maxLen) { maxLen = r.cells.length; longest = r; }
    if (r.dir === 'h') hasH = true; else hasV = true;
  }
  let k = -1;
  if (maxLen >= 5) k = K.BAT;
  else if (hasH && hasV) k = K.BOMB;
  else if (maxLen === 4) k = longest.dir === 'h' ? K.LH : K.LV;
  if (k < 0) return null;
  const ok = i => g.p[i] && !g.p[i].lock;
  let pos = -1;
  if (prefer) for (const i of prefer) if (gr.cells.has(i) && ok(i)) { pos = i; break; }
  if (pos < 0 && k === K.BOMB) {
    const hs = new Set();
    for (const r of gr.runs) if (r.dir === 'h') for (const i of r.cells) hs.add(i);
    outer: for (const r of gr.runs) if (r.dir === 'v') for (const i of r.cells) if (hs.has(i) && ok(i)) { pos = i; break outer; }
  }
  if (pos < 0) {
    const cells = longest.cells;
    const mid = cells[(cells.length - 1) >> 1];
    if (ok(mid)) pos = mid;
    else { const f = [...gr.cells].find(ok); pos = f === undefined ? -1 : f; }
  }
  if (pos < 0) return null;
  return { i: pos, k, c: gr.c };
}

// ---------------------------------------------------------------- impactos
function newWave() { return { hits: new Map(), matchCells: new Set(), queue: [], fx: [], consumed: new Set() }; }

function hitCell(g, w, i, t) {
  if (g.hole[i]) return;
  if (w.hits.has(i)) { if (t < w.hits.get(i)) w.hits.set(i, t); return; }
  w.hits.set(i, t);
  const p = g.p[i];
  if (p && isSpecialK(p.k) && !w.consumed.has(p.id)) w.queue.push({ i, t, p });
}

function beamRow(g, w, y, x0, t0) {
  w.fx.push({ type: 'beam', dir: 'h', i: I(x0, y), t: t0 });
  for (let x = 0; x < W; x++) hitCell(g, w, I(x, y), t0 + 28 * Math.abs(x - x0));
}
function beamCol(g, w, x, y0, t0) {
  w.fx.push({ type: 'beam', dir: 'v', i: I(x, y0), t: t0 });
  for (let y = 0; y < H; y++) hitCell(g, w, I(x, y), t0 + 28 * Math.abs(y - y0));
}
function blast(g, w, i, r, t0, square) {
  const x = X(i), y = Y(i);
  w.fx.push({ type: 'blast', i, r, t: t0 });
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = square ? Math.max(Math.abs(dx), Math.abs(dy)) : Math.abs(dx) + Math.abs(dy);
    if (d > r || !inB(x + dx, y + dy)) continue;
    hitCell(g, w, I(x + dx, y + dy), t0 + 45 * d);
  }
}

function zapColor(g, w, from, c, t0) {
  const targets = [];
  for (let j = 0; j < N; j++) { const q = g.p[j]; if (matchable(q) && q.c === c) targets.push(j); }
  w.fx.push({ type: 'zap', i: from, to: targets.slice(), t: t0 });
  targets.forEach((j, n) => hitCell(g, w, j, t0 + 110 + n * 30));
  return targets;
}

function activate(g, w, i, p, t) {
  const x = X(i), y = Y(i);
  if (p.k === K.LH) beamRow(g, w, y, x, t + 30);
  else if (p.k === K.LV) beamCol(g, w, x, y, t + 30);
  else if (p.k === K.BOMB) blast(g, w, i, 2, t + 60, false);
  else if (p.k === K.BAT) {
    const cnt = new Array(8).fill(0);
    for (let j = 0; j < N; j++) { const q = g.p[j]; if (matchable(q) && !w.hits.has(j)) cnt[q.c]++; }
    let c = -1, best = 0;
    for (let k = 0; k < 8; k++) if (cnt[k] > best) { best = cnt[k]; c = k; }
    if (c >= 0) zapColor(g, w, i, c, t + 40);
  }
}

// combinación por intercambio. ia = donde quedó la pieza arrastrada.
function comboWave(g, ia, ib, steps) {
  const w = newWave();
  const A = g.p[ia], B = g.p[ib];
  if (A.k === K.BAT || B.k === K.BAT) {
    const iBat = A.k === K.BAT ? ia : ib, iO = iBat === ia ? ib : ia;
    const bat = g.p[iBat], O = g.p[iO];
    w.consumed.add(bat.id);
    if (O.k === K.BAT) {
      w.consumed.add(O.id);
      w.fx.push({ type: 'nova', i: ia, t: 0 });
      const cx = X(ia), cy = Y(ia);
      for (let j = 0; j < N; j++) hitCell(g, w, j, 140 + 40 * Math.max(Math.abs(X(j) - cx), Math.abs(Y(j) - cy)));
    } else {
      const c = O.c;
      if (O.k === K.LH || O.k === K.LV || O.k === K.BOMB) {
        const tr = [];
        for (let j = 0; j < N; j++) {
          const q = g.p[j];
          if (q && q.k === K.N && q.c === c && !q.lock) {
            q.k = O.k === K.BOMB ? K.BOMB : (g.rng() < 0.5 ? K.LH : K.LV);
            tr.push({ id: q.id, i: j, k: q.k });
          }
        }
        if (tr.length) steps.push({ t: 'transform', list: tr });
      }
      hitCell(g, w, iBat, 0);
      zapColor(g, w, iBat, c, 0);
    }
  } else {
    w.consumed.add(A.id); w.consumed.add(B.id);
    hitCell(g, w, ia, 0); hitCell(g, w, ib, 0);
    const cx = X(ia), cy = Y(ia);
    const line = k => k === K.LH || k === K.LV;
    if (line(A.k) && line(B.k)) {
      beamRow(g, w, cy, cx, 30); beamCol(g, w, cx, cy, 30);
    } else if (A.k === K.BOMB && B.k === K.BOMB) {
      blast(g, w, ia, 2, 60, true);
      w.fx[w.fx.length - 1].big = true;
    } else {
      for (let d = -1; d <= 1; d++) {
        if (cy + d >= 0 && cy + d < H) beamRow(g, w, cy + d, cx, 40);
        if (cx + d >= 0 && cx + d < W) beamCol(g, w, cx + d, cy, 40);
      }
    }
  }
  return w;
}

// ---------------------------------------------------------------- aplicar
function addGoal(g, type, n) { for (const o of g.goals) if (o.type === type) o.have += n; }
function addCollect(g, c, n) { for (const o of g.goals) if (o.type === 'collect' && o.color === c) o.have += n; }
function syncScore(g) { for (const o of g.goals) if (o.type === 'score') o.have = g.score; }
function snap(g) { return { score: g.score, have: g.goals.map(o => o.have), moves: g.moves }; }

function applyWave(g, w, cascade, created) {
  const step = { t: 'clear', cascade, cleared: [], pads: [], burnt: [], unlocks: [], created: [], fx: w.fx, score: 0, popups: [] };
  let pts = 0, cx = 0, cy = 0, cn = 0;
  const burntDone = new Set();
  const dmgBurnt = (i, t) => {
    if (burntDone.has(i)) return;
    burntDone.add(i);
    const p = g.p[i];
    p.hp--; addGoal(g, 'burnt', 1); pts += 60;
    step.burnt.push({ i, id: p.id, hp: p.hp, t });
    if (p.hp <= 0) g.p[i] = null;
    cx += X(i); cy += Y(i); cn++;
  };
  for (const [i, t] of w.hits) {
    if (g.pad[i] > 0) { g.pad[i]--; addGoal(g, 'pads', 1); pts += 40; step.pads.push({ i, lv: g.pad[i], t }); }
    const p = g.p[i];
    if (!p) continue;
    if (p.k === K.BURNT) { dmgBurnt(i, t); continue; }
    if (p.lock) { p.lock = 0; addGoal(g, 'locks', 1); pts += 40; step.unlocks.push({ i, id: p.id, t }); continue; }
    if (p.k === K.TUBE) continue;
    g.p[i] = null;
    step.cleared.push({ i, id: p.id, c: p.c, k: p.k, t });
    pts += 20; cx += X(i); cy += Y(i); cn++;
    if (p.c >= 0) addCollect(g, p.c, 1);
  }
  for (const i of w.matchCells) {
    const x = X(i), y = Y(i);
    const nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (const [nx, ny] of nb) {
      if (!inB(nx, ny)) continue;
      const j = I(nx, ny), q = g.p[j];
      if (q && q.k === K.BURNT) dmgBurnt(j, 60);
    }
  }
  for (const s of created) {
    if (g.p[s.i] !== null) continue;
    const np = mk(g, s.k === K.BAT ? -1 : s.c, s.k);
    g.p[s.i] = np;
    step.created.push({ i: s.i, id: np.id, c: np.c, k: np.k });
    pts += s.k === K.BAT ? 200 : s.k === K.BOMB ? 100 : 60;
  }
  step.score = pts * Math.min(cascade, 8);
  g.score += step.score;
  syncScore(g);
  if (step.score > 0) {
    if (cn === 0 && step.pads.length) { for (const p of step.pads) { cx += X(p.i); cy += Y(p.i); cn++; } }
    if (cn > 0) step.popups.push({ x: cx / cn, y: cy / cn, v: step.score, cascade });
  }
  step.snap = snap(g);
  return step;
}

function countTubes(g) { let n = 0; for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.TUBE) n++; } return n; }

// ---------------------------------------------------------------- caída
// La caída avanza de a un casillero por paso ("tick"):
//  1. Cae derecho todo lo que puede. Los huecos de la placa se atraviesan; los quemados
//     y las piezas encintadas no dejan pasar nada.
//  2. Entra una pieza nueva arriba de cada columna que tenga lugar.
//  3. Un lugar vacío tapado desde arriba por un quemado o una cinta se llena en diagonal (45°)
//     con una pieza quieta de una columna vecina. Uno por columna y por paso; las válvulas
//     nunca se mueven en diagonal.
// Un lugar sin camino desde arriba queda vacío hasta que se rompa lo que lo tapa.
function movable(p) { return p !== null && !fixed(p); }
function belowCell(g, i) { const x = X(i); for (let y = Y(i) + 1; y < H; y++) { const j = I(x, y); if (!g.hole[j]) return j; } return -1; }
function aboveCell(g, i) { const x = X(i); for (let y = Y(i) - 1; y >= 0; y--) { const j = I(x, y); if (!g.hole[j]) return j; } return -1; }
function colTop(g, x) { for (let y = 0; y < H; y++) { const j = I(x, y); if (!g.hole[j]) return j; } return -1; }
function colBottom(g, x) { for (let y = H - 1; y >= 0; y--) { const j = I(x, y); if (!g.hole[j]) return j; } return -1; }
// vacío tapado: lo primero que hay arriba (saltando vacíos y huecos) es algo fijo
function shadowed(g, i) {
  const x = X(i);
  for (let y = Y(i) - 1; y >= 0; y--) {
    const j = I(x, y);
    if (g.hole[j] || g.p[j] === null) continue;
    return fixed(g.p[j]);
  }
  return false;
}
// pieza que puede entrar en diagonal a un vacío tapado: se mueve, no es válvula y está apoyada
function diagSource(g, s, moved) {
  const p = g.p[s];
  if (g.hole[s] || !movable(p) || p.k === K.TUBE || (moved && moved.has(p.id))) return false;
  const b = belowCell(g, s);
  return b < 0 || g.p[b] !== null;
}
// columna sin nada fijo: una válvula puede bajar derecho hasta el zócalo
function tubeColFree(g, x) {
  if (colTop(g, x) < 0) return false;
  for (let y = 0; y < H; y++) if (fixed(g.p[I(x, y)])) return false;
  return true;
}

const MAX_TICKS = 400;
function gravity(g) {
  const step = { t: 'fall', ticks: 0, moves: [], spawns: [] };
  const recs = new Map();
  const track = (p, from) => {
    if (recs.has(p.id)) return recs.get(p.id);
    const r = { id: p.id, x: X(from), from: Y(from), path: [] };
    recs.set(p.id, r); step.moves.push(r);
    return r;
  };
  // ¿aparece una válvula en esta caída? (misma probabilidad que antes)
  let tubeWant = false;
  if (g.tubes && !g.preview && g.tubes.spawned < g.tubes.total) {
    const on = countTubes(g);
    if (on < g.tubes.maxOn && (on === 0 || g.rng() < 0.18)) tubeWant = true;
  }
  let k = 0;
  for (; k < MAX_TICKS; k++) {
    let any = false;
    const moved = new Set();
    // 1. derecho, de abajo hacia arriba
    for (let x = 0; x < W; x++) {
      for (let y = H - 1; y >= 0; y--) {
        const j = I(x, y);
        if (g.hole[j] || g.p[j] !== null) continue;
        const a = aboveCell(g, j);
        if (a < 0) continue;
        const p = g.p[a];
        if (!movable(p) || moved.has(p.id)) continue;
        track(p, a).path.push([k, x, y]);
        g.p[j] = p; g.p[a] = null; moved.add(p.id); any = true;
      }
    }
    // 2. piezas nuevas por arriba
    if (!g.preview) {
      const tops = [];
      for (let x = 0; x < W; x++) { const t = colTop(g, x); if (t >= 0 && g.p[t] === null) tops.push(t); }
      let tubeAt = -1;
      if (tubeWant && tops.length) {
        // solo en columnas con camino libre al zócalo; si no hay ninguna en la placa, en cualquiera
        let anyFree = false;
        for (let x = 0; x < W && !anyFree; x++) if (tubeColFree(g, x)) anyFree = true;
        const ok = tops.filter(t => !anyFree || tubeColFree(g, X(t)));
        if (ok.length) { tubeAt = ok[(g.rng() * ok.length) | 0]; tubeWant = false; }
      }
      for (const t of tops) {
        let p;
        if (t === tubeAt) { p = mk(g, -1, K.TUBE); g.tubes.spawned++; }
        else p = mk(g, spawnColor(g), 0);
        g.p[t] = p; moved.add(p.id); any = true;
        const r = { id: p.id, c: p.c, k: p.k, x: X(t), from: -1, path: [[k, X(t), Y(t)]] };
        recs.set(p.id, r); step.spawns.push(r);
      }
    }
    // 3. en diagonal hacia los lugares tapados
    for (let x = 0; x < W; x++) {
      for (let y = 1; y < H; y++) {
        const e = I(x, y);
        if (g.hole[e] || g.p[e] !== null || !shadowed(g, e)) continue;
        const cand = [];
        if (x > 0 && diagSource(g, I(x - 1, y - 1), moved)) cand.push(I(x - 1, y - 1));
        if (x < W - 1 && diagSource(g, I(x + 1, y - 1), moved)) cand.push(I(x + 1, y - 1));
        if (!cand.length) continue;
        g.flip = (g.flip || 0) + 1;
        const s = cand.length === 1 ? cand[0] : cand[g.flip & 1];
        const p = g.p[s];
        track(p, s).path.push([k, x, y]);
        g.p[e] = p; g.p[s] = null; moved.add(p.id); any = true;
        break;
      }
    }
    if (!any) break;
  }
  step.ticks = k;
  for (const r of step.moves) { const l = r.path[r.path.length - 1]; r.to = l[2]; r.tx = l[1]; }
  for (const r of step.spawns) { const l = r.path[r.path.length - 1]; r.to = l[2]; r.tx = l[1]; }
  return step;
}

// La placa quedó quieta: nada puede caer, entrar ni deslizarse (lo usan las pruebas).
function isStable(g) {
  for (let x = 0; x < W; x++) {
    const t = colTop(g, x);
    if (t >= 0 && g.p[t] === null) return false;
  }
  for (let i = 0; i < N; i++) {
    if (g.hole[i] || g.p[i] !== null) continue;
    const a = aboveCell(g, i);
    if (a >= 0 && movable(g.p[a])) return false;
    if (!shadowed(g, i)) return false;
    const x = X(i), y = Y(i);
    if (y > 0 && ((x > 0 && diagSource(g, I(x - 1, y - 1))) || (x < W - 1 && diagSource(g, I(x + 1, y - 1))))) return false;
  }
  return true;
}

// En los niveles con pedido de piezas, una fracción de las piezas nuevas toma un color
// que el pedido todavía necesita, para que el juego no las retacee. La ayuda es proporcional
// a cuántos tipos faltan sobre el total, así pesa parecido en pedidos de uno o de varios tipos.
const COLLECT_BIAS = 0.14;
function spawnColor(g) {
  if (g.hasCollect) {
    const need = [];
    for (const o of g.goals) if (o.type === 'collect' && o.have < o.need) need.push(o.color);
    const bias = g.level.bias !== undefined ? g.level.bias : COLLECT_BIAS * need.length / g.colors;
    if (need.length && g.rng() < bias) return need[(g.rng() * need.length) | 0];
  }
  return (g.rng() * g.colors) | 0;
}

// el zócalo es la última celda de cada columna (sin contar huecos)
function collectTubes(g) {
  const got = [];
  for (let x = 0; x < W; x++) {
    const i = colBottom(g, x);
    if (i < 0) continue;
    const p = g.p[i];
    if (p && p.k === K.TUBE) { g.p[i] = null; got.push({ i, id: p.id }); g.tubes.collected++; addGoal(g, 'tubes', 1); }
  }
  return got;
}

function settle(g, steps) {
  for (let k = 0; k < 20; k++) {
    const f = gravity(g);
    if (f.moves.length || f.spawns.length) steps.push(f);
    if (!g.tubes) return;
    const got = collectTubes(g);
    if (!got.length) return;
    const sc = 500 * got.length;
    g.score += sc; syncScore(g);
    steps.push({ t: 'collect', tubes: got, score: sc, snap: snap(g) });
  }
}

function resolveAll(g, steps, first, prefer) {
  let cascade = 0;
  for (let guard = 0; guard < 80; guard++) {
    const runs = findRuns(g);
    let w;
    if (cascade === 0 && first) w = first;
    else { if (!runs.length) break; w = newWave(); }
    cascade++;
    const created = [];
    if (runs.length) {
      for (const gr of groupRuns(runs)) {
        const sp = decideSpecial(g, gr, cascade === 1 ? prefer : null);
        for (const i of gr.cells) { w.matchCells.add(i); hitCell(g, w, i, 0); }
        if (sp) created.push(sp);
      }
    }
    for (let q = 0; q < w.queue.length; q++) { const e = w.queue[q]; activate(g, w, e.i, e.p, e.t); }
    steps.push(applyWave(g, w, cascade, created));
    settle(g, steps);
  }
}

function shuffle(g) {
  const idxs = [];
  for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.N && !p.lock) idxs.push(i); }
  const orig = idxs.map(i => g.p[i].c);
  let cols = orig.slice();
  for (let tries = 0; tries < 300; tries++) {
    if (tries < 150) {
      for (let k = cols.length - 1; k > 0; k--) { const j = (g.rng() * (k + 1)) | 0; [cols[k], cols[j]] = [cols[j], cols[k]]; }
    } else cols = idxs.map(() => (g.rng() * g.colors) | 0);
    idxs.forEach((i, n) => { g.p[i].c = cols[n]; });
    if (findRuns(g).length === 0 && hasValidMove(g)) break;
  }
  return { t: 'shuffle', list: idxs.map(i => ({ id: g.p[i].id, c: g.p[i].c })) };
}

// ---------------------------------------------------------------- API
function trySwap(g, a, b) {
  const steps = [];
  if (g.over) return { valid: false, steps };
  if (Math.abs(X(a) - X(b)) + Math.abs(Y(a) - Y(b)) !== 1) return { valid: false, steps };
  const pa = g.p[a], pb = g.p[b];
  if (!swappable(pa) || !swappable(pb)) return { valid: false, steps, blocked: true };
  const kind = moveKind(g, a, b);
  if (kind === 0) {
    steps.push({ t: 'swap', a, b, ida: pa.id, idb: pb.id, back: true });
    return { valid: false, steps };
  }
  g.p[a] = pb; g.p[b] = pa;
  steps.push({ t: 'swap', a, b, ida: pa.id, idb: pb.id });
  if (g.mode === 'moves') g.moves--;
  g.movesUsed++;
  const first = kind === 2 ? comboWave(g, b, a, steps) : null;
  resolveAll(g, steps, first, [b, a]);
  if (g.tubes) settle(g, steps);
  if (!g.preview) {
    for (let k = 0; k < 4 && !hasValidMove(g); k++) {
      steps.push(shuffle(g));
      if (findRuns(g).length) resolveAll(g, steps, null, null);
    }
  }
  return { valid: true, steps };
}

function goalsDone(g) { return g.goals.every(o => o.have >= o.need); }

function evaluateEnd(g, timeUp) {
  if (g.over) return;
  if (!g.scoreOnly && goalsDone(g)) { g.over = true; g.won = true; return; }
  if (g.mode === 'moves' && g.moves <= 0) { g.over = true; g.won = goalsDone(g); return; }
  if (g.mode === 'time' && timeUp) { g.over = true; g.won = goalsDone(g); }
}

// Final: los movimientos (o segundos) sobrantes se convierten en rayos.
function bonus(g) {
  const steps = [];
  let n = g.mode === 'moves' ? g.moves : Math.ceil(Math.max(0, g.timeLeft) / 5);
  if (g.scoreOnly) n = 0;
  n = Math.min(n, 20);
  if (n > 0) {
    const cands = [];
    for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.N && !p.lock) cands.push(i); }
    for (let k = cands.length - 1; k > 0; k--) { const j = (g.rng() * (k + 1)) | 0; [cands[k], cands[j]] = [cands[j], cands[k]]; }
    const pick = cands.slice(0, n);
    const tr = pick.map(i => { const p = g.p[i]; p.k = g.rng() < 0.5 ? K.LH : K.LV; return { id: p.id, i, k: p.k }; });
    if (tr.length) {
      steps.push({ t: 'transform', list: tr, bonus: true });
      const w = newWave();
      pick.forEach((i, k) => hitCell(g, w, i, k * 110));
      resolveAll(g, steps, w, null);
    }
  }
  for (let r = 0; r < 4; r++) {
    const sp = [];
    for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && isSpecialK(p.k)) sp.push(i); }
    if (!sp.length) break;
    const w = newWave();
    sp.forEach((i, k) => hitCell(g, w, i, k * 120));
    resolveAll(g, steps, w, null);
  }
  if (g.mode === 'moves') g.moves = 0;
  return steps;
}

function clone(g) {
  const c = Object.assign({}, g);
  c.p = g.p.map(p => (p ? Object.assign({}, p) : null));
  c.pad = g.pad.slice();
  c.goals = g.goals.map(o => Object.assign({}, o));
  c.tubes = g.tubes ? Object.assign({}, g.tubes) : null;
  c.preview = true;
  c.rng = rngFrom(12345);
  return c;
}

// ---------------------------------------------------------------- bot / pistas
const SPECIAL_VALUE = [0, 35, 35, 50, 85, 0, 0];

function targetsLeft(g) {
  const t = [];
  for (const o of g.goals) {
    if (o.have >= o.need) continue;
    if (o.type === 'pads') { for (let i = 0; i < N; i++) if (g.pad[i] > 0) t.push(i); }
    else if (o.type === 'burnt') { for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.BURNT) t.push(i); } }
    else if (o.type === 'locks') { for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.lock) t.push(i); } }
  }
  return t;
}

function evalMove(g, a, b, targets) {
  const c = clone(g);
  const r = trySwap(c, a, b);
  if (!r.valid) return -1e9;
  let v = 0;
  g.goals.forEach((o, k) => {
    const gained = c.goals[k].have - o.have;
    const rem = Math.max(0, o.need - o.have);
    if (o.type === 'collect') v += Math.min(gained, rem) * 30;
    else if (o.type === 'pads') v += Math.min(gained, rem) * 45;
    else if (o.type === 'burnt') v += Math.min(gained, rem) * 45;
    else if (o.type === 'locks') v += Math.min(gained, rem) * 35;
    else if (o.type === 'tubes') v += Math.min(gained, rem) * 320;
  });
  v += (c.score - g.score) / (g.scoreOnly ? 6 : 40);
  const few = targets && targets.length > 0 && targets.length <= 5;
  let sv = 0;
  for (let i = 0; i < N; i++) {
    const p0 = g.p[i]; if (p0) sv -= SPECIAL_VALUE[p0.k];
    const p1 = c.p[i]; if (p1) sv += SPECIAL_VALUE[p1.k];
  }
  v += sv * (g.scoreOnly ? 1.4 : few ? 2 : 1);
  if (g.tubes) {
    const pos = new Map();
    for (let i = 0; i < N; i++) { const p = c.p[i]; if (p && p.k === K.TUBE) pos.set(p.id, Y(i)); }
    for (let i = 0; i < N; i++) { const p = g.p[i]; if (p && p.k === K.TUBE && pos.has(p.id)) v += (pos.get(p.id) - Y(i)) * 28; }
  }
  if (targets && targets.length) {
    // jugar cerca de lo que falta: así lo haría una persona
    const st = r.steps.find(s => s.t === 'clear');
    if (st) {
      let d = 99;
      for (const cl of st.cleared) for (const t of targets) d = Math.min(d, Math.abs(X(cl.i) - X(t)) + Math.abs(Y(cl.i) - Y(t)));
      if (d < 5) v += (5 - d) * (few ? 6 : 2);
    }
  }
  return v;
}

function rankMoves(g, rnd) {
  const ms = listMoves(g);
  const targets = targetsLeft(g);
  const out = [];
  for (const [a, b] of ms) {
    const v1 = evalMove(g, a, b, targets), v2 = evalMove(g, b, a, targets);
    out.push(v1 >= v2 ? { a, b, v: v1 + (rnd ? rnd() * 4 : 0) } : { a: b, b: a, v: v2 + (rnd ? rnd() * 4 : 0) });
  }
  out.sort((p, q) => q.v - p.v);
  return out;
}

function botChoose(g, rnd, skill) {
  const ranked = rankMoves(g, rnd);
  if (!ranked.length) return null;
  const r = rnd();
  let k = 0;
  if (r < skill.best) k = 0;
  else if (r < skill.best + skill.second) k = Math.min(1, ranked.length - 1);
  else k = (rnd() * ranked.length) | 0;
  return ranked[k];
}

// Duraciones de animación (ms). La interfaz usa exactamente estas.
const DUR = { swap: 150, back: 300, transform: 340, fallFirst: 80, fallAccel: 8, fallMin: 34, collect: 460, shuffle: 700, clearTail: 280 };
// La caída va por pasos que se aceleran (como con gravedad): 80, 72, 64… hasta 34 ms por casillero.
const TICK_T = [0];
for (let k = 0; k <= MAX_TICKS; k++) TICK_T.push(TICK_T[k] + Math.max(DUR.fallMin, DUR.fallFirst - DUR.fallAccel * k));
function tickStart(k) { return TICK_T[Math.min(k, TICK_T.length - 1)]; }
function stepDuration(s) {
  if (s.t === 'swap') return s.back ? DUR.back : DUR.swap;
  if (s.t === 'transform') return DUR.transform;
  if (s.t === 'clear') {
    let m = 0;
    for (const c of s.cleared) m = Math.max(m, c.t);
    for (const c of s.pads) m = Math.max(m, c.t);
    for (const c of s.burnt) m = Math.max(m, c.t);
    for (const c of s.unlocks) m = Math.max(m, c.t);
    return m + DUR.clearTail;
  }
  if (s.t === 'fall') return tickStart(s.ticks);
  if (s.t === 'collect') return DUR.collect;
  if (s.t === 'shuffle') return DUR.shuffle;
  return 0;
}

const Engine = {
  W, H, N, K, X, Y, I, rngFrom, createGame, trySwap, listMoves, hasValidMove, moveKind,
  evaluateEnd, goalsDone, bonus, clone, evalMove, rankMoves, botChoose, stepDuration, DUR, tickStart, swappable, fixed,
  isStable, shadowed,
};
if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
else root.Engine = Engine;
})(typeof window !== 'undefined' ? window : this);
