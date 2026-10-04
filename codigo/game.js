/* Fogonazo — interfaz, render y flujo de juego. */
(function () {
'use strict';
const E = Engine, K = E.K, X = E.X, Y = E.Y;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeIn = t => t * t;
const easeOut = t => 1 - (1 - t) * (1 - t);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => Math.round(n).toLocaleString('es-AR');

// ------------------------------------------------------------ iconos pixel (SVG)
function pixSvg(rows, fill, extra) {
  let r = '';
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] !== '.') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`; });
  return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" fill="${fill || 'currentColor'}" aria-hidden="true" ${extra || ''}>${r}</svg>`;
}
const IC = {
  gear: ['.....#.....', '..#.###.#..', '.#########.', '..##...##..', '.##.....##.', '###.....###', '.##.....##.', '..##...##..', '.#########.', '..#.###.#..', '.....#.....'],
  back: ['....#....', '...##....', '..###....', '.########', '#########', '.########', '..###....', '...##....', '....#....'],
  star: ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'],
  play: ['##.....', '####...', '######.', '#######', '######.', '####...', '##.....'],
  clock: ['..#####..', '.#.....#.', '#...#...#', '#...#...#', '#...###.#', '#.......#', '#.......#', '.#.....#.', '..#####..'],
  check: ['........#', '.......##', '#.....##.', '##...##..', '.##.##...', '..###....', '...#.....'],
};
const svgStar = on => pixSvg(IC.star, on ? '#ffbf2e' : '#2c3a44');

// ------------------------------------------------------------ niveles calibrados
function levelDef(n) {
  const base = LEVELS[n - 1], cal = CAL[n] || {};
  const d = Object.assign({}, base);
  d.goals = base.goals.map(o => Object.assign({}, o));
  if (cal.moves) d.moves = cal.moves;
  if (cal.time) d.time = cal.time;
  if (base.tune === 'score') d.goals[0].n = cal.scoreTarget || 1000;
  d.stars = cal.stars || [0, 1000, 2000];
  if (d.time) d.moves = 0;
  d.n = n;
  d.block = Math.floor((n - 1) / 5);
  return d;
}

// ------------------------------------------------------------ guardado
const KEY = 'chispazo.v1';
const Save = {
  data: { stars: {}, best: {} },
  settings: { sfx: 0.7, music: 0.35, mute: false, style: '8' },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.progress && d.progress.stars) this.data = { stars: d.progress.stars || {}, best: d.progress.best || {} };
      if (d.settings) Object.assign(this.settings, d.settings);
    } catch (e) {}
  },
  persist() { try { localStorage.setItem(KEY, JSON.stringify({ progress: this.data, settings: this.settings })); } catch (e) {} },
  record(n, stars, score) {
    const s = this.data.stars, b = this.data.best;
    let changed = false;
    if (stars > (s[n] || 0)) { s[n] = stars; changed = true; }
    if (stars > 0 && score > (b[n] || 0)) { b[n] = score; changed = true; }
    this.persist();
    if (changed) Cloud.push();
  },
  merge(o) {
    let changed = false;
    if (!o) return false;
    for (const [k, v] of Object.entries(o.stars || {})) if ((+v || 0) > (this.data.stars[k] || 0)) { this.data.stars[k] = +v; changed = true; }
    for (const [k, v] of Object.entries(o.best || {})) if ((+v || 0) > (this.data.best[k] || 0)) { this.data.best[k] = +v; changed = true; }
    return changed;
  },
  stars(n) { return this.data.stars[n] || 0; },
  unlocked(n) { return n === 1 || this.stars(n - 1) > 0; },
  total() { let t = 0; for (let n = 1; n <= LEVELS.length; n++) t += this.stars(n); return t; },
  reset() { this.data = { stars: {}, best: {} }; this.persist(); Cloud.push(true); },
};

// Sincronización opcional con la cuenta (si el visor la ofrece): el avance te sigue entre dispositivos.
const Cloud = {
  ref: null, busy: false, pending: false,
  async init() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      this.ref = db.doc('data/users/' + uid + '/progress');
      const snap = await this.ref.get();
      const remote = snap.exists ? snap.data() : null;
      const gotNew = Save.merge(remote);
      if (gotNew) { Save.persist(); if (UI.screen === 'map') UI.renderMap(); }
      const same = remote && JSON.stringify(remote.stars || {}) === JSON.stringify(Save.data.stars) && JSON.stringify(remote.best || {}) === JSON.stringify(Save.data.best);
      if (!same && Save.total() > 0) this.push();
    } catch (e) { this.ref = null; }
  },
  async push(force) {
    if (!this.ref) return;
    if (this.busy) { this.pending = true; return; }
    this.busy = true;
    try { await this.ref.set({ stars: Save.data.stars, best: Save.data.best }); } catch (e) {}
    this.busy = false;
    if (this.pending) { this.pending = false; this.push(); }
  },
};

