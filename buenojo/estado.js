// El avance de Buen ojo: el récord de cada dificultad (el mejor total de una partida, de 0 a 50) y la dificultad
// elegida. Vive solo en este Chrome. Los volúmenes son los de la colección (comun/sonido.js).
window.Estado = (() => {
  'use strict';
  const KEY = 'coleccion.buenojo';
  const DIFICULTADES = { facil: { nombre: 'Fácil', segundos: 5 }, normal: { nombre: 'Normal', segundos: 3 }, dificil: { nombre: 'Difícil', segundos: 1.5 } };
  const blank = () => ({ dificultad: 'normal', records: {} });
  let st = blank();
  try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw && raw.records) st = Object.assign(blank(), raw); } catch (e) {}
  if (!DIFICULTADES[st.dificultad]) st.dificultad = 'normal';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  return {
    DIFICULTADES,
    get dificultad() { return st.dificultad; },
    set dificultad(d) { if (DIFICULTADES[d]) { st.dificultad = d; save(); } },
    record: d => st.records[d] || 0,
    // una partida terminada: devuelve si es récord y cuál era el anterior
    terminada(d, total) {
      const antes = st.records[d] || 0, record = total > antes;
      if (record) { st.records[d] = total; save(); }
      return { record, antes };
    },
  };
})();
