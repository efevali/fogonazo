/* Chispazo — arte pixelado (16×16). Cada sprite: paleta + filas; el contorno oscuro se agrega solo. */
const PIECE_NAMES = ['Resistencia', 'Capacitor electrolítico', 'LED', 'Bobina', 'Chip', 'Capacitor cerámico', 'Cristal'];
const PIECE_SHORT = ['resistencias', 'electrolíticos', 'LEDs', 'bobinas', 'chips', 'cerámicos', 'cristales'];
const PIECE_ONE = ['resistencia', 'electrolítico', 'LED', 'bobina', 'chip', 'cerámico', 'cristal'];
const PIECE_COLORS = ['#e8994f', '#3b74e6', '#ec3a33', '#35a853', '#7a4ad6', '#f2c230', '#cfd6de'];
const LEGS = { g: '#cfd5dc', h: '#8b929c' };

const SPR = {
  resistor: {
    pal: { L: '#f8cd92', B: '#e39a52', D: '#a9662c', 1: '#6e3b1a', 2: '#262626', 3: '#d63a2f', 4: '#f0c94a', g: LEGS.g, h: LEGS.h },
    rows: [
      '................',
      '................',
      '................',
      '................',
      '..L1L......L4L..',
      '..B1BL2L3LLB4B..',
      '..B1BB2B3BBB4B..',
      'ggB1BB2B3BBB4Bgg',
      'hhB1BB2B3BBB4Bhh',
      '..B1BB2B3BBB4B..',
      '..B1BD2D3DDB4B..',
      '..D1D......D4D..',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  ecap: {
    pal: { S: '#e9eef3', H: '#ffffff', s: '#97a3b0', D: '#1d3f8f', L: '#79a6ff', B: '#2f6ae0', W: '#bcd5ff', m: '#1d3f8f', d: '#132c66', g: LEGS.g },
    rows: [
      '................',
      '....SHSSSSSS....',
      '....ssssssss....',
      '....DLBBBWWD....',
      '....DLBBBWWD....',
      '....DLBBBmmD....',
      '....DLBBBWWD....',
      '....DLBBBWWD....',
      '....DLBBBmmD....',
      '....DLBBBWWD....',
      '....DLBBBWWD....',
      '....dddddddd....',
      '......g..g......',
      '......g..g......',
      '......g..g......',
      '................',
    ],
  },
  led: {
    pal: { L: '#ff8a7f', H: '#ffd9d3', B: '#e5322d', D: '#a51d1d', K: '#741313', R: '#c42a2a', g: LEGS.g },
    rows: [
      '................',
      '.......LL.......',
      '......LHBB......',
      '.....LHBBBD.....',
      '.....LHBBBD.....',
      '.....LHBBBD.....',
      '.....LBKKBD.....',
      '.....LBKBBD.....',
      '.....LBKKKD.....',
      '.....BBBBBD.....',
      '....RRRRRRRR....',
      '......g..g......',
      '......g..g......',
      '......g..g......',
      '......g.........',
      '................',
    ],
  },
  chip: {
    pal: { L: '#b490ff', B: '#6b3fc9', M: '#4b2896', D: '#341b6c', N: '#22103f', o: '#ddd0ff', t: '#9472ea', p: '#e6ebf0', q: '#97a1ac' },
    rows: [
      '................',
      '................',
      '....LLLNNLLL....',
      '..ppBBBBBBBMpp..',
      '..qqBoBBBBBMqq..',
      '....BBBBBBBM....',
      '..ppBttttBBMpp..',
      '..qqBBBBBBBMqq..',
      '....BtttBBBM....',
      '..ppBBBBBBBMpp..',
      '..qqBBBBBBBMqq..',
      '....BBBBBBBM....',
      '..ppBBBBBBBMpp..',
      '..qqDDDDDDDDqq..',
      '................',
      '................',
    ],
  },
  crystal: {
    pal: { H: '#ffffff', L: '#e4e9ef', B: '#c3cbd4', e: '#97a3b0', t: '#7f8b98', D: '#76828f', g: LEGS.g },
    rows: [
      '................',
      '................',
      '....LLLLLLLL....',
      '...LHHHHHHHHL...',
      '...LLeeeeeeLL...',
      '...BeBBBBBBeB...',
      '...BeBtBttBeB...',
      '...BeBBBBBBeB...',
      '...BeBttBtBeB...',
      '...BBeeeeeeBB...',
      '...DDDDDDDDDD...',
      '....DDDDDDDD....',
      '.....g....g.....',
      '.....g....g.....',
      '.....g....g.....',
      '................',
    ],
  },
  battery: {
    pal: { n: '#e6ebf0', T: 'rainbow', w: '#ffffff', k: '#111111', G: '#3a3f47', h: '#59606b', y: '#ffe14a', s: '#c9d0d8' },
    rows: [
      '................',
      '.......nn.......',
      '....TTTTTTTT....',
      '....TTTwTTTT....',
      '....TTwwwTTT....',
      '....TTTwTTTT....',
      '....kkkkkkkk....',
      '....hGGGyyGG....',
      '....hGGyyGGG....',
      '....hGyyyyGG....',
      '....hGGyyGGG....',
      '....hGyyGGGG....',
      '....hGGGGGGG....',
      '....ssssssss....',
      '................',
      '................',
    ],
  },
  tube: {
    pal: { G: 'rgba(190,240,255,0.95)', a: 'rgba(170,225,245,0.28)', S: '#c7ced6', P: '#8b939c', F: '#ffb347', K: '#1c1c1c', k: '#4a4a4a', p: '#cfd5dc' },
    rows: [
      '......GGGG......',
      '.....GSSSSG.....',
      '....GaSSSSaG....',
      '....GaPPPPaG....',
      '....GaPaaPaG....',
      '....GaPFFPaG....',
      '....GaPFFPaG....',
      '....GaPFFPaG....',
      '....GaPPPPaG....',
      '....GaaaaaaG....',
      '....GGGGGGGG....',
      '....KKKKKKKK....',
      '....KkKKKKKK....',
      '.....p.pp.p.....',
      '.....p.pp.p.....',
      '................',
    ],
  },
  burnt1: {
    pal: { c: '#45403c', C: '#24201d', x: '#6a5d52', r: '#ff6a2a' },
    rows: [
      '................',
      '................',
      '....cccccccc....',
      '...cCCCCCCCCc...',
      '..cCCxCCCCCCCc..',
      '..cCCCxCCCrCCc..',
      '..cCCCCxCCCCCc..',
      '..cCrCCCxxCCCc..',
      '..cCCCCCCCxCCc..',
      '..cCCCCCCCCxCc..',
      '..cCCCCCrCCCCc..',
      '...cCCCCCCCCc...',
      '....cccccccc....',
      '................',
      '................',
      '................',
    ],
  },
  burnt2: {
    pal: { m: '#7a8089', M: '#a7aeb7', R: '#dfe4ea', c: '#45403c', C: '#24201d', x: '#6a5d52', r: '#ff6a2a' },
    rows: [
      '................',
      '.MMMMMMMMMMMMMM.',
      '.mRccccccccccRm.',
      '.mcCCCCCCCCCCcm.',
      '.mcCCxCCCCrCCcm.',
      '.mcCCCxCCCCCCcm.',
      '.mcCrCCxCCCCCcm.',
      '.mcCCCCCxxCCCcm.',
      '.mcCCCCCCCxCrcm.',
      '.mcCCCCCCCCxCcm.',
      '.mcCCrCCCCCCCcm.',
      '.mcCCCCCCCCCCcm.',
      '.mRccccccccccRm.',
      '.mmmmmmmmmmmmmm.',
      '................',
      '................',
    ],
  },
};

// Bobina: toroide de ferrite verde con espiras de cobre (procedural)
SPR.coil = (function () {
  const pal = { a: '#7fd487', b: '#36a456', c: '#1f6e36', u: '#ffc489', v: '#dd8a40', w: '#9a5320', l: '#dd8a40' };
  const rows = [];
  const cx = 8, cy = 7, R = 6.0, r = 2.9, turns = 9;
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d <= R && d >= r) {
        const a = Math.atan2(dy, dx);
        const f = ((a / (Math.PI * 2)) * turns + 10) % 1;
        const shade = (dx + dy) / d;
        const copper = f < 0.4;
        const edge = d > R - 1.1 || d < r + 0.9;
        if (copper) row += f < 0.13 ? 'u' : (shade > 0.55 ? 'w' : 'v');
        else row += edge ? (shade > 0.2 ? 'c' : 'b') : (shade < -0.3 ? 'a' : 'b');
      } else if ((x === 6 || x === 9) && y >= 12 && y <= 14) row += 'l';
      else row += '.';
    }
    rows.push(row);
  }
  return { pal, rows };
})();