// ------------------------------------------------------------ sprites en caché
const Spr = {
  cache: new Map(),
  get(name, size, hue) {
    const key = name + ':' + size + ':' + (hue || 0);
    let c = this.cache.get(key);
    if (!c) { c = renderSprite(name, size, { hue }); this.cache.set(key, c); }
    return c;
  },
  white(name, size) {
    const key = 'w:' + name + ':' + size;
    let c = this.cache.get(key);
    if (!c) { c = renderSprite(name, size, { tint: '#ffffff' }); this.cache.set(key, c); }
    return c;
  },
  ov(kind, size) {
    const key = 'o:' + kind + ':' + size;
    let c = this.cache.get(key);
    if (!c) { c = renderOverlay(kind, size); this.cache.set(key, c); }
    return c;
  },
  clear() { this.cache.clear(); },
};
function pieceSprite(c, k, hp) {
  if (k === K.BAT) return 'battery';
  if (k === K.TUBE) return 'tube';
  if (k === K.BURNT) return hp >= 2 ? 'burnt2' : 'burnt1';
  return PIECE_SPRITES[c];
}
// ícono suelto (canvas) para HUD y modales
function iconCanvas(kind, arg, css) {
  const px = Math.round(css * Math.min(3, window.devicePixelRatio || 1));
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  cv.className = 'pixel-icon';
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const put = (name, ov) => { ctx.drawImage(renderSprite(name, px), 0, 0); if (ov) ctx.drawImage(renderOverlay(ov, px), 0, 0); };
  if (kind === 'piece') put(PIECE_SPRITES[arg]);
  else if (kind === 'pads') put(arg === 2 ? 'pad2' : 'pad1');
  else if (kind === 'burnt') put(arg === 2 ? 'burnt2' : 'burnt1');
  else if (kind === 'locks') put(PIECE_SPRITES[arg || 1], 'tape');
  else if (kind === 'tubes') put('tube');
  else if (kind === 'battery') put('battery');
  else if (kind === 'lineH') put(PIECE_SPRITES[arg || 2], 'lineH');
  else if (kind === 'lineV') put(PIECE_SPRITES[arg || 4], 'lineV');
  else if (kind === 'bomb') {
    const g = ctx.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
    g.addColorStop(0, 'rgba(255,240,140,0.95)'); g.addColorStop(1, 'rgba(255,200,40,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, px, px);
    put(PIECE_SPRITES[arg || 3]);
  } else if (kind === 'score') put('battery');
  return cv;
}

function applyArt() {
  document.documentElement.dataset.art = ART.style;
  if (ART.style === '16' && !applyArt.tex) applyArt.tex = pcbTexture();
  if (applyArt.tex) document.documentElement.style.setProperty('--pcb-tex', `url(${applyArt.tex})`);
}
// textura de placa para el mapa en 16 bits: pistas con codos a 45° y vías
function pcbTexture() {
  const W = 480, H = 240, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const rnd = E.rngFrom(4242);
  c.lineCap = 'square'; c.lineJoin = 'miter';
  for (let k = 0; k < 16; k++) {
    let x = Math.round(rnd() * W / 16) * 16, y = Math.round(rnd() * H / 16) * 16;
    const pts = [[x, y]];
    for (let s = 0; s < 4; s++) {
      const d = (rnd() * 4) | 0, L = 32 + ((rnd() * 5) | 0) * 16;
      if (d === 0) x += L; else if (d === 1) y += L; else if (d === 2) { x += L / 2; y += L / 2; } else { x += L / 2; y -= L / 2; }
      pts.push([x, y]);
    }
    for (const [w, col] of [[7, 'rgba(10,50,30,0.55)'], [5, 'rgba(46,140,92,0.55)'], [1.5, 'rgba(150,235,190,0.35)']]) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
      c.stroke();
    }
    const [ex, ey] = pts[pts.length - 1];
    c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(ex, ey, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#082c1d'; c.beginPath(); c.arc(ex, ey, 2.5, 0, Math.PI * 2); c.fill();
  }
  return cv.toDataURL('image/png');
}
function setStyle(st) {
  if (st !== '8' && st !== '16') return;
  ART.style = st; Save.settings.style = st; Save.persist();
  applyArt();
  Spr.clear(); View.restyle();
  if (UI.screen === 'game') HUD.refreshIcons();
  if (typeof Sound.restyle === 'function') Sound.restyle(st);
}

// ------------------------------------------------------------ vista del tablero
const View = (() => {
  const cv = $('#board'), ctx = cv.getContext('2d');
  let g = null;
  let dpr = 1, cssS = 320, Wd = 320, cell = 40, sp = 36, bg = null, holeLayer = null;
  const pieces = new Map();
  let padLv = new Uint8Array(64), padOrig = new Uint8Array(64);
  const padFlash = new Float64Array(64);
  let fx = [], parts = [], texts = [], timeline = [];
  let sel = -1, hint = null, shakeT = 0, shakeAmp = 0, mosaicT = 0;
  const mosaicCv = document.createElement('canvas');

  function after(ms, fn) { timeline.push({ at: performance.now() + ms, fn }); }
  function wait(ms) { return new Promise(res => after(ms, res)); }

  function reset(game) {
    g = game;
    pieces.clear(); fx = []; parts = []; texts = []; timeline = []; sel = -1; hint = null;
    padOrig = g.padOrig.slice(); padLv = g.pad.slice(); padFlash.fill(0);
    for (let i = 0; i < 64; i++) { const p = g.p[i]; if (p) addPiece(p.id, p.c, p.k, X(i), Y(i), p); }
    buildLayers();
  }
  function addPiece(id, c, k, x, y, src) {
    const pv = { id, c, k, x, y, lock: src ? src.lock : 0, hp: src ? src.hp : 0, mv: null, pop: 0, born: 0, flash: 0, land: 0, shuf: 0, nc: c, collect: 0, phase: Math.random() * 5 };
    pieces.set(id, pv);
    return pv;
  }
  function moveTo(pv, x, y, dur, ease, then) {
    pv.mv = { x0: pv.x, y0: pv.y, x1: x, y1: y, t0: performance.now(), dur, ease, then };
  }
  function setTrack(pv, x, y, path, t0) {
    const segs = [];
    let px = x, py = y;
    for (const [k, nx, ny] of path) {
      segs.push({ a: t0 + E.tickStart(k), b: t0 + E.tickStart(k + 1), x0: px, y0: py, x1: nx, y1: ny });
      px = nx; py = ny;
    }
    pv.mv = null; pv.x = x; pv.y = y;
    pv.track = segs.length ? segs : null;
  }
  function trackPos(pv, t) {
    const s0 = pv.track[0];
    let x = s0.x0, y = s0.y0;
    for (const s of pv.track) {
      if (t < s.a) break;
      const p = clamp((t - s.a) / (s.b - s.a), 0, 1);
      x = lerp(s.x0, s.x1, p); y = lerp(s.y0, s.y1, p);
    }
    return [x, y];
  }

  function resize() {
    const wrap = $('#boardWrap');
    const r = wrap.getBoundingClientRect();
    const avail = Math.floor(Math.min(r.width - 16, r.height - 46));
    const s = clamp(avail, 200, 560);
    dpr = Math.min(3, window.devicePixelRatio || 1);
    const dev = Math.round(s * dpr / 8) * 8;
    if (dev === Wd && Math.abs(cssS - dev / dpr) < 0.5) return;
    Wd = dev; cssS = dev / dpr; cell = dev / 8;
    sp = Math.round(cell * 0.94);
    cv.width = cv.height = dev;
    cv.style.width = cv.style.height = cssS + 'px';
    Spr.clear();
    buildLayers();
  }

  function buildLayers() {
    if (!g) return;
    bg = document.createElement('canvas'); bg.width = bg.height = Wd;
    const b = bg.getContext('2d');
    const px = cell / 16;
    if (ART.style === '16') drawBoard16(b);
    else for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const x0 = Math.round(x * cell), y0 = Math.round(y * cell), x1 = Math.round((x + 1) * cell), y1 = Math.round((y + 1) * cell);
      b.fillStyle = (x + y) % 2 ? '#11523a' : '#0f4a33';
      b.fillRect(x0, y0, x1 - x0, y1 - y0);
      b.fillStyle = '#0c3f2b';
      b.fillRect(x0, y1 - Math.ceil(px), x1 - x0, Math.ceil(px));
      b.fillRect(x1 - Math.ceil(px), y0, Math.ceil(px), y1 - y0);
      b.fillStyle = 'rgba(210,240,225,0.18)';
      b.fillRect(x0 + Math.round(px), y0 + Math.round(px), Math.ceil(px), Math.ceil(px));
    }
    holeLayer = document.createElement('canvas'); holeLayer.width = holeLayer.height = Wd;
    const h = holeLayer.getContext('2d');
    const isHole = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8 && g.hole[y * 8 + x];
    const edge = Math.max(2, Math.round(px * 1.5));
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      if (!isHole(x, y)) continue;
      const x0 = Math.round(x * cell), y0 = Math.round(y * cell), w = Math.round((x + 1) * cell) - x0, hh = Math.round((y + 1) * cell) - y0;
      h.fillStyle = '#1a252d'; h.fillRect(x0, y0, w, hh);
      h.fillStyle = '#22303a';
      for (let k = 1; k < 4; k++) { h.fillRect(x0, y0 + Math.round(hh * k / 4), w, 1); h.fillRect(x0 + Math.round(w * k / 4), y0, 1, hh); }
      h.fillStyle = '#062016';
      if (!isHole(x, y - 1) && y > 0) h.fillRect(x0, y0, w, edge);
      if (!isHole(x, y + 1) && y < 7) h.fillRect(x0, y0 + hh - edge, w, edge);
      if (!isHole(x - 1, y) && x > 0) h.fillRect(x0, y0, edge, hh);
      if (!isHole(x + 1, y) && x < 7) h.fillRect(x0 + w - edge, y0, edge, hh);
    }
  }

  // placa 16 bits: máscara antisoldante con degradé, pistas de cobre en las calles y vías
  function drawBoard16(b) {
    const u = cell / 32, R = Math.round;
    const rnd = E.rngFrom(((g.level && g.level.n) || 7) * 7919 + 13);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const x0 = R(x * cell), y0 = R(y * cell), w = R((x + 1) * cell) - x0, h = R((y + 1) * cell) - y0;
      const gr = b.createLinearGradient(0, y0, 0, y0 + h);
      const odd = (x + y) % 2;
      gr.addColorStop(0, odd ? '#16603f' : '#135739'); gr.addColorStop(1, odd ? '#0f4c32' : '#0d452d');
      b.fillStyle = gr; b.fillRect(x0, y0, w, h);
      b.fillStyle = 'rgba(255,255,255,0.05)'; b.fillRect(x0, y0, w, R(u));
      b.fillStyle = 'rgba(0,0,0,0.18)'; b.fillRect(x0, y0 + h - R(u), w, R(u));
    }
    const trace = (x0, y0, x1, y1) => {
      const t = Math.max(2, R(u * 2.2));
      b.fillStyle = '#1f7f52';
      if (y0 === y1) b.fillRect(R(x0), R(y0 - t / 2), R(x1 - x0), t); else b.fillRect(R(x0 - t / 2), R(y0), t, R(y1 - y0));
      b.fillStyle = 'rgba(140,230,180,0.35)';
      if (y0 === y1) b.fillRect(R(x0), R(y0 - t / 2), R(x1 - x0), Math.max(1, R(u * 0.6))); else b.fillRect(R(x0 - t / 2), R(y0), Math.max(1, R(u * 0.6)), R(y1 - y0));
    };
    for (let k = 1; k < 8; k++) for (let j = 0; j < 8; j++) {
      if (rnd() < 0.3) trace(j * cell, k * cell, (j + 1) * cell, k * cell);
      if (rnd() < 0.3) trace(k * cell, j * cell, k * cell, (j + 1) * cell);
    }
    for (let y = 1; y < 8; y++) for (let x = 1; x < 8; x++) {
      if (rnd() > 0.28) continue;
      const cx = x * cell, cy = y * cell;
      b.fillStyle = '#7a5a1c'; b.beginPath(); b.arc(cx, cy, u * 3.4, 0, Math.PI * 2); b.fill();
      b.fillStyle = '#d9b456'; b.beginPath(); b.arc(cx - u * 0.4, cy - u * 0.4, u * 2.7, 0, Math.PI * 2); b.fill();
      b.fillStyle = '#071d13'; b.beginPath(); b.arc(cx, cy, u * 1.3, 0, Math.PI * 2); b.fill();
    }
  }

  // ---------- partículas y efectos
  function burst(x, y, color, n, speed) {
    if (REDUCED) n = Math.min(n, 4);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = (0.6 + Math.random()) * (speed || 3.2) * cell;
      parts.push({ x: (x + 0.5) * cell, y: (y + 0.5) * cell, vx: Math.cos(a) * v, vy: Math.sin(a) * v - cell, life: 0, max: 380 + Math.random() * 260, color, size: Math.max(2, Math.round(cell / 9)), grav: 9 * cell });
    }
  }
  function smoke(x, y, n, color) {
    for (let k = 0; k < n; k++) {
      parts.push({ x: (x + 0.3 + Math.random() * 0.4) * cell, y: (y + 0.5) * cell, vx: (Math.random() - 0.5) * 0.4 * cell, vy: -(0.6 + Math.random() * 0.6) * cell, life: 0, max: 700 + Math.random() * 400, color: color || 'rgba(200,210,215,0.55)', size: Math.round(cell / 7), grow: true, grav: 0 });
    }
  }
  function flyImg(img, x, y) {
    parts.push({ img, x: (x + 0.5) * cell, y: (y + 0.5) * cell, vx: (Math.random() - 0.5) * 2 * cell, vy: -2.5 * cell, life: 0, max: 500, rot: 0, vr: (Math.random() - 0.5) * 10, grav: 10 * cell, size: sp });
  }
  function addText(x, y, text, big) {
    texts.push({ x: (x + 0.5) * cell, y: (y + 0.5) * cell, text, t0: performance.now(), big: !!big });
  }
  function shake(a) { if (REDUCED) return; shakeT = performance.now(); shakeAmp = a; }

  // ---------- aplicar pasos del motor
  function apply(st) {
    const t0 = performance.now();
    if (st.t === 'swap') {
      const A = pieces.get(st.ida), B = pieces.get(st.idb);
      if (!A || !B) return;
      const ax = X(st.a), ay = Y(st.a), bx = X(st.b), by = Y(st.b);
      Sound.play('swap');
      if (st.back) {
        moveTo(A, bx, by, 150, easeInOut, () => moveTo(A, ax, ay, 150, easeInOut));
        moveTo(B, ax, ay, 150, easeInOut, () => moveTo(B, bx, by, 150, easeInOut));
        after(150, () => Sound.play('bad'));
      } else { moveTo(A, bx, by, 150, easeInOut); moveTo(B, ax, ay, 150, easeInOut); }
    } else if (st.t === 'transform') {
      st.list.forEach((it, n) => {
        const doIt = () => { const pv = pieces.get(it.id); if (!pv) return; pv.k = it.k; pv.flash = performance.now(); burst(pv.x, pv.y, '#ffffff', 5, 2); if (st.bonus) { Sound.play('bonus', n, 0); Game.bonusTick(); } };
        if (st.bonus) after(Math.min(300, n * 15), doIt); else doIt();
      });
      if (!st.bonus) Sound.play('special');
    } else if (st.t === 'clear') {
      const dur = E.stepDuration(st);
      if (st.cleared.length || st.burnt.length) Sound.play('match', st.cascade, 60);
      if (st.cascade >= 3) after(60, () => addText(3.5, 0.6, '¡Cascada ×' + st.cascade + '!', true));
      for (const f of st.fx) after(f.t, () => {
        fx.push(Object.assign({ t0: performance.now() }, f));
        if (f.type === 'beam') Sound.play('beam', null, 60);
        else if (f.type === 'blast') { Sound.play('blast', null, 80); shake(f.big ? 7 : 4); }
        else if (f.type === 'zap') Sound.play('zap', null, 80);
        else if (f.type === 'nova') { Sound.play('nova'); shake(9); }
      });
      for (const c of st.cleared) after(c.t, () => {
        const pv = pieces.get(c.id); if (!pv) return;
        pv.pop = performance.now();
        burst(pv.x, pv.y, c.c >= 0 ? PIECE_COLORS[c.c] : '#ffe14a', 7, 3);
      });
      for (const p of st.pads) after(p.t, () => {
        padLv[p.i] = p.lv; padFlash[p.i] = performance.now();
        smoke(X(p.i), Y(p.i), 3); burst(X(p.i), Y(p.i), '#e9eef3', 4, 1.6);
        Sound.play('solder', null, 70);
      });
      for (const b of st.burnt) after(b.t, () => {
        const pv = pieces.get(b.id); if (!pv) return;
        burst(pv.x, pv.y, b.hp >= 1 ? '#a7aeb7' : '#2a2522', 8, 2.6); smoke(pv.x, pv.y, 3, 'rgba(70,70,70,0.6)');
        Sound.play('crack', null, 60);
        if (b.hp <= 0) pv.pop = performance.now(); else { pv.hp = b.hp; pv.flash = performance.now(); }
      });
      for (const u of st.unlocks) after(u.t, () => {
        const pv = pieces.get(u.id); if (!pv) return;
        pv.lock = 0; flyImg(Spr.ov('tape', sp), pv.x, pv.y);
        Sound.play('rip', null, 60);
      });
      for (const c of st.created) after(Math.max(0, dur - 200), () => {
        const pv = addPiece(c.id, c.c, c.k, X(c.i), Y(c.i));
        pv.born = performance.now(); pv.flash = performance.now();
        Sound.play('special', null, 80);
      });
      for (const p of st.popups) after(40, () => addText(p.x, p.y, '+' + p.v));
      after(dur * 0.45, () => Game.onSnap(st.snap));
    } else if (st.t === 'fall') {
      // cada pieza sigue su recorrido casillero por casillero (derecho o en diagonal),
      // con el mismo reloj de pasos que usa el motor
      for (const m of st.moves) {
        const pv = pieces.get(m.id); if (!pv) continue;
        setTrack(pv, m.x, m.from, m.path, t0);
      }
      for (const s of st.spawns) {
        const pv = addPiece(s.id, s.c, s.k, s.x, s.from);
        setTrack(pv, s.x, s.from, s.path, t0);
      }
    } else if (st.t === 'collect') {
      for (const tb of st.tubes) { const pv = pieces.get(tb.id); if (pv) { pv.collect = t0; burst(pv.x, pv.y, '#ffb347', 10, 2.5); } }
      Sound.play('tube');
      after(200, () => Game.onSnap(st.snap));
    } else if (st.t === 'shuffle') {
      Game.banner('Sin jugadas: mezclando', 900);
      Sound.play('shuffle');
      for (const it of st.list) { const pv = pieces.get(it.id); if (pv) { pv.shuf = t0; pv.nc = it.c; } }
    }
  }
  async function play(steps) {
    for (const st of steps) {
      apply(st);
      const d = E.stepDuration(st);
      if (d > 0) await wait(d);
    }
  }

  // ---------- dibujo
  function update(t) {
    for (const pv of pieces.values()) {
      if (pv.track) {
        const last = pv.track[pv.track.length - 1];
        if (t >= last.b) { pv.x = last.x1; pv.y = last.y1; pv.track = null; pv.land = t; }
      }
      if (pv.mv) {
        const p = clamp((t - pv.mv.t0) / pv.mv.dur, 0, 1);
        if (p >= 1) {
          pv.x = pv.mv.x1; pv.y = pv.mv.y1;
          const then = pv.mv.then; pv.mv = null;
          if (then) then();
        }
      }
      if (pv.pop && t - pv.pop > 230) pieces.delete(pv.id);
      if (pv.collect && t - pv.collect > 450) pieces.delete(pv.id);
      if (pv.shuf && t - pv.shuf > 350 && pv.c !== pv.nc) pv.c = pv.nc;
      if (pv.shuf && t - pv.shuf > 700) pv.shuf = 0;
    }
  }

  function drawPiece(pv, t) {
    let x = pv.x, y = pv.y;
    if (pv.track) [x, y] = trackPos(pv, t);
    else if (pv.mv) {
      const p = clamp((t - pv.mv.t0) / pv.mv.dur, 0, 1), e = pv.mv.ease(p);
      x = lerp(pv.mv.x0, pv.mv.x1, e); y = lerp(pv.mv.y0, pv.mv.y1, e);
    }
    let s = 1, sx = 1, sy = 1, alpha = 1, dy = 0;
    if (pv.pop) {
      const p = clamp((t - pv.pop) / 220, 0, 1);
      s = p < 0.3 ? 1 + 0.25 * (p / 0.3) : 1.25 * (1 - (p - 0.3) / 0.7);
      alpha = 1 - p * 0.5;
    }
    if (pv.born) {
      const p = clamp((t - pv.born) / 240, 0, 1);
      s *= p < 0.7 ? lerp(0.2, 1.2, p / 0.7) : lerp(1.2, 1, (p - 0.7) / 0.3);
      if (p >= 1) pv.born = 0;
    }
    if (pv.shuf) {
      const p = clamp((t - pv.shuf) / 700, 0, 1);
      s *= p < 0.5 ? 1 - p * 1.7 : 0.15 + (p - 0.5) * 1.7;
    }
    if (pv.collect) {
      const p = clamp((t - pv.collect) / 450, 0, 1);
      dy = -p * 0.8; alpha = 1 - p; s = 1 + p * 0.3;
    }
    if (pv.land && !REDUCED) {
      const p = (t - pv.land) / 140;
      if (p < 1) { const q = Math.sin(p * Math.PI) * 0.1; sy = 1 - q; sx = 1 + q * 0.6; } else pv.land = 0;
    }
    if (hint && (pv.id === hint.ida || pv.id === hint.idb) && !REDUCED) {
      const ph = ((t - hint.t0) / 1000) % 1.6;
      if (ph < 0.6) {
        const w = Math.sin(ph / 0.6 * Math.PI * 3) * 0.08;
        const o = pv.id === hint.ida ? hint.b : hint.a;
        const ox = X(o) - X(pv.id === hint.ida ? hint.a : hint.b), oy = Y(o) - Y(pv.id === hint.ida ? hint.a : hint.b);
        x += ox * w; y += oy * w;
      }
    }
    if (s <= 0.01) return;
    const cx = (x + 0.5) * cell, cy = (y + 0.5 + dy) * cell;
    ctx.globalAlpha = alpha;
    // brillos por debajo
    if (pv.k === K.BOMB) {
      const pulse = 0.55 + 0.25 * Math.sin(t / 140 + pv.phase);
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, cell * 0.62);
      gr.addColorStop(0, `rgba(255,240,140,${pulse})`); gr.addColorStop(1, 'rgba(255,190,40,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - cell, cy - cell, cell * 2, cell * 2);
    }
    if (pv.k <= 3 && pv.c === 2 && !pv.pop) {
      const ph = ((t / 1000) + pv.phase) % 4.5;
      if (ph < 0.35) {
        const a = Math.sin(ph / 0.35 * Math.PI) * 0.6;
        const gr = ctx.createRadialGradient(cx, cy - cell * 0.1, 0, cx, cy - cell * 0.1, cell * 0.6);
        gr.addColorStop(0, `rgba(255,80,60,${a})`); gr.addColorStop(1, 'rgba(255,60,40,0)');
        ctx.fillStyle = gr; ctx.fillRect(cx - cell, cy - cell, cell * 2, cell * 2);
      }
    }
    const name = pieceSprite(pv.c, pv.k, pv.hp);
    const img = pv.k === K.BAT ? Spr.get('battery', sp, Math.floor(t / 110) % 6) : Spr.get(name, sp);
    const w = sp * s * sx, h = sp * s * sy;
    const left = cx - w / 2, top = cy - h / 2 + (sp * s - h) / 2;
    ctx.drawImage(img, left, top, w, h);
    if (pv.flash) {
      const p = (t - pv.flash) / 260;
      if (p < 1) { ctx.globalAlpha = alpha * (1 - p) * 0.85; ctx.drawImage(Spr.white(name, sp), left, top, w, h); ctx.globalAlpha = alpha; }
      else pv.flash = 0;
    }
    if (pv.k === K.LH || pv.k === K.LV) {
      ctx.globalAlpha = alpha * (0.75 + 0.25 * Math.sin(t / 120 + pv.phase));
      ctx.drawImage(Spr.ov(pv.k === K.LH ? 'lineH' : 'lineV', sp), left, top, w, h);
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = '#e6fbff';
      const th = Math.max(1, Math.round(cell / 18));
      if (pv.k === K.LH) ctx.fillRect(left + w * 0.18, cy - th / 2 + Math.sin(t / 50) * th, w * 0.64, th);
      else ctx.fillRect(cx - th / 2 + Math.sin(t / 50) * th, top + h * 0.18, th, h * 0.64);
      ctx.globalAlpha = alpha;
    }
    if (pv.k === K.BOMB) {
      ctx.fillStyle = '#fff7c2';
      const r = cell * 0.42, q = Math.max(2, Math.round(cell / 12));
      for (let k = 0; k < 4; k++) {
        const a = t / 380 + k * Math.PI / 2 + pv.phase;
        ctx.fillRect(Math.round(cx + Math.cos(a) * r - q / 2), Math.round(cy + Math.sin(a) * r - q / 2), q, q);
      }
    }
    if (pv.k === K.TUBE) {
      const a = 0.28 + 0.12 * Math.sin(t / 90 + pv.phase) + 0.06 * Math.sin(t / 23);
      const gy = cy - h * 0.06;
      const gr = ctx.createRadialGradient(cx, gy, 0, cx, gy, cell * 0.4);
      gr.addColorStop(0, `rgba(255,170,70,${a + 0.2})`); gr.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gr; ctx.fillRect(cx - cell / 2, gy - cell / 2, cell, cell);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (pv.lock) ctx.drawImage(Spr.ov('tape', sp), left, top, w, h);
    ctx.globalAlpha = 1;
  }

  function jag(x0, y0, x1, y1, amp) {
    const pts = [[x0, y0]];
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / (cell * 0.35)));
    const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
    for (let k = 1; k < n; k++) { const f = k / n, o = (Math.random() - 0.5) * 2 * amp; pts.push([lerp(x0, x1, f) + nx / l * o, lerp(y0, y1, f) + ny / l * o]); }
    pts.push([x1, y1]);
    return pts;
  }
  function stroke(pts, w, color) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.stroke();
  }
  function bolt(pts, a) {
    stroke(pts, cell * 0.36, `rgba(90,200,255,${0.22 * a})`);
    stroke(pts, cell * 0.15, `rgba(160,235,255,${0.7 * a})`);
    stroke(pts, Math.max(1.5, cell * 0.05), `rgba(255,255,255,${a})`);
  }
  function drawFx(t) {
    fx = fx.filter(f => t - f.t0 < 600);
    for (const f of fx) {
      const e = t - f.t0;
      const ox = (X(f.i) + 0.5) * cell, oy = (Y(f.i) + 0.5) * cell;
      if (f.type === 'beam') {
        const a = e < 330 ? 1 : clamp(1 - (e - 330) / 200, 0, 1);
        const reach = (e / 28 + 0.6) * cell;
        if (f.dir === 'h') {
          const xa = Math.max(0, ox - reach), xb = Math.min(Wd, ox + reach);
          bolt(jag(xa, oy, xb, oy, cell * 0.12), a);
        } else {
          const ya = Math.max(0, oy - reach), yb = Math.min(Wd, oy + reach);
          bolt(jag(ox, ya, ox, yb, cell * 0.12), a);
        }
      } else if (f.type === 'blast') {
        const p = clamp(e / 360, 0, 1), R = (f.r + 0.6) * cell * easeOut(p) * (f.big ? 1.3 : 1);
        const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(1, R));
        gr.addColorStop(0, `rgba(255,250,210,${0.75 * (1 - p)})`); gr.addColorStop(0.7, `rgba(255,190,60,${0.45 * (1 - p)})`); gr.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(ox, oy, Math.max(1, R), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${1 - p})`; ctx.lineWidth = cell * 0.08;
        ctx.beginPath(); ctx.arc(ox, oy, Math.max(1, R * 0.9), 0, Math.PI * 2); ctx.stroke();
      } else if (f.type === 'zap') {
        f.to.forEach((j, n) => {
          const hitAt = 110 + n * 30;
          if (e < hitAt - 120 || e > hitAt + 160) return;
          const a = e < hitAt ? 1 : 1 - (e - hitAt) / 160;
          bolt(jag(ox, oy, (X(j) + 0.5) * cell, (Y(j) + 0.5) * cell, cell * 0.2), a);
        });
      } else if (f.type === 'nova') {
        const p = clamp(e / 550, 0, 1);
        ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - p)})`;
        ctx.beginPath(); ctx.arc(ox, oy, Wd * 1.2 * easeOut(p), 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  function drawParts(dt) {
    const k = dt / 1000;
    parts = parts.filter(p => (p.life += dt) < p.max);
    for (const p of parts) {
      p.vy += (p.grav || 0) * k; p.x += p.vx * k; p.y += p.vy * k;
      const a = 1 - p.life / p.max;
      if (p.img) {
        p.rot += p.vr * k;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
        continue;
      }
      const s = p.grow ? p.size * (1 + p.life / p.max * 1.5) : p.size;
      ctx.globalAlpha = a; ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), Math.round(s), Math.round(s));
    }
    ctx.globalAlpha = 1;
  }
  function drawTexts(t) {
    texts = texts.filter(o => t - o.t0 < 800);
    for (const o of texts) {
      const p = (t - o.t0) / 800;
      const size = Math.round(cell * (o.big ? 0.48 : 0.36));
      ctx.font = ART.style === '16' ? `${Math.round(size * 1.45)}px 'Jersey 25', 'Arial Narrow', sans-serif` : `700 ${size}px Silkscreen, 'Courier New', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
      const yy = o.y - p * cell * 0.8;
      ctx.lineWidth = Math.max(3, size / 4); ctx.strokeStyle = '#0b0f12'; ctx.strokeText(o.text, o.x, yy);
      ctx.fillStyle = o.big ? '#ffbf2e' : '#ffffff'; ctx.fillText(o.text, o.x, yy);
    }
    ctx.globalAlpha = 1;
  }
  function drawSel(i, t, color) {
    const x0 = X(i) * cell, y0 = Y(i) * cell, L = cell * 0.28, th = Math.max(2, Math.round(cell / 14));
    const pulse = 0.65 + 0.35 * Math.sin(t / 120);
    ctx.fillStyle = color; ctx.globalAlpha = pulse;
    const P = [[x0, y0, 1, 1], [x0 + cell, y0, -1, 1], [x0, y0 + cell, 1, -1], [x0 + cell, y0 + cell, -1, -1]];
    for (const [x, y, sx, sy] of P) {
      ctx.fillRect(sx > 0 ? x + th : x - th - L, sy > 0 ? y + th : y - th * 2, L, th);
      ctx.fillRect(sx > 0 ? x + th : x - th * 2, sy > 0 ? y + th : y - th - L, th, L);
    }
    ctx.globalAlpha = 1;
  }

  let lastT = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min(50, lastT ? t - lastT : 16); lastT = t;
    const now = performance.now();
    if (timeline.length) {
      const due = timeline.filter(e => e.at <= now);
      if (due.length) { timeline = timeline.filter(e => e.at > now); due.sort((a, b) => a.at - b.at); for (const e of due) e.fn(); }
    }
    Game.tick(dt);
    if (!g || UI.screen !== 'game') return;
    update(now);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (shakeAmp && now - shakeT < 220) {
      const a = shakeAmp * (1 - (now - shakeT) / 220) * dpr;
      $('#boardFrame').style.transform = `translate(${(Math.random() - 0.5) * a}px, ${(Math.random() - 0.5) * a}px)`;
    } else if (shakeAmp) { shakeAmp = 0; $('#boardFrame').style.transform = ''; }
    ctx.drawImage(bg, 0, 0);
    for (let i = 0; i < 64; i++) {
      if (!padOrig[i]) continue;
      const name = padLv[i] >= 2 ? 'pad2' : padLv[i] === 1 ? 'pad1' : 'padDone';
      const x0 = Math.round(X(i) * cell), y0 = Math.round(Y(i) * cell);
      ctx.drawImage(Spr.get(name, Math.round(cell)), x0, y0);
      const fp = (now - padFlash[i]) / 300;
      if (padFlash[i] && fp < 1) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - fp)})`; ctx.fillRect(x0, y0, Math.round(cell), Math.round(cell)); }
    }
    if (sel >= 0) drawSel(sel, now, '#ffffff');
    const fixedList = [];
    for (const pv of pieces.values()) { if (pv.k === K.BURNT || pv.lock) fixedList.push(pv); else drawPiece(pv, now); }
    ctx.drawImage(holeLayer, 0, 0);
    for (const pv of fixedList) drawPiece(pv, now);
    drawFx(now);
    drawParts(dt);
    drawTexts(now);
    if (mosaicT) {
      const p = (now - mosaicT) / 560;
      if (p >= 1 || REDUCED) mosaicT = 0;
      else {
        const blk = Math.max(1, Math.round(lerp(cell / 1.5, 1, easeOut(p))));
        const w = Math.max(1, Math.round(Wd / blk));
        mosaicCv.width = mosaicCv.height = w;
        const m = mosaicCv.getContext('2d');
        m.imageSmoothingEnabled = true;
        m.drawImage(cv, 0, 0, w, w);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(mosaicCv, 0, 0, w, w, 0, 0, Wd, Wd);
      }
    }
  }
  requestAnimationFrame(frame);

  return {
    reset, resize, play, wait, after, addText, restyle() { buildLayers(); }, mosaic() { mosaicT = performance.now(); },
    get sel() { return sel; }, set sel(v) { sel = v; },
    setHint(h) { hint = h ? Object.assign({ t0: performance.now() }, h) : null; },
    get hint() { return hint; },
    cellAt(clientX, clientY) {
      const r = cv.getBoundingClientRect();
      const x = Math.floor((clientX - r.left) / r.width * 8), y = Math.floor((clientY - r.top) / r.height * 8);
      return x >= 0 && x < 8 && y >= 0 && y < 8 ? y * 8 + x : -1;
    },
    cellCss() { return cv.getBoundingClientRect().width / 8; },
    nudge(i) { const p = g && g.p[i]; if (!p) return; const pv = pieces.get(p.id); if (pv) { pv.flash = performance.now(); } },
    canvas: cv,
  };
})();

