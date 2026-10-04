/* Fogonazo — estilo 16 bits: sprites 32×32 generados con luz, rampas de color, tramado y contorno de color. */
const HD = (() => {
  const N = 32;
  const Lraw = [-0.5, -0.68, 0.72], Ll = Math.hypot(...Lraw), L = Lraw.map(v => v / Ll);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const BAYER = [[0, 0.5], [0.75, 0.25]];

  // Rampas de 6 tonos (oscuro → claro). out = contorno; spec = brillo especular.
  const M = {
    tan: { r: ['#4f2a0e', '#83461a', '#b4672a', '#dc8a42', '#f2ad66', '#ffd6a0'], out: '#2a1408' },
    brown: { r: ['#22100a', '#3d1d0e', '#5c2d15', '#7a3d1e', '#985028', '#b26636'], out: '#1a0c06' },
    black: { r: ['#09090b', '#141418', '#202026', '#2f2f37', '#41414b', '#5a5a66'], out: '#050506' },
    red: { r: ['#42090a', '#721112', '#a51c1b', '#d23a2e', '#ec6b55', '#ffa08c'], out: '#2a0606' },
    gold: { r: ['#4f3a07', '#7f5d0f', '#ad841b', '#d8ad37', '#f2d26d', '#fff0b6'], out: '#2e2204' },
    silver: { r: ['#353b43', '#58616c', '#7e8893', '#a7b0ba', '#cdd4db', '#f2f5f8'], out: '#1d2126' },
    blue: { r: ['#0b1a45', '#132d76', '#1c45ac', '#2a63d8', '#528af2', '#96bdff'], out: '#070f2a' },
    sky: { r: ['#34507e', '#4f71a8', '#7397cf', '#9fbeea', '#c8dcf8', '#ecf4ff'], out: '#1a2a44' },
    rubber: { r: ['#090b0e', '#12151a', '#1d2128', '#292e37', '#373e49', '#48505d'], out: '#040506' },
    led: { r: ['#3f0505', '#740c0c', '#ad1916', '#e0302a', '#ff6450', '#ffb1a3'], out: '#260303', spec: '#ffffff' },
    ledDark: { r: ['#250303', '#420606', '#640b0a', '#871211', '#a81c1a', '#c42b27'], out: '#1a0202' },
    copper: { r: ['#431c07', '#723411', '#a0511d', '#cb7631', '#ee9f58', '#ffd09c'], out: '#2a1004', spec: '#fff1dc' },
    green: { r: ['#082612', '#0f421f', '#17622f', '#228842', '#36ab5b', '#70d488'], out: '#041509' },
    purple: { r: ['#170935', '#251157', '#371d80', '#4e2daa', '#6c48cf', '#9c7ded'], out: '#0c0420' },
    lilac: { r: ['#4c3a7c', '#6650a0', '#8169c1', '#9e88db', '#bba9ee', '#dccff9'], out: '#2a1f48' },
    yellow: { r: ['#523404', '#865608', '#ba8112', '#e3ab20', '#f6cd4c', '#fff0a4'], out: '#2c1c02', spec: '#fffbe6' },
    graphite: { r: ['#101216', '#1b1f25', '#272c34', '#353c46', '#46505c', '#5c6876'], out: '#08090b' },
    white: { r: ['#9aa3ad', '#b9c1ca', '#d3d9e0', '#e7ebef', '#f6f8fa', '#ffffff'], out: '#5a626b' },
    bolt: { r: ['#6b4a00', '#a37400', '#d8a200', '#ffc81e', '#ffe14a', '#fff6b0'], out: '#3a2800' },
    glass: { r: ['rgba(70,130,160,0.55)', 'rgba(100,165,195,0.42)', 'rgba(135,195,222,0.34)', 'rgba(165,218,240,0.32)', 'rgba(205,240,252,0.5)', 'rgba(245,253,255,0.9)'], out: 'rgba(150,220,245,0.95)' },
    steel: { r: ['#262a30', '#3e444c', '#5a616a', '#78808a', '#9ca4ad', '#c5ccd3'], out: '#14171b' },
    charcoal: { r: ['#0b0a09', '#161311', '#211d1a', '#2d2723', '#3b332c', '#4d4237'], out: '#050404' },
    ash: { r: ['#2c2622', '#40372f', '#56493d', '#6d5c4c', '#86715d', '#a08a72'], out: '#1a1612' },
    ember: { r: ['#6e1a04', '#a8300a', '#de5512', '#ff8427', '#ffb15a', '#ffdf9f'], out: '#3a0e02', spec: '#fff4d8' },
    hole: { r: ['#0e0703', '#170c05', '#211208', '#2b180b', '#36200f', '#432914'], out: '#0a0502' },
    tin: { r: ['#3e464e', '#5d6770', '#7f8992', '#a2acb5', '#c6ced5', '#eef2f5'], out: '#262c31', spec: '#ffffff' },
    padCu: { r: ['#4a1f07', '#7b3812', '#a8561f', '#cc7533', '#e8995a', '#f9c592'], out: '#3a1806' },
  };
  const RB = ['#ff4b4b', '#ff9f1c', '#ffe14a', '#3ee07a', '#3fa9ff', '#a66bff'];
  const RBM = RB.map(c => ({ r: [shade(c, -0.55), shade(c, -0.35), shade(c, -0.15), c, shade(c, 0.25), shade(c, 0.5)], out: shade(c, -0.7) }));
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 1442695041) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  function grid() { return { m: new Array(N * N).fill(null), l: new Float32Array(N * N), tint: new Uint8Array(N * N) }; }
  function lit(n) {
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    const nx = n[0] / len, ny = n[1] / len, nz = n[2] / len;
    const d = nx * L[0] + ny * L[1] + nz * L[2];
    const spec = Math.pow(Math.max(0, 2 * d * nz - L[2]), 22);
    return 0.16 + 0.84 * Math.max(0, d) + spec * 0.7;
  }
  function put(G, x, y, mat, lum) { if (x < 0 || y < 0 || x >= N || y >= N) return; G.m[y * N + x] = mat; G.l[y * N + x] = lum; }
  function each(x0, x1, y0, y1, fn) { for (let y = Math.max(0, y0); y <= Math.min(N - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(N - 1, x1); x++) fn(x, y); }
  function inRound(x, y, x0, x1, y0, y1, r) {
    const px = x + 0.5, py = y + 0.5;
    const cx = clamp(px, x0 + r, x1 + 1 - r), cy = clamp(py, y0 + r, y1 + 1 - r);
    return Math.hypot(px - cx, py - cy) <= r + 0.01;
  }
  // cilindro vertical (eje Y)
  function cylV(G, x0, x1, y0, y1, mat, o) {
    o = o || {};
    const cx = (x0 + x1 + 1) / 2, rx = (x1 - x0 + 1) / 2;
    each(x0, x1, y0, y1, (x, y) => {
      if (o.r && !inRound(x, y, x0, x1, y0, y1, o.r)) return;
      const u = clamp((x + 0.5 - cx) / rx, -0.98, 0.98);
      put(G, x, y, mat, lit([u, o.tilt || -0.12, Math.sqrt(1 - u * u)]) + (o.add || 0));
    });
  }
  // cilindro horizontal (eje X)
  function cylH(G, x0, x1, y0, y1, mat, o) {
    o = o || {};
    const cy = (y0 + y1 + 1) / 2, ry = (y1 - y0 + 1) / 2;
    each(x0, x1, y0, y1, (x, y) => {
      if (o.r && !inRound(x, y, x0, x1, y0, y1, o.r)) return;
      const v = clamp((y + 0.5 - cy) / ry, -0.98, 0.98);
      put(G, x, y, mat, lit([o.tilt || -0.1, v, Math.sqrt(1 - v * v)]) + (o.add || 0));
    });
  }
  function sphere(G, cx, cy, rx, ry, mat, o) {
    o = o || {};
    each(Math.floor(cx - rx), Math.ceil(cx + rx), Math.floor(cy - ry), Math.ceil(cy + ry), (x, y) => {
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
      if (d > 1) return;
      if (o.clip && !o.clip(x, y)) return;
      put(G, x, y, mat, lit([u, v, Math.sqrt(1 - d) * (o.flat || 1)]) + (o.add || 0));
    });
  }
  // caja plana con bisel
  function bevel(G, x0, x1, y0, y1, mat, o) {
    o = o || {};
    const b = o.b || 2, base = o.base === undefined ? 0.62 : o.base;
    each(x0, x1, y0, y1, (x, y) => {
      if (o.r && !inRound(x, y, x0, x1, y0, y1, o.r)) return;
      let lum = base;
      const dl = x - x0, dr = x1 - x, dt = y - y0, db = y1 - y;
      if (dt < b || dl < b) lum += 0.32 * (1 - Math.min(dt, dl) / b);
      if (db < b || dr < b) lum -= 0.34 * (1 - Math.min(db, dr) / b);
      if (o.noise) lum += (hash(x, y, o.seed) - 0.5) * o.noise;
      if (o.grad) lum += (0.5 - (y - y0) / (y1 - y0 + 1)) * o.grad;
      put(G, x, y, mat, lum);
    });
  }
  function recolor(G, pred, mat, dl) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; if (G.m[i] && pred(x, y)) { G.m[i] = mat || G.m[i]; G.l[i] += dl || 0; } } }
  function rect(G, x0, x1, y0, y1, mat, lum) { each(x0, x1, y0, y1, (x, y) => put(G, x, y, mat, lum)); }
  function line(G, pts, mat, lum, w) {
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2 + 1;
      for (let s = 0; s <= n; s++) {
        const x = Math.round(ax + (bx - ax) * s / n), y = Math.round(ay + (by - ay) * s / n);
        for (let dy = 0; dy < (w || 1); dy++) for (let dx = 0; dx < (w || 1); dx++) {
          const i = (y + dy) * N + (x + dx);
          if (x + dx < N && y + dy < N && G.m[i]) { G.m[i] = mat; G.l[i] = lum; }
        }
      }
    }
  }
  function inPoly(x, y, P) {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  function toPixels(G, o) {
    o = o || {};
    const out = new Array(N * N).fill(null);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, mat = G.m[i];
      if (!mat) continue;
      const lum = G.l[i];
      if (lum > 1.02 && mat.spec) { out[i] = mat.spec; continue; }
      const r = mat.r, k = r.length - 1;
      const v = clamp(lum, 0, 1) * k + (BAYER[y & 1][x & 1] - 0.375) * 0.55;
      out[i] = r[clamp(Math.round(v), 0, k)];
    }
    // contorno de color (no negro): el tono más oscuro del material vecino
    if (!o.noOutline) {
      const src = out.slice();
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x;
        if (src[i]) continue;
        let mat = null;
        for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
          if (G.m[ny * N + nx]) { mat = G.m[ny * N + nx]; break; }
        }
        if (mat) out[i] = mat.out;
      }
    }
    // vidrio sobre piezas internas
    for (let i = 0; i < N * N; i++) if (G.tint[i] && out[i]) out[i] = { base: out[i], glass: true };
    return out;
  }

  // ------------------------------------------------------------ componentes
  const B = {};
  B.resistor = () => {
    const G = grid();
    cylH(G, 0, 5, 15, 16, M.silver); cylH(G, 26, 31, 15, 16, M.silver);
    cylH(G, 10, 21, 9, 22, M.tan);
    cylH(G, 3, 12, 7, 24, M.tan, { r: 4.5 }); cylH(G, 19, 28, 7, 24, M.tan, { r: 4.5 });
    recolor(G, x => x === 6 || x === 7, M.brown);
    recolor(G, x => x === 12 || x === 13, M.black);
    recolor(G, x => x === 16 || x === 17, M.red);
    recolor(G, x => x === 24 || x === 25, M.gold);
    return G;
  };
  B.ecap = () => {
    const G = grid();
    cylV(G, 11, 12, 27, 31, M.silver); cylV(G, 19, 20, 27, 31, M.silver);
    cylV(G, 6, 25, 5, 27, M.blue, { r: 2 });
    recolor(G, (x, y) => x >= 19 && x <= 22 && y >= 7 && y <= 25, M.sky);
    recolor(G, (x, y) => x >= 20 && x <= 21 && (y === 11 || y === 16 || y === 21), M.blue, -0.35);
    recolor(G, (x, y) => y === 8, null, -0.28);
    recolor(G, (x, y) => y >= 25, M.rubber);
    sphere(G, 15.5, 5.5, 9.5, 3.2, M.silver, { flat: 0.6, add: 0.08 });
    recolor(G, (x, y) => y >= 3 && y <= 8 && ((x === 15 || x === 16) && y >= 4 && y <= 7), M.silver, -0.4);
    recolor(G, (x, y) => (y === 5 || y === 6) && x >= 11 && x <= 20, M.silver, -0.4);
    return G;
  };
  B.led = () => {
    const G = grid();
    cylV(G, 11, 12, 24, 31, M.silver); cylV(G, 19, 20, 24, 29, M.silver);
    cylV(G, 7, 24, 20, 24, M.led, { add: -0.12 });
    cylV(G, 8, 23, 10, 21, M.led);
    sphere(G, 15.5, 10.5, 8, 8.5, M.led, { clip: (x, y) => y <= 11 });
    recolor(G, (x, y) => (x >= 13 && x <= 14 && y >= 12 && y <= 19) || (x >= 16 && x <= 19 && y >= 15 && y <= 19), M.ledDark);
    recolor(G, (x, y) => x >= 16 && x <= 18 && y === 14, M.ledDark);
    each(10, 11, 5, 11, (x, y) => { if (G.m[y * N + x]) G.l[y * N + x] = 1.1; });
    return G;
  };
  B.coil = () => {
    const G = grid();
    cylV(G, 9, 10, 25, 31, M.copper); cylV(G, 21, 22, 25, 31, M.copper);
    const cx = 16, cy = 14.5, R = 13.8, r = 5.2, Rc = (R + r) / 2, rt = (R - r) / 2, turns = 11;
    each(0, N - 1, 0, N - 1, (x, y) => {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d > R || d < r) return;
      const u = clamp((d - Rc) / rt, -0.98, 0.98), z = Math.sqrt(1 - u * u);
      const n = [u * dx / d, u * dy / d, z];
      const a = Math.atan2(dy, dx), f = ((a / (Math.PI * 2)) * turns + 10) % 1;
      if (f < 0.5) put(G, x, y, M.copper, lit(n) * (0.78 + 0.32 * Math.sin(f / 0.5 * Math.PI)));
      else put(G, x, y, M.green, lit(n));
    });
    return G;
  };
  B.chip = () => {
    const G = grid();
    for (const y of [7, 12, 17, 22]) { cylH(G, 2, 7, y, y + 2, M.silver); cylH(G, 24, 29, y, y + 2, M.silver); }
    bevel(G, 6, 25, 4, 27, M.purple, { b: 3, base: 0.55, grad: 0.15 });
    each(13, 18, 4, 7, (x, y) => { if (Math.hypot(x + 0.5 - 16, y + 0.5 - 4) < 2.8) put(G, x, y, M.purple, 0.12); });
    sphere(G, 10.5, 8.5, 1.6, 1.6, M.purple, { add: -0.25 });
    for (const [x0, x1, y] of [[10, 11, 13], [13, 15, 13], [17, 18, 13], [20, 21, 13], [10, 16, 18], [18, 21, 18]]) recolor(G, (x, yy) => yy === y && x >= x0 && x <= x1, M.lilac, 0.05);
    return G;
  };
  B.ccap = () => {
    const G = grid();
    cylV(G, 11, 12, 22, 31, M.silver); cylV(G, 19, 20, 22, 31, M.silver);
    cylV(G, 10, 13, 19, 24, M.yellow, { r: 1.5 }); cylV(G, 18, 21, 19, 24, M.yellow, { r: 1.5 });
    sphere(G, 16, 12, 11.5, 10.5, M.yellow, { flat: 0.55 });
    recolor(G, (x, y) => y === 12 && ((x >= 11 && x <= 14) || (x >= 17 && x <= 20)), M.yellow, -0.55);
    recolor(G, (x, y) => y === 15 && x >= 13 && x <= 18, M.yellow, -0.45);
    return G;
  };
  B.crystal = () => {
    const G = grid();
    cylV(G, 9, 10, 23, 31, M.silver); cylV(G, 21, 22, 23, 31, M.silver);
    bevel(G, 2, 29, 8, 24, M.silver, { r: 7, b: 3, base: 0.6, grad: 0.25 });
    recolor(G, (x, y) => { const p = (x === 6 || x === 25) && y >= 12 && y <= 20; const q = (y === 11 || y === 21) && x >= 8 && x <= 23; return p || q; }, M.silver, -0.28);
    recolor(G, (x, y) => y === 12 && x >= 7 && x <= 24, M.silver, 0.25);
    recolor(G, (x, y) => (y === 15 && ((x >= 10 && x <= 13) || (x >= 15 && x <= 21))) || (y === 18 && x >= 11 && x <= 18), M.silver, -0.42);
    recolor(G, (x, y) => { const k = x - y; return k >= -1 && k <= 0 && y >= 9 && y <= 14; }, M.silver, 0.35);
    return G;
  };
  B.battery = (hue) => {
    const G = grid();
    cylV(G, 13, 18, 2, 5, M.silver);
    cylV(G, 8, 23, 4, 28, M.graphite, { r: 2 });
    recolor(G, (x, y) => y >= 5 && y <= 12, null, 0);
    for (let y = 5; y <= 12; y++) for (let x = 8; x <= 23; x++) { const i = y * N + x; if (G.m[i]) { G.m[i] = RBM[(Math.floor((x - 8) / 3) + (hue || 0)) % 6]; G.l[i] += 0.1; } }
    recolor(G, (x, y) => ((x === 15 || x === 16) && y >= 6 && y <= 11) || ((y === 8 || y === 9) && x >= 13 && x <= 18), M.white, 0.3);
    recolor(G, (x, y) => y === 13, M.rubber);
    const P = [[18.5, 14], [11.5, 22], [15.5, 22], [12.5, 28], [20.5, 19], [16.5, 19], [19.5, 14]];
    recolor(G, (x, y) => inPoly(x + 0.5, y + 0.5, P), M.bolt, 0.18);
    recolor(G, (x, y) => y >= 27, M.silver);
    return G;
  };
  B.tube = () => {
    const G = grid();
    for (const x of [10, 14, 17, 21]) cylV(G, x, x + 1, 27, 31, M.silver);
    cylV(G, 7, 24, 22, 27, M.rubber, { r: 1.5 });
    recolor(G, (x, y) => y === 23, M.rubber, 0.25);
    bevel(G, 11, 20, 11, 20, M.steel, { b: 2, base: 0.45 });
    rect(G, 13, 18, 13, 18, M.steel, 0.2);
    cylV(G, 15, 16, 12, 19, M.ember, { add: 0.25 });
    cylH(G, 10, 21, 6, 8, M.silver, { add: 0.15 });
    const glass = (x, y) => {
      const inBody = x >= 7 && x <= 24 && y >= 9 && y <= 21;
      const inDome = Math.hypot((x + 0.5 - 16) / 9, (y + 0.5 - 9.5) / 7.5) <= 1 && y < 10;
      return inBody || inDome;
    };
    each(0, N - 1, 0, N - 1, (x, y) => {
      if (!glass(x, y)) return;
      const i = y * N + x;
      const u = clamp((x + 0.5 - 16) / 9, -0.98, 0.98);
      let lum = lit([u, -0.2, Math.sqrt(1 - u * u)]);
      if (x === 9 || x === 10) lum += 0.5;
      if (G.m[i]) G.tint[i] = 1; else put(G, x, y, M.glass, lum);
    });
    return G;
  };
  B.burnt1 = () => {
    const G = grid();
    bevel(G, 4, 27, 5, 27, M.charcoal, { r: 6, b: 3, base: 0.5, noise: 0.45, seed: 3 });
    line(G, [[9, 9], [13, 14], [12, 19], [17, 23]], M.ash, 0.55);
    line(G, [[21, 8], [19, 13], [24, 18]], M.ash, 0.5);
    line(G, [[13, 14], [18, 13]], M.ash, 0.45);
    for (const [x, y] of [[13, 14], [19, 13], [17, 22], [23, 18], [9, 20]]) { recolor(G, (xx, yy) => Math.abs(xx - x) + Math.abs(yy - y) <= 1, M.ember, 0.42); recolor(G, (xx, yy) => xx === x && yy === y, M.ember, 0.78); }
    return G;
  };
  B.burnt2 = () => {
    const G = grid();
    bevel(G, 2, 29, 2, 29, M.steel, { r: 3, b: 3, base: 0.55 });
    recolor(G, (x, y) => (x >= 4 && x <= 27 && (y === 4 || y === 27)) || (y >= 4 && y <= 27 && (x === 4 || x === 27)), M.steel, -0.25);
    bevel(G, 7, 24, 7, 24, M.charcoal, { r: 3, b: 2, base: 0.42, noise: 0.45, seed: 5 });
    line(G, [[10, 10], [14, 15], [13, 20], [18, 22]], M.ash, 0.5);
    line(G, [[21, 9], [19, 14], [22, 18]], M.ash, 0.45);
    for (const [x, y] of [[14, 15], [19, 14], [17, 21]]) { recolor(G, (xx, yy) => Math.abs(xx - x) + Math.abs(yy - y) <= 1, M.ember, 0.42); recolor(G, (xx, yy) => xx === x && yy === y, M.ember, 0.78); }
    for (const [x, y] of [[5.5, 5.5], [26.5, 5.5], [5.5, 26.5], [26.5, 26.5]]) sphere(G, x, y, 1.8, 1.8, M.steel, { add: 0.15 });
    return G;
  };
  // pads: ocupan la celda, sin contorno
  function padBase(mat) {
    const G = grid();
    bevel(G, 1, 30, 1, 30, mat, { r: 2, b: 2, base: 0.56, grad: 0.12 });
    return G;
  }
  B.pad1 = () => {
    const G = padBase(M.padCu);
    each(0, N - 1, 0, N - 1, (x, y) => { const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 16); if (d < 3.6) put(G, x, y, M.hole, 0.3); else if (d < 6) G.l[y * N + x] += 0.18; });
    return G;
  };
  B.pad2 = () => {
    const G = padBase(M.padCu);
    recolor(G, (x, y) => (x >= 5 && x <= 26 && (y === 5 || y === 26)) || (y >= 5 && y <= 26 && (x === 5 || x === 26)), M.copper, -0.3);
    each(0, N - 1, 0, N - 1, (x, y) => { const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 16); if (d < 3.6) put(G, x, y, M.hole, 0.3); else if (d < 6) G.l[y * N + x] += 0.18; });
    for (const [vx, vy] of [[5.5, 5.5], [26.5, 5.5], [5.5, 26.5], [26.5, 26.5]]) each(1, 30, 1, 30, (x, y) => { const d = Math.hypot(x + 0.5 - vx, y + 0.5 - vy); if (d < 1.4) put(G, x, y, M.hole, 0.3); else if (d < 3.2) put(G, x, y, M.gold, 0.85 - (y + 0.5 - vy) * 0.12); });
    return G;
  };
  B.padDone = () => {
    const G = padBase(M.tin);
    recolor(G, () => true, null, -0.18);
    sphere(G, 16, 16, 7, 7, M.tin, { flat: 0.8 });
    return G;
  };

  // overlays: flechas de rayo y cinta kapton
  function overlay(kind) {
    const out = new Array(N * N).fill(null);
    if (kind === 'lineH' || kind === 'lineV') {
      const pts = new Set();
      for (let y = 0; y < N; y++) for (let x = 0; x < 6; x++) { const half = (5 - x) * 1.1; if (Math.abs(y + 0.5 - 16) <= 5.5 - half * 0.0 && Math.abs(y + 0.5 - 16) <= x + 1) { pts.add(x + ',' + y); pts.add((31 - x) + ',' + y); } }
      const keyOf = (x, y) => kind === 'lineH' ? x + ',' + y : y + ',' + x;
      const set = new Set();
      for (const k of pts) { const [x, y] = k.split(',').map(Number); set.add(keyOf(x, y)); }
      for (const k of set) {
        const [x, y] = k.split(',').map(Number);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && !set.has(nx + ',' + ny)) out[ny * N + nx] = '#0a3a52'; }
      }
      for (const k of set) { const [x, y] = k.split(',').map(Number); const edge = kind === 'lineH' ? (x === 0 || x === 31) : (y === 0 || y === 31); out[y * N + x] = edge ? '#9fe8ff' : '#ffffff'; }
    } else if (kind === 'tape') {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const a = Math.abs(x - y), b = Math.abs(x + y - 31);
        if (a <= 3 || b <= 3) {
          const edge = (a === 3 && b > 3) || (b === 3 && a > 3);
          const stripe = ((x + y) % 4 === 0) ? 0.08 : 0;
          out[y * N + x] = edge ? 'rgba(255,205,130,0.82)' : `rgba(226,140,36,${0.6 + stripe})`;
        }
      }
      for (const [x, y] of [[6, 6], [25, 6], [6, 25], [25, 25], [7, 7], [24, 7], [7, 24], [24, 24]]) out[y * N + x] = 'rgba(255,240,205,0.85)';
    }
    return out;
  }

  const cache = new Map();
  function pixels(name, hue) {
    const key = name + ':' + (hue || 0);
    if (cache.has(key)) return cache.get(key);
    if (!B[name]) return null;
    const G = B[name](hue);
    const px = toPixels(G, { noOutline: name.startsWith('pad') });
    cache.set(key, px);
    return px;
  }
  function draw(px, size, tint) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const s = size / N;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let c = px[y * N + x];
      if (!c) continue;
      const x0 = Math.round(x * s), y0 = Math.round(y * s), w = Math.round((x + 1) * s) - x0, h = Math.round((y + 1) * s) - y0;
      if (typeof c === 'object') { ctx.fillStyle = tint || c.base; ctx.fillRect(x0, y0, w, h); if (!tint) { ctx.fillStyle = 'rgba(170,225,245,0.30)'; ctx.fillRect(x0, y0, w, h); } continue; }
      ctx.fillStyle = tint && !c.startsWith('rgba') ? tint : c;
      ctx.fillRect(x0, y0, w, h);
    }
    return cv;
  }
  return {
    has: name => !!B[name],
    render(name, size, opts) { opts = opts || {}; const px = pixels(name, name === 'battery' ? (opts.hue || 0) : 0); return draw(px, size, opts.tint); },
    overlay(kind, size) { return draw(overlay(kind), size); },
  };
})();

// Estilo activo: '8' o '16'. renderSprite/renderOverlay consultan esto.
const ART = { style: '8' };
const renderSprite8 = renderSprite, renderOverlay8 = renderOverlay;
renderSprite = function (name, size, opts) { return ART.style === '16' && HD.has(name) ? HD.render(name, size, opts) : renderSprite8(name, size, opts); };
renderOverlay = function (kind, size) { return ART.style === '16' ? HD.overlay(kind, size) : renderOverlay8(kind, size); };