// Capacitor cerámico: disco amarillo con patas (procedural)
SPR.ccap = (function () {
  const pal = { H: '#fff6cc', L: '#ffe27a', Y: '#f2c12e', D: '#bf8913', m: '#9c6e0c', g: LEGS.g };
  const rows = [];
  const cx = 8, cy = 5.8, R = 4.7;
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d <= R) {
        const sh = (dx + dy) / R;
        if (Math.hypot(dx + 1.8, dy + 1.8) < 1.1) row += 'H';
        else if (y === 6 && x >= 7 && x <= 8) row += 'm';
        else row += sh < -0.55 ? 'L' : sh > 0.45 ? 'D' : 'Y';
      } else if ((x === 6 || x === 9) && y >= 11 && y <= 14) row += 'g';
      else row += '.';
    }
    rows.push(row);
  }
  return { pal, rows };
})();


// Pads de cobre (sin contorno: ocupan toda la celda)
(function () {
  const base = [
    '................',
    '.HHHHHHHHHHHHHH.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCooCCCCCD.',
    '.HCCCCooooCCCCD.',
    '.HCCCCooooCCCCD.',
    '.HCCCCCooCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.HCCCCCCCCCCCCD.',
    '.DDDDDDDDDDDDDD.',
    '................',
  ];
  const vias = base.map(r => r.split(''));
  for (const [vx, vy] of [[2, 2], [11, 2], [2, 11], [11, 11]]) for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) vias[vy + dy][vx + dx] = (dx === 1 && dy === 1) ? 'o' : 'V';
  SPR.pad1 = { noOutline: true, pal: { H: '#f4ab6c', C: '#c8742f', D: '#86461a', o: '#2a1608' }, rows: base };
  SPR.pad2 = { noOutline: true, pal: { H: '#f4ab6c', C: '#b3611f', D: '#743a12', o: '#2a1608', V: '#ffd27a' }, rows: vias.map(r => r.join('')) };
  SPR.padDone = { noOutline: true, pal: { H: '#c3ccd4', C: '#6f7d86', D: '#46525a', o: '#9ba6af' }, rows: base };
})();