// ------------------------------------------------------------ HUD
const Seg = (() => {
  const P = {
    a: '2,0.4 10,0.4 11,1.4 10,2.4 2,2.4 1,1.4', g: '2,9 10,9 11,10 10,11 2,11 1,10', d: '2,17.6 10,17.6 11,18.6 10,19.6 2,19.6 1,18.6',
    f: '1,2.2 2,3.2 2,8.4 1,9.4 0,8.4 0,3.2', b: '11,2.2 12,3.2 12,8.4 11,9.4 10,8.4 10,3.2',
    e: '1,10.6 2,11.6 2,16.8 1,17.8 0,16.8 0,11.6', c: '11,10.6 12,11.6 12,16.8 11,17.8 10,16.8 10,11.6',
  };
  const D = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
  function build(el, n, colonAfter) {
    el.innerHTML = '';
    for (let k = 0; k < n; k++) {
      el.insertAdjacentHTML('beforeend', `<svg viewBox="-1 -0.5 14 21"><g transform="skewX(-6) translate(1 0)">${Object.entries(P).map(([s, pts]) => `<polygon data-s="${s}" points="${pts}" class="off"/>`).join('')}</g></svg>`);
      if (colonAfter === k) el.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 4 21" style="width:auto"><rect x="1" y="5" width="2" height="2.4" class="on"/><rect x="1" y="13" width="2" height="2.4" class="on"/></svg>');
    }
    el._n = n; el._last = null;
  }
  function set(el, str) {
    str = String(str);
    if (str.length < el._n) str = ' '.repeat(el._n - str.length) + str;
    str = str.slice(-el._n);
    if (el._last === str) return;
    el._last = str;
    const digits = [...el.querySelectorAll('svg')].filter(s => s.querySelector('polygon'));
    digits.forEach((svg, k) => {
      const on = D[str[k]] || '';
      svg.querySelectorAll('polygon').forEach(p => p.setAttribute('class', on.includes(p.dataset.s) ? 'on' : 'off'));
    });
  }
  return { build, set };
})();

