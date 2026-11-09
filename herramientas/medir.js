// Tasa de victoria del bot persona con los movimientos y tiempos calibrados actuales.
// Sirve para ver cuánto cambia un nivel después de tocar reglas.
// node herramientas/medir.js 16,17,18 [partidas]
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { partida } = require('../codigo/persona.js');
const { LEVELS, resumen, levelAt } = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');
const def = id => levelAt(id, CAL);   // Difícil, como se juega
const play = (L, seed) => partida(L, seed).won;
if (isMainThread) {
  const ids = process.argv[2].split(',').map(Number), n = +process.argv[3] || 300;
  const nW = Math.min(ids.length, require('os').cpus().length), res = {}; let done = 0;
  for (let k = 0; k < nW; k++) {
    const w = new Worker(__filename, { workerData: { ids: ids.filter((_, j) => j % nW === k), n } });
    w.on('message', m => { res[m.id] = m.r; });
    w.on('exit', () => { if (++done === nW) for (const id of ids) console.log(`L${String(id).padStart(2)} ${resumen(LEVELS[id - 1]).padEnd(22)} ${(CAL[id].moves ? CAL[id].moves + ' mov' : CAL[id].time + ' s').padEnd(7)} gana ${(res[id] * 100).toFixed(0).padStart(3)}%   (calibrado: ${(CAL[id].winRate * 100).toFixed(0)}%)`); });
  }
} else {
  for (const id of workerData.ids) { const L = def(id); let w = 0; for (let s = 0; s < workerData.n; s++) if (play(L, 90000 + s)) w++; parentPort.postMessage({ id, r: w / workerData.n }); }
}
