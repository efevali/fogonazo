// Fogonazo's progress: the difficulty, the stars and the best score of each level in each difficulty, and the zen
// records. Kept in this browser only. The volumes are the collection's (comun/sonido.js).
window.Estado = (() => {
  'use strict';
  const KEY = 'coleccion.fogonazo';
  const MODES = ['Fácil', 'Normal', 'Difícil'];   // the same order as the engine's modes (codigo/levels.js)
  const ULTIMO = 30;                                // the last level made by hand; from 31 on they are generated, without end
  // v: the star system. With S-28 (stars with the thresholds in sight, 0.12.0) the levels' progress starts from zero in
  // every difficulty; the same with the recalibration of 0.17.0 (v3, the persona bot: other moves and thresholds). The
  // chosen difficulty, the knob and the zen records stay
  const V = 3;
  const blank = () => ({ v: V, modo: 1, vista: 0, niveles: [{}, {}, {}], puntos: [{}, {}, {}], zen: { puntos: 0, tiempo: 0 } });
  let st = blank();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && raw.niveles) {   // the mockup's saves had only modo and niveles
      st = Object.assign(blank(), raw);
      if (raw.v !== V) { st.v = V; st.niveles = [{}, {}, {}]; st.puntos = [{}, {}, {}]; }
    }
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  // each mode is its own path: the next level is the first one not passed in it, counting from 1
  const nextIn = modo => { const m = st.niveles[modo]; let n = 1; while (m[n] > 0) n++; return n; };

  return {
    MODES, ULTIMO,
    get modo() { return st.modo; }, set modo(v) { st.modo = v; save(); },
    // the instrument's «Modo» knob (Niveles, Zen, Récords): it stays where it was left
    get vista() { return st.vista || 0; }, set vista(v) { st.vista = v; save(); },
    stars: (n, modo = st.modo) => st.niveles[modo][n] || 0,
    total: (modo = st.modo) => Object.values(st.niveles[modo]).reduce((a, b) => a + b, 0),
    // the highest level passed in a row from the first one (the record), the next one to play, the ones open
    maxLevel: (modo = st.modo) => nextIn(modo) - 1,
    next: (modo = st.modo) => nextIn(modo),
    open: (n, modo = st.modo) => n >= 1 && n <= nextIn(modo),
    puntos: (n, modo = st.modo) => st.puntos[modo][n] || 0,
    // stars and score of a finished level in the current mode; returns the best score it had before
    record(n, stars, score) {
      const m = st.niveles[st.modo], p = st.puntos[st.modo], prev = p[n] || 0;
      if (stars > (m[n] || 0)) m[n] = stars;
      if (stars > 0 && score > prev) p[n] = score;
      save();
      return prev;
    },
    // zen records: the best score and the longest match, saved while playing so they survive closing the app
    get zen() { return Object.assign({}, st.zen); },
    zenRecord(puntos, tiempo) {
      const z = st.zen;
      if (puntos <= z.puntos && tiempo <= z.tiempo) return;
      z.puntos = Math.max(z.puntos, puntos); z.tiempo = Math.max(z.tiempo, tiempo); save();
    },
  };
})();