const HUD = {
  def: null, shown: 0, target: 0, chips: [], segs: 12,
  init(def, g) {
    this.def = def; this.shown = 0; this.target = 0;
    $('#lvlNum').textContent = 'NIVEL ' + def.n + ' · ' + BLOCKS[def.block].name.toUpperCase();
    $('#lvlName').textContent = def.name;
    $('#lvlName').classList.toggle('long', def.name.length > 18);
    const timed = g.mode === 'time';
    $('#movesLabel').textContent = timed ? 'TIEMPO' : 'MOV';
    if (timed) Seg.build($('#segMoves'), 3, 0); else Seg.build($('#segMoves'), 2);
    $('#segMoves').classList.remove('warn');
    Seg.build($('#segScore'), 6);
    Seg.set($('#segScore'), '0');
    if (timed) this.setTime(def.time); else this.setMoves(g.moves);
    const vu = $('#vu');
    vu.innerHTML = '';
    for (let k = 0; k < this.segs; k++) vu.insertAdjacentHTML('beforeend', `<i class="${k >= 10 ? 'r' : k >= 7 ? 'y' : ''}"></i>`);
    const st = $('#vuStars');
    st.innerHTML = '';
    const max = def.stars[2];
    const marks = g.scoreOnly ? def.stars : [def.stars[1], def.stars[2]];
    marks.forEach((v, k) => {
      const pct = clamp(v / max * 100, 4, 96);
      st.insertAdjacentHTML('beforeend', `<span data-v="${v}" style="position:absolute;left:${pct}%;top:0">${svgStar(false)}</span>`);
    });
    const goals = $('#goals');
    goals.innerHTML = '';
    this.chips = g.goals.map((o, k) => {
      const chip = document.createElement('div');
      chip.className = 'goal';
      const lv = o.type === 'pads' ? (g.padOrig.some(v => v === 2) ? 2 : 1) : o.type === 'burnt' ? (g.p.some(p => p && p.k === K.BURNT && p.hp >= 2) ? 2 : 1) : 1;
      const mkIcon = o.type === 'score' ? null : o.type === 'collect' ? () => iconCanvas('piece', o.color, 32) : () => iconCanvas(o.type, lv, 32);
      if (mkIcon) chip.appendChild(mkIcon());
      if (o.type === 'score') chip.insertAdjacentHTML('beforeend', `<span class="lbl">Meta</span>`);
      const cnt = document.createElement('span'); cnt.className = 'cnt';
      chip.appendChild(cnt);
      goals.appendChild(chip);
      return { chip, cnt, o, last: -1, mkIcon };
    });
    this.setGoals(g.goals.map(o => o.have));
    this.renderVU(0);
  },
  refreshIcons() { for (const c of this.chips) if (c.mkIcon) { const old = c.chip.querySelector('canvas'); if (old) old.replaceWith(c.mkIcon()); } },
  setMoves(n) { Seg.set($('#segMoves'), Math.max(0, n)); },
  setTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    Seg.set($('#segMoves'), Math.floor(s / 60) + String(s % 60).padStart(2, '0'));
    $('#segMoves').classList.toggle('warn', s <= 10 && s > 0);
  },
  setScore(v) { this.target = v; },
  setGoals(have) {
    this.chips.forEach((c, k) => {
      const o = c.o, h = have[k];
      let txt, done;
      if (o.type === 'score') { txt = fmt(o.need); done = h >= o.need; }
      else { const rem = Math.max(0, o.need - h); txt = String(rem); done = rem === 0; }
      if (c.last !== txt) {
        if (c.last !== -1 && o.type !== 'score') { c.chip.classList.remove('bump'); void c.chip.offsetWidth; c.chip.classList.add('bump'); }
        c.cnt.textContent = txt;
        if (done && !c.chip.classList.contains('done') && c.last !== -1) Sound.play('goal');
        c.chip.classList.toggle('done', done);
        c.last = txt;
      }
    });
  },
  renderVU(v) {
    const max = this.def.stars[2];
    const lit = Math.round(clamp(v / max, 0, 1) * this.segs);
    $('#vu').querySelectorAll('i').forEach((el, k) => el.classList.toggle('lit', k < lit));
    $('#vuStars').querySelectorAll('span').forEach(sp => {
      const on = v >= +sp.dataset.v;
      if (sp._on !== on) { sp.innerHTML = svgStar(on); sp._on = on; }
    });
  },
  tick(dt) {
    if (this.shown !== this.target) {
      const d = this.target - this.shown;
      this.shown += Math.sign(d) * Math.max(1, Math.abs(d) * Math.min(1, dt / 120));
      if (Math.abs(this.target - this.shown) < 1) this.shown = this.target;
      Seg.set($('#segScore'), Math.round(this.shown));
      this.renderVU(this.shown);
    }
  },
};

