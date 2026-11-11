// El avance de Biblioteca: la dificultad elegida y el récord de cada una (primero las movidas; ante un empate, el
// tiempo). Vive solo en este Chrome. Los volúmenes son los de la colección (comun/sonido.js).
window.Estado = (() => {
  'use strict';
  const KEY = 'coleccion.biblioteca';
  const blank = () => ({ dificultad: 'normal', records: {} });
  let st = blank();
  try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw && raw.records) st = Object.assign(blank(), raw); } catch (e) {}
  const DIFS = ['facil', 'normal', 'dificil'];
  if (!DIFS.includes(st.dificultad)) st.dificultad = 'normal';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  // el tiempo, en minutos y segundos (02:41)
  const reloj = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  return {
    reloj,
    get dificultad() { return st.dificultad; },
    set dificultad(d) { if (DIFS.includes(d)) { st.dificultad = d; save(); } },
    // { movidas, tiempo } o null
    record: d => st.records[d] || null,
    // una biblioteca ordenada: devuelve si es récord y cuál era el anterior
    terminada(d, movidas, tiempo) {
      const antes = st.records[d] || null;
      const record = !antes || movidas < antes.movidas || (movidas === antes.movidas && tiempo < antes.tiempo);
      if (record) { st.records[d] = { movidas, tiempo }; save(); }
      return { record, antes };
    },
  };
})();