const PIECE_SPRITES = ['resistor', 'ecap', 'led', 'coil', 'chip', 'ccap', 'crystal'];
const OUTLINE = '#120d0b';

function withOutline(rows) {
  const g = rows.map(r => r.split(''));
  const out = g.map(r => r.slice());
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (g[y][x] !== '.') continue;
    const nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    if (nb.some(([a, b]) => a >= 0 && a < 16 && b >= 0 && b < 16 && g[b][a] !== '.')) out[y][x] = '#';
  }
  return out;
}

const RAINBOW = ['#ff4b4b', '#ff9f1c', '#ffe14a', '#3ee07a', '#3fa9ff', '#a66bff'];

// Dibuja un sprite en un canvas de `size` px. hueShift sólo para la batería.
function renderSprite(name, size, opts) {
  opts = opts || {};
  const def = SPR[name];
  const grid = def.noOutline ? def.rows.map(r => r.split('')) : withOutline(def.rows);
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const s = size / 16;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const ch = grid[y][x];
    if (ch === '.') continue;
    let col = ch === '#' ? OUTLINE : def.pal[ch];
    if (col === 'rainbow') col = RAINBOW[(x + (opts.hue || 0)) % RAINBOW.length];
    if (opts.tint && ch !== '#') col = opts.tint;
    ctx.fillStyle = col;
    const x0 = Math.round(x * s), y0 = Math.round(y * s);
    ctx.fillRect(x0, y0, Math.round((x + 1) * s) - x0, Math.round((y + 1) * s) - y0);
  }
  return cv;
}

// Overlays de especiales (flechas) y cinta kapton
function renderOverlay(kind, size) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const s = size / 16;
  const px = (x, y, c) => { ctx.fillStyle = c; const x0 = Math.round(x * s), y0 = Math.round(y * s); ctx.fillRect(x0, y0, Math.round((x + 1) * s) - x0, Math.round((y + 1) * s) - y0); };
  if (kind === 'lineH' || kind === 'lineV') {
    const arrow = [[2, 5], [1, 6], [2, 6], [0, 7], [1, 7], [2, 7], [0, 8], [1, 8], [2, 8], [1, 9], [2, 9], [2, 10]];
    const pts = [];
    for (const [x, y] of arrow) { pts.push([x, y]); pts.push([15 - x, y]); }
    const set = new Set(pts.map(([x, y]) => kind === 'lineH' ? x + ',' + y : y + ',' + x));
    for (const k of set) {
      const [x, y] = k.split(',').map(Number);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16 && !set.has(nx + ',' + ny)) px(nx, ny, OUTLINE);
      }
    }
    for (const k of set) { const [x, y] = k.split(',').map(Number); px(x, y, '#ffffff'); }
  } else if (kind === 'tape') {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const a = Math.abs(x - y), b = Math.abs(x + y - 15);
      if (a <= 1 || b <= 1) {
        const edge = (a === 1 && b > 1) || (b === 1 && a > 1);
        px(x, y, edge ? 'rgba(255,196,110,0.75)' : 'rgba(232,150,40,0.62)');
      }
    }
    for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) px(x, y, 'rgba(255,236,190,0.9)');
  }
  return cv;
}