// ------------------------------------------------------------ textos de ayuda
const TIPS = {
  swap: { icon: ['piece', 2], title: 'Cómo se juega', text: 'Deslizá un componente hacia un vecino. Si quedan 3 o más iguales en línea, se van.' },
  line: { icon: ['lineH', 2], title: 'Nuevo: rayo', text: '4 en línea arman un componente con rayo. Cuando lo eliminás, barre toda su fila o su columna, según indiquen las flechas.' },
  bomb: { icon: ['bomb', 3], title: 'Nuevo: sobrecarga', text: 'Una línea en L o en T arma una sobrecarga. Cuando la eliminás, explota y limpia todo a su alrededor.' },
  battery: { icon: ['battery'], title: 'Nuevo: batería', text: '5 en línea arman una batería. Intercambiala con un componente y se eliminan todos los de ese tipo. Probá combinar dos especiales entre sí.' },
  color6: { icon: ['piece', 5], title: 'Nuevo componente', text: 'Capacitor cerámico. Con seis tipos en la mesa hay menos combinaciones posibles.' },
  pads: { icon: ['pads', 1], title: 'Nuevo: pads', text: 'Pads de cobre sin soldar. Para estañarlos, formá una línea encima o hacé pasar un especial por ahí.' },
  pads2: { icon: ['pads', 2], title: 'Nuevo: doble faz', text: 'Los pads con remaches en las esquinas necesitan dos pasadas de estaño.' },
  burnt: { icon: ['burnt', 1], title: 'Nuevo: quemados', text: 'Un componente quemado no se mueve ni deja pasar las piezas que caen. Se rompe con una línea pegada al lado o con un especial.' },
  burnt2: { icon: ['burnt', 2], title: 'Nuevo: carbonizados', text: 'Los que tienen carcasa metálica necesitan dos golpes: el primero saca la carcasa.' },
  locks: { icon: ['locks', 1], title: 'Nuevo: cinta kapton', text: 'La pieza encintada no se mueve ni deja pasar las piezas que caen. Incluila en una línea para despegarla.' },
  tubes: { icon: ['tubes'], title: 'Nuevo: válvulas', text: 'Bajalas hasta la fila de abajo. Caen cuando desaparecen las piezas que tienen debajo: hacé líneas por debajo de ellas.' },
  color7: { icon: ['piece', 6], title: 'Último componente', text: 'El cristal de cuarzo. Ahora hay siete tipos en la mesa.' },
};
function goalText(o, def) {
  if (o.type === 'score') return `Sumá ${fmt(o.n)} puntos`;
  if (o.type === 'collect') return `Juntá ${o.n} ${PIECE_SHORT[o.color]}`;
  if (o.type === 'pads') return 'Soldá todos los pads';
  if (o.type === 'burnt') return 'Sacá todos los quemados';
  if (o.type === 'locks') return 'Despegá toda la cinta';
  if (o.type === 'tubes') return `Bajá ${o.n} válvulas al zócalo`;
  return '';
}

