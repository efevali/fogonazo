/* Mide los modos de dificultad con el bot persona (codigo/persona.js): para cada nivel y cada modo,
   cuántas partidas gana, cuántas llegan a dos estrellas y cuántas a tres, con las estrellas de S-28 (calibrar.js).
   Con semillas distintas de las de la calibración, así sirve de control.
   node herramientas/modos.js [partidas] [niveles]    Ejemplo: node herramientas/modos.js 150 1,2,3 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { partidaCalibrar: partida } = require('../codigo/persona.js');
const { LEVELS, MODES, applyMode, estrellasDe, levelAt, resumen } = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');

const def = (id, M) => applyMode(levelAt(id, CAL), M);   // el nivel como se juega en un modo
const play = (L, seed) => estrellasDe(L, partida(L, seed));   // devuelve las estrellas (0 a 3), como la partida

if (isMainThread) {
  const n = +process.argv[2] || 150;
  const ids = process.argv[3] ? process.argv[3].split(',').map(Number) : LEVELS.map((_, i) => i + 1);
  const nW = Math.min(ids.length, require('os').cpus().length), res = {};
  let done = 0;
  for (let k = 0; k < nW; k++) {
    const w = new Worker(__filename, { workerData: { ids: ids.filter((_, j) => j % nW === k), n } });
    w.on('message', m => { res[m.id] = m.r; });
    w.on('exit', () => {
      if (++done < nW) return;
      const pc = v => (v * 100).toFixed(0).padStart(4) + '%';
      console.log('Nivel'.padEnd(28) + MODES.map(M => M.name.padEnd(22)).join(''));
      console.log(' '.repeat(28) + MODES.map(() => 'gana  ≥2★   3★'.padEnd(22)).join(''));
      const tot = MODES.map(() => [0, 0, 0, 0]);
      for (const id of ids) {
        console.log(`L${String(id).padStart(2)} ${resumen(LEVELS[id - 1]).padEnd(24)}` + MODES.map((M, k) => {
          const h = res[id][M.id], t = n;
          const r = [(h[1] + h[2] + h[3]) / t, (h[2] + h[3]) / t, h[3] / t];
          tot[k][0] += r[0]; tot[k][1] += r[1]; tot[k][2] += r[2]; tot[k][3] += (h[1] + 2 * h[2] + 3 * h[3]) / t;
          return `${pc(r[0])}${pc(r[1])}${pc(r[2])}`.padEnd(22);
        }).join(''));
      }
      const L = ids.length;
      console.log('Promedio'.padEnd(28) + tot.map(t => `${pc(t[0] / L)}${pc(t[1] / L)}${pc(t[2] / L)}`.padEnd(22)).join(''));
      console.log('Estrellas esperadas (de ' + L * 3 + ')'.padEnd(5) + ' ' + tot.map((t, k) => `${MODES[k].name} ${t[3].toFixed(0)}`).join(' · '));
    });
  }
} else {
  for (const id of workerData.ids) {
    const r = {};
    for (const M of MODES) {
      const L = def(id, M), h = [0, 0, 0, 0];
      for (let s = 0; s < workerData.n; s++) h[play(L, 70000 + s)]++;
      r[M.id] = h;
    }
    parentPort.postMessage({ id, r });
  }
}