// ------------------------------------------------------------ pantallas y modales
const UI = {
  screen: 'map',
  show(name) {
    this.screen = name;
    $('#scr-map').hidden = name !== 'map';
    $('#scr-game').hidden = name !== 'game';
    if (name === 'map') { Sound.duck(false); Sound.music('map'); }
    if (name === 'game') requestAnimationFrame(() => View.resize());
  },
  renderMap() {
    $('#starTotal').innerHTML = svgStar(true).replace('<svg', '<svg width="16" height="16"') + `<span>${Save.total()}/${LEVELS.length * 3}</span>`;
    const segs = 18, lit = Math.round(Save.total() / (LEVELS.length * 3) * segs);
    $('#prog').innerHTML = Array.from({ length: segs }, (_, k) => `<i class="${k < lit ? 'lit' : ''}"></i>`).join('');
    const wrap = $('#blocks');
    wrap.innerHTML = '';
    let current = 1;
    for (let n = 1; n <= LEVELS.length; n++) if (Save.unlocked(n)) current = n;
    if (Save.stars(current) > 0 && current < LEVELS.length) current++;
    BLOCKS.forEach((b, bi) => {
      const first = bi * 5 + 1;
      const card = document.createElement('section');
      card.className = 'block' + (Save.unlocked(first) ? '' : ' locked');
      card.innerHTML = `<div class="block-head"><span class="ref">U${bi + 1}</span><h2>${b.name}</h2><span class="desc">${b.desc}</span></div><div class="nodes"></div>`;
      const nodes = card.querySelector('.nodes');
      for (let n = first; n < first + 5; n++) {
        const L = LEVELS[n - 1], st = Save.stars(n), un = Save.unlocked(n);
        const btn = document.createElement('button');
        btn.className = 'node' + (st ? ' done' : '') + (un ? '' : ' locked') + (n === current && un ? ' current' : '');
        btn.setAttribute('aria-label', `Nivel ${n}: ${L.name}${un ? '' : ' (bloqueado)'}${st ? ', ' + st + ' estrellas' : ''}`);
        btn.innerHTML = `<span class="pad">${n}</span>${L.time ? `<span class="badge">${pixSvg(IC.clock, '#ffbf2e')}</span>` : ''}<span class="stars">${[0, 1, 2].map(k => svgStar(k < st)).join('')}</span>`;
        btn.disabled = !un;
        if (un) btn.addEventListener('click', () => { Sound.ensure(); Sound.play('click'); Game.open(n); });
        nodes.appendChild(btn);
      }
      wrap.appendChild(card);
    });
    const cur = wrap.querySelector('.node.current');
    if (cur && this._scrolled !== current) { this._scrolled = current; cur.scrollIntoView({ block: 'center' }); }
  },
  modal(html, onMount) {
    const m = $('#modal'), c = $('#card');
    c.innerHTML = html;
    m.hidden = false;
    if (onMount) onMount(c);
    const f = c.querySelector('[data-focus]') || c.querySelector('button');
    if (f) f.focus({ preventScroll: true });
  },
  close() { $('#modal').hidden = true; $('#card').innerHTML = ''; },
  get open() { return !$('#modal').hidden; },
  styleControl() {
    const st = ART.style;
    return `<div class="stylepick" role="group" aria-label="Estilo gráfico"><span class="lbl">Gráficos</span><button data-style="8" aria-pressed="${st === '8'}">8 bits</button><button data-style="16" aria-pressed="${st === '16'}">16 bits</button></div>`;
  },
  wireStyle(c) {
    c.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => {
      setStyle(b.dataset.style);
      if (this.screen === 'map') this.renderMap();
      c.querySelectorAll('[data-style]').forEach(x => x.setAttribute('aria-pressed', x.dataset.style === ART.style));
      Sound.play('click');
    }));
  },
  soundControls() {
    const s = Save.settings;
    return `<div class="stack">
      <div class="fader"><label for="vSfx">Efectos</label><input type="range" id="vSfx" min="0" max="100" step="5" value="${Math.round(s.sfx * 100)}"><output id="oSfx">${Math.round(s.sfx * 100)}</output></div>
      <div class="fader"><label for="vMus">Música</label><input type="range" id="vMus" min="0" max="100" step="5" value="${Math.round(s.music * 100)}"><output id="oMus">${Math.round(s.music * 100)}</output></div>
      <button class="toggle" id="tMute" aria-pressed="${s.mute}"><span class="lbl">Silenciar todo</span><span class="sw"></span></button>
    </div>`;
  },
  wireSound(c) {
    const s = Save.settings;
    const upd = () => { Sound.configure(s); Save.persist(); };
    c.querySelector('#vSfx').addEventListener('input', e => { s.sfx = e.target.value / 100; c.querySelector('#oSfx').textContent = e.target.value; upd(); });
    c.querySelector('#vSfx').addEventListener('change', () => Sound.play('match', 2));
    c.querySelector('#vMus').addEventListener('input', e => { s.music = e.target.value / 100; c.querySelector('#oMus').textContent = e.target.value; Sound.ensure(); upd(); });
    c.querySelector('#tMute').addEventListener('click', e => { s.mute = !s.mute; e.currentTarget.setAttribute('aria-pressed', s.mute); Sound.ensure(); upd(); });
  },
  settings() {
    this.modal(`<span class="eyebrow">AJUSTES</span><h2>Ajustes</h2>${this.styleControl()}${this.soundControls()}
      <button class="btn ghost" id="mHelp">Cómo se juega</button>
      <div id="resetZone"><button class="btn ghost" id="mReset" style="width:100%">Borrar progreso</button></div>
      <button class="btn" id="mClose" data-focus>Listo</button>`, c => {
      this.wireSound(c); this.wireStyle(c);
      c.querySelector('#mClose').onclick = () => { Sound.play('click'); this.close(); };
      c.querySelector('#mHelp').onclick = () => { Sound.play('click'); this.help(); };
      c.querySelector('#mReset').onclick = () => {
        c.querySelector('#resetZone').innerHTML = `<div class="confirm"><p>Se borran todas las estrellas y récords de este juego. No se puede deshacer.</p><div class="row"><button class="btn danger" id="rYes">Borrar</button><button class="btn ghost" id="rNo">Cancelar</button></div></div>`;
        c.querySelector('#rYes').onclick = () => { Save.reset(); this._scrolled = 0; this.renderMap(); this.close(); };
        c.querySelector('#rNo').onclick = () => this.settings();
      };
    });
  },
  help(back) {
    const parts = PIECE_NAMES.map((nm, k) => `<div class="p" data-icon="piece:${k}">${nm}</div>`).join('');
    const items = [
      ['lineH:2', '<b>Rayo</b> (4 en línea): barre la fila o la columna que marcan las flechas.'],
      ['bomb:3', '<b>Sobrecarga</b> (línea en L o T): explota y limpia alrededor.'],
      ['battery', '<b>Batería</b> (5 en línea): intercambiala con un componente y se van todos los de ese tipo.'],
    ];
    const obs = [
      ['pads:1', '<b>Pad de cobre</b>: hacé una línea encima para soldarlo. Con remaches, dos veces.'],
      ['burnt:1', '<b>Quemado</b>: no se mueve ni deja pasar lo que cae. Se rompe con una línea al lado o con especiales. Con carcasa, dos golpes.'],
      ['locks:1', '<b>Cinta kapton</b>: la pieza no se mueve ni deja pasar lo que cae. Incluila en una línea para despegarla.'],
      ['tubes', '<b>Válvula</b>: hacé líneas debajo de ella para que baje hasta la fila de abajo.'],
    ];
    const li = arr => arr.map(([ic, t]) => `<div class="it" data-icon="${ic}"><span>${t}</span></div>`).join('');
    this.modal(`<span class="eyebrow">MANUAL</span><h2>Cómo se juega</h2>
      <p>Deslizá un componente hacia una pieza vecina (o tocá una y después la otra). Si quedan 3 o más iguales en línea, se eliminan y caen piezas nuevas. Cumplí el pedido de cada nivel antes de quedarte sin movimientos o sin tiempo.</p>
      <div class="legend"><h3>Componentes</h3><div class="parts">${parts}</div>
      <h3>Especiales</h3>${li(items)}<p>Combiná dos especiales entre sí para efectos más grandes: dos baterías limpian toda la placa.</p>
      <h3>Obstáculos</h3>${li(obs)}
      <h3>Estrellas</h3><p>Una estrella por cumplir el pedido; dos y tres según el puntaje. Lo que sobra de movimientos o de tiempo se convierte en rayos de bonus.</p></div>
      <button class="btn" id="mClose" data-focus>Entendido</button>`, c => {
      c.querySelectorAll('[data-icon]').forEach(el => {
        const [k, a] = el.dataset.icon.split(':');
        el.prepend(iconCanvas(k, a === undefined ? undefined : +a, el.classList.contains('p') ? 36 : 40));
      });
      c.querySelector('#mClose').onclick = () => { Sound.play('click'); if (back) back(); else this.close(); };
    });
  },
};

// ------------------------------------------------------------ juego
const Game = {
  n: 0, def: null, g: null, playing: false, busy: false, paused: false, ended: false,
  timeLeft: 0, timeUp: false, idle: 0, warned: 99, movesShown: 0,

  open(n) {
    this.n = n;
    this.def = levelDef(n);
    this.g = E.createGame(this.def, (Math.random() * 1e9) | 0);
    this.playing = false; this.busy = false; this.paused = false; this.ended = false;
    this.timeLeft = this.def.time || 0; this.timeUp = false; this.idle = 0; this.warned = 99;
    this.movesShown = this.g.moves;
    View.reset(this.g);
    HUD.init(this.def, this.g);
    $('#tipStrip').textContent = '';
    this.hideBanner();
    UI.show('game');
    this.intro();
  },
  intro() {
    const d = this.def, g = this.g;
    const tip = d.tip && TIPS[d.tip];
    const order = g.goals.map((o, k) => `<div class="order-item" data-goal="${k}"><span>${goalText(d.goals[k], d)}</span></div>`).join('');
    UI.modal(`<span class="eyebrow">NIVEL ${d.n} · ${BLOCKS[d.block].name.toUpperCase()}</span>
      <h2>${d.name}</h2><p>${d.text}</p>
      <div class="spec"><div style="flex:1"><div class="k">Pedido</div><div class="order">${order}</div></div></div>
      <div class="spec"><span class="k" style="flex:1">${g.mode === 'time' ? 'Contrarreloj' : 'Movimientos'}</span><span class="v">${g.mode === 'time' ? d.time + ' s' : g.moves}</span></div>
      ${tip ? `<div class="newbox" id="newbox"><div class="t"><b>${tip.title.toUpperCase()}</b>${tip.text}</div></div>` : ''}
      <div class="row"><button class="btn" id="mGo" data-focus>${pixSvg(IC.play, 'currentColor', 'width="14" height="14"')} Empezar</button><button class="btn ghost" id="mMap">Mapa</button></div>`, c => {
      c.querySelectorAll('[data-goal]').forEach(el => {
        const o = d.goals[+el.dataset.goal];
        let ic;
        if (o.type === 'collect') ic = iconCanvas('piece', o.color, 36);
        else if (o.type === 'pads') ic = iconCanvas('pads', g.padOrig.some(v => v === 2) ? 2 : 1, 36);
        else if (o.type === 'burnt') ic = iconCanvas('burnt', g.p.some(p => p && p.k === K.BURNT && p.hp >= 2) ? 2 : 1, 36);
        else if (o.type === 'locks') ic = iconCanvas('locks', 1, 36);
        else if (o.type === 'tubes') ic = iconCanvas('tubes', 0, 36);
        else { el.insertAdjacentHTML('afterbegin', `<span style="width:36px;height:36px;display:grid;place-items:center">${pixSvg(IC.star, '#ffbf2e', 'width="28" height="28"')}</span>`); return; }
        el.prepend(ic);
      });
      if (tip) c.querySelector('#newbox').prepend(iconCanvas(tip.icon[0], tip.icon[1], 48));
      c.querySelector('#mGo').onclick = () => { Sound.ensure(); Sound.play('click'); UI.close(); this.begin(); };
      c.querySelector('#mMap').onclick = () => { Sound.play('click'); this.toMap(); };
    });
  },
  begin() {
    this.playing = true; this.idle = 0;
    Sound.duck(false); Sound.music(this.def.time ? 'timed' : 'game');
    if (ART.style === '16') View.mosaic();
    if (this.def.tip === 'swap') this.idle = 4000;
    const strips = { swap: 'Deslizá una pieza hacia su vecina', tubes: 'Hacé líneas debajo de la válvula', locks: 'Las piezas encintadas no se mueven', burnt: 'Hacé líneas pegadas a los quemados' };
    $('#tipStrip').textContent = strips[this.def.tip] || '';
  },
  toMap() {
    UI.close();
    this.playing = false; this.ended = true;
    UI.show('map'); UI.renderMap();
  },
  pause() {
    if (!this.playing || this.ended) return;
    this.paused = true;
    UI.modal(`<span class="eyebrow">NIVEL ${this.def.n} · EN PAUSA</span><h2>Pausa</h2>
      <button class="btn" id="mRes" data-focus>${pixSvg(IC.play, 'currentColor', 'width="14" height="14"')} Seguir</button>
      <div class="row"><button class="btn ghost" id="mRe">Reiniciar</button><button class="btn ghost" id="mMap">Mapa</button></div>
      ${UI.styleControl()}${UI.soundControls()}
      <button class="btn ghost" id="mHelp">Cómo se juega</button>`, c => {
      UI.wireSound(c); UI.wireStyle(c);
      c.querySelector('#mRes').onclick = () => { Sound.play('click'); this.resume(); };
      c.querySelector('#mRe').onclick = () => { Sound.play('click'); UI.close(); this.open(this.n); };
      c.querySelector('#mMap').onclick = () => { Sound.play('click'); this.toMap(); };
      c.querySelector('#mHelp').onclick = () => { Sound.play('click'); UI.help(() => this.pause()); };
    });
  },
  resume() { UI.close(); this.paused = false; this.idle = 0; },

  canInput() { return UI.screen === 'game' && this.playing && !this.busy && !this.paused && !this.ended && !UI.open; },
  touch() { this.idle = 0; if (View.hint) View.setHint(null); },
  tap(i) {
    if (!this.canInput()) return;
    const g = this.g, s = View.sel;
    const p = g.p[i];
    if (s < 0) {
      if (p && E.swappable(p)) { View.sel = i; Sound.play('click'); }
      else if (p) { View.nudge(i); Sound.play('bad'); }
      return;
    }
    if (s === i) { View.sel = -1; return; }
    if (Math.abs(X(s) - X(i)) + Math.abs(Y(s) - Y(i)) === 1) { View.sel = -1; this.move(s, i); return; }
    View.sel = p && E.swappable(p) ? i : -1;
  },
  async move(a, b) {
    if (!this.canInput()) return;
    const g = this.g;
    const r = E.trySwap(g, a, b);
    if (r.blocked) { View.nudge(E.swappable(g.p[a]) ? b : a); Sound.play('bad'); return; }
    if (!r.steps.length) return;
    this.busy = true; this.touch(); View.sel = -1;
    if (r.valid && g.mode === 'moves') { this.movesShown = g.moves; HUD.setMoves(g.moves); }
    await View.play(r.steps);
    if (!r.valid) { this.busy = false; return; }
    HUD.setScore(g.score); HUD.setGoals(g.goals.map(o => o.have));
    if (g.mode === 'time') { g.timeLeft = this.timeLeft; E.evaluateEnd(g, this.timeUp); }
    else E.evaluateEnd(g);
    if (g.over || this.timeUp) await this.finish();
    else { this.busy = false; this.idle = 0; }
  },
  onSnap(s) {
    if (!s || UI.screen !== 'game') return;
    HUD.setScore(s.score); HUD.setGoals(s.have);
  },
  bonusTick() {
    if (this.g.mode === 'moves') { this.movesShown = Math.max(0, this.movesShown - 1); HUD.setMoves(this.movesShown); }
    else { this.timeLeft = Math.max(0, this.timeLeft - 5); HUD.setTime(this.timeLeft); }
  },
  banner(text, ms) {
    const b = $('#banner');
    b.innerHTML = '<span class="bt"></span>';
    b.firstChild.textContent = text; b.hidden = false;
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    clearTimeout(this._bt);
    if (ms) this._bt = setTimeout(() => { b.hidden = true; }, ms);
  },
  hideBanner() { clearTimeout(this._bt); $('#banner').hidden = true; },

  async finish() {
    if (this.ended) return;
    this.ended = true; this.busy = true; View.setHint(null); View.sel = -1;
    Sound.duck(true);
    const g = this.g, d = this.def;
    if (g.mode === 'time') g.timeLeft = Math.max(0, this.timeLeft);
    if (!g.over) E.evaluateEnd(g, true);
    await View.wait(250);
    if (g.scoreOnly) {
      // al terminar, los especiales que quedaron en la placa explotan y suman
      const steps = E.bonus(g);
      if (steps.length) { this.banner(g.mode === 'time' ? 'Tiempo: explotan los especiales' : 'Explotan los especiales', 1100); await View.play(steps); await View.wait(300); }
      g.won = E.goalsDone(g);
      if (g.won) { Sound.play('goal'); this.banner(g.mode === 'time' ? '¡Tiempo!' : '¡Listo!'); await View.wait(1000); }
      else { this.banner(g.mode === 'time' ? 'Se acabó el tiempo' : 'Sin movimientos'); Sound.play('lose'); await View.wait(1300); }
    } else if (g.won) {
      Sound.play('goal');
      this.banner('¡Circuito completo!');
      await View.wait(1000);
      const steps = E.bonus(g);
      if (steps.length) { this.banner('Bonus', 900); await View.play(steps); }
    } else {
      this.banner(g.mode === 'time' ? 'Se acabó el tiempo' : 'Sin movimientos');
      Sound.play('lose');
      await View.wait(1300);
    }
    this.hideBanner();
    HUD.setScore(g.score);
    await View.wait(350);
    let stars = 0;
    if (g.won) { stars = 1; if (g.score >= d.stars[1]) stars = 2; if (g.score >= d.stars[2]) stars = 3; }
    const prevBest = Save.data.best[d.n] || 0;
    Save.record(d.n, stars, g.score);
    if (g.won) this.winModal(stars, prevBest); else this.loseModal();
  },
  winModal(stars, prevBest) {
    const d = this.def, g = this.g, last = d.n === LEVELS.length;
    const rec = g.score > prevBest && prevBest > 0;
    UI.modal(`<span class="eyebrow">NIVEL ${d.n} · ${d.name.toUpperCase()}</span>
      <h2>${last ? '¡La computadora arrancó!' : '¡Circuito funcionando!'}</h2>
      <div class="bigstars">${[0, 1, 2].map(() => svgStar(false)).join('')}</div>
      <div class="spec" style="flex-direction:column;align-items:stretch;gap:6px">
        <div class="score-line"><span>Puntaje</span><span>${fmt(g.score)}</span></div>
        <div class="score-line"><span>Récord</span><span class="${rec ? 'rec' : ''}">${rec ? '¡Nuevo! ' : ''}${fmt(Math.max(g.score, prevBest))}</span></div>
      </div>
      ${stars < 3 ? `<p style="font-size:14px;color:var(--muted)">${stars === 1 ? 'Segunda' : 'Tercera'} estrella desde ${fmt(d.stars[stars])} puntos.</p>` : ''}
      ${last ? '<p>Terminaste los 30 circuitos. Podés volver a cualquier nivel para buscar las tres estrellas.</p>' : ''}
      <div class="row">${last ? '' : `<button class="btn" id="mNext" data-focus>Siguiente ${pixSvg(IC.play, 'currentColor', 'width="14" height="14"')}</button>`}
      <button class="btn ghost" id="mAgain">Repetir</button><button class="btn ghost" id="mMap"${last ? ' data-focus' : ''}>Mapa</button></div>`, c => {
      const svgs = c.querySelectorAll('.bigstars svg');
      for (let k = 0; k < stars; k++) setTimeout(() => { if (!svgs[k].isConnected) return; svgs[k].outerHTML = svgStar(true).replace('<svg', '<svg class="pop"'); Sound.play('star', k, 0); }, 300 + k * 380);
      if (!last) c.querySelector('#mNext').onclick = () => { Sound.play('click'); UI.close(); this.open(d.n + 1); };
      c.querySelector('#mAgain').onclick = () => { Sound.play('click'); UI.close(); this.open(d.n); };
      c.querySelector('#mMap').onclick = () => { Sound.play('click'); this.toMap(); };
    });
    if (stars) Sound.play('win');
  },
  loseModal() {
    const missText = m => {
      const list = m.length > 1 ? m.slice(0, -1).join(', ') + ' y ' + m[m.length - 1] : m[0];
      const one = m.length === 1 && /^1 /.test(m[0]);
      return `Te ${one ? 'faltó' : 'faltaron'} ${list}.`;
    };
    const d = this.def, g = this.g;
    const miss = g.goals.map((o, k) => {
      const rem = o.need - o.have;
      if (rem <= 0) return null;
      if (o.type === 'score') return `${fmt(rem)} puntos`;
      if (o.type === 'collect') return `${rem} ${rem === 1 ? PIECE_ONE[o.color] : PIECE_SHORT[o.color]}`;
      if (o.type === 'pads') return `${rem} ${rem === 1 ? 'pasada de estaño' : 'pasadas de estaño'}`;
      if (o.type === 'burnt') return `${rem} ${rem === 1 ? 'golpe a los quemados' : 'golpes a los quemados'}`;
      if (o.type === 'locks') return `${rem} ${rem === 1 ? 'cinta' : 'cintas'}`;
      if (o.type === 'tubes') return `${rem} ${rem === 1 ? 'válvula' : 'válvulas'}`;
      return null;
    }).filter(Boolean);
    UI.modal(`<span class="eyebrow">NIVEL ${d.n} · ${d.name.toUpperCase()}</span><h2>No arrancó</h2>
      <p>${missText(miss)}</p>
      <div class="row"><button class="btn" id="mAgain" data-focus>Reintentar</button><button class="btn ghost" id="mMap">Mapa</button></div>`, c => {
      c.querySelector('#mAgain').onclick = () => { Sound.play('click'); UI.close(); this.open(d.n); };
      c.querySelector('#mMap').onclick = () => { Sound.play('click'); this.toMap(); };
    });
  },

  tick(dt) {
    HUD.tick(dt);
    if (UI.screen !== 'game' || !this.playing || this.paused || this.ended || UI.open) return;
    if (this.g.mode === 'time' && !this.timeUp) {
      this.timeLeft -= dt / 1000;
      const sec = Math.ceil(this.timeLeft);
      if (sec <= 10 && sec < this.warned && sec > 0) { this.warned = sec; Sound.play('warn'); }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0; this.timeUp = true;
        if (!this.busy) this.finish();
      }
      HUD.setTime(this.timeLeft);
    }
    if (!this.busy) {
      this.idle += dt;
      const delay = this.n <= 3 ? 5000 : 8000;
      if (this.idle > delay && !View.hint) {
        const ranked = E.rankMoves(this.g, null);
        if (ranked.length) {
          const m = ranked[0], pa = this.g.p[m.a], pb = this.g.p[m.b];
          View.setHint({ a: m.a, b: m.b, ida: pa.id, idb: pb.id });
        }
      }
    }
  },
};

// ------------------------------------------------------------ entrada
(function input() {
  const cv = View.canvas;
  let down = null;
  cv.addEventListener('pointerdown', e => {
    Sound.ensure();
    if (!Game.canInput()) return;
    const c = View.cellAt(e.clientX, e.clientY);
    if (c < 0) return;
    down = { c, x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    Game.touch();
    e.preventDefault();
  });
  cv.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id || down.moved) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    const th = View.cellCss() * 0.3;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
    down.moved = true;
    const x = X(down.c), y = Y(down.c);
    let tx = x, ty = y;
    if (Math.abs(dx) > Math.abs(dy)) tx += dx > 0 ? 1 : -1; else ty += dy > 0 ? 1 : -1;
    View.sel = -1;
    if (tx < 0 || tx > 7 || ty < 0 || ty > 7) return;
    Game.move(down.c, ty * 8 + tx);
  });
  const up = e => {
    if (!down || e.pointerId !== down.id) return;
    if (!down.moved && e.type === 'pointerup') Game.tap(down.c);
    down = null;
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('pointerdown', () => Sound.ensure(), { capture: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && UI.screen === 'game' && Game.playing && !Game.ended && !UI.open) Game.pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && Game.playing && !Game.ended && !UI.open) Game.pause(); });
  new ResizeObserver(() => { if (UI.screen === 'game') View.resize(); }).observe($('#boardWrap'));
})();

// ------------------------------------------------------------ arranque
function boot() {
  $('#btnSettings').innerHTML = pixSvg(IC.gear);
  $('#btnPause').innerHTML = pixSvg(IC.gear);
  $('#btnBack').innerHTML = pixSvg(IC.back);
  $('#btnSettings').onclick = () => { Sound.ensure(); Sound.play('click'); UI.settings(); };
  $('#btnHelp').onclick = () => { Sound.ensure(); Sound.play('click'); UI.help(); };
  $('#btnPause').onclick = () => { Sound.play('click'); Game.pause(); };
  $('#btnBack').onclick = () => { Sound.play('click'); if (Game.playing && !Game.ended) Game.pause(); else Game.toMap(); };
  Save.load();
  ART.style = Save.settings.style === '16' ? '16' : '8';
  applyArt();
  Sound.configure(Save.settings);
  UI.show('map');
  UI.renderMap();
  Cloud.init();
  if (document.fonts && document.fonts.load) document.fonts.load('700 16px Silkscreen').catch(() => {});
}
window.__fogonazo = { Game, Save, UI, View, levelDef };
const hot = window.claude && window.claude.hot;
try { if (hot && hot.snapshot) hot.snapshot(() => ({ screen: UI.screen })); } catch (e) {}
let booted = false;
const bootOnce = () => { if (booted) return; booted = true; boot(); };
try { if (hot && hot.ready) { hot.ready(bootOnce); setTimeout(bootOnce, 1200); } else bootOnce(); } catch (e) { bootOnce(); }
})();
