/* Los niveles generados (del 31 en adelante) con el bot persona (codigo/persona.js): no se calibran uno por uno, sino que se ajusta la fórmula
   GEN de codigo/levels.js sobre una muestra, y después se mide cómo quedaron.
   node herramientas/generados.js datos [desde] [hasta] [partidas]  → juega la muestra y guarda dist/generados-datos.json
   node herramientas/generados.js ajustar                           → con esos datos, propone los valores de GEN
   node herramientas/generados.js medir [desde] [hasta] [partidas]   → la tasa de victoria y las estrellas de cada nivel en los tres modos, con la fórmula
   node herramientas/generados.js estrellas                         → con esa medición, propone las estrellas de cada modo (S-28)
   node herramientas/generados.js ver [desde] [hasta]                → qué pide cada nivel, sin jugar
   Ejemplo: node herramientas/generados.js datos 31 90 100 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const P = require('../codigo/persona.js');
const LV = require('../codigo/levels.js');
const { generated, features, medianMoves, calOf, levelAt, resumen, GEN } = LV;
const DATOS = __dirname + '/../dist/generados-datos.json', MEDICION = __dirname + '/../dist/generados-medicion.json';

// una partida del bot persona; moves, time y scoreAt: en qué jugada, segundo y con qué puntos completó el pedido
function play(L, seed) {
  const r = P.partida(L, seed);
  return Object.assign(r, { moves: r.usadas, time: r.segundos, scoreAt: r.pre, score: r.puntos });
}
const q = (arr, p) => { const a = arr.slice().sort((x, y) => x - y); if (!a.length) return NaN; const pos = Math.min(a.length - 1, Math.max(0, p * (a.length - 1))), lo = Math.floor(pos), hi = Math.ceil(pos); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };

// ---- trabajo de cada hilo
function datos(n, partidas) {
  const L = generated(n), out = { n, tune: L.tune, target: L.target, colors: L.colors, f: features(L), resumen: resumen(L) };
  if (L.tune === 'score') {
    const d = levelAt(n); d.goals[0].n = 1e9; d.stars = [1e9, 1e12, 1e12];   // inalcanzable: los puntos de jugar hasta el final, sin bonus
    out.jug = L.time ? null : L.moves; out.time = L.time || null;
    out.scores = []; for (let s = 0; s < partidas; s++) out.scores.push(play(d, 1000 + s).score);
    return out;
  }
  // sin límite a la vista; los contrarreloj siguen contra reloj, porque ahí se piensa más rápido
  const d = Object.assign({}, L, { goals: L.goals.map(o => Object.assign({}, o)) });
  if (L.tune === 'time') { d.time = 900; d.moves = 0; } else { d.moves = 150; delete d.time; }
  out.done = []; out.times = []; out.scoreAt = [];
  for (let s = 0; s < partidas; s++) {
    const r = play(d, 1000 + s);
    out.done.push(r.won ? r.moves : null); out.times.push(r.won ? r.time : null); out.scoreAt.push(r.won ? r.scoreAt : null);
  }
  // con pedido de piezas, también con la ayuda de Normal y Fácil, para ajustar GEN.ayudaPiezas
  if (L.goals.some(o => o.type === 'collect')) {
    out.doneModo = {};
    for (const M of LV.MODES.filter(m => m.ayuda)) {
      const dm = Object.assign({}, d, { ayuda: M.ayuda }), v = [];
      for (let s = 0; s < partidas; s++) { const r = play(dm, 1000 + s); v.push(r.won ? r.moves : null); }
      out.doneModo[M.id] = v;
    }
  }
  return out;
}
// cómo queda un generado en cada modo, con la fórmula: tasa de victoria, estrellas (S-28) y lo que hace falta para
// ajustar las estrellas: de quienes ganan, en qué fracción del límite completaron el pedido (en los cuantiles del reparto
// del modo), y los puntos finales contra la primera meta o contra las jugadas
function medir(n, partidas) {
  const d0 = levelAt(n), M = LV.MODES;
  const res = { n, resumen: resumen(d0), target: d0.target, colors: d0.colors, tune: d0.tune, valvulas: d0.tubes ? d0.tubes.n : 0, knob: d0.tune === 'score' ? d0.goals[0].n : d0.time ? d0.time + ' s' : d0.moves + ' mov', modos: [] };
  for (const m of M) {
    const dm = LV.applyMode(levelAt(n), m), lim = dm.time || dm.moves, h = [0, 0, 0, 0];
    const u = [], fin = [], libre = [];
    for (let s = 0; s < partidas; s++) {
      const r = play(dm, 50000 + s); h[LV.estrellasDe(dm, r)]++;
      if (r.won) { u.push(dm.time ? r.segundos : r.usadas); fin.push(r.puntos); }
    }
    const o = { id: m.id, win: (partidas - h[0]) / partidas, dos: (h[2] + h[3]) / partidas, tres: h[3] / partidas, jug: dm.time ? lim / GEN.segundosPorJugada : lim };
    if (dm.starsBy === 'score') {
      // los puntos de jugar todo, con el bonus de los especiales que quedaron, de quienes pasan la primera meta
      const L = Object.assign({}, dm, { stars: [dm.stars[0], 1e12, 1e12] });
      for (let s = 0; s < partidas; s++) { const r = play(L, 60000 + s); if (r.won) libre.push(r.puntos); }
      o.k = m.reparto.map(f => q(libre, 1 - f) / dm.stars[0]);
    } else {
      o.r = m.reparto.map(f => q(u, f) / lim);
      o.escala = q(fin, 0.9) / o.jug;
    }
    res.modos.push(o);
  }
  return res;
}

if (!isMainThread) {
  const { tarea, ids, partidas } = workerData;
  for (const n of ids) parentPort.postMessage(tarea === 'datos' ? datos(n, partidas) : medir(n, partidas));
  return;
}

const [cmd = 'ver', a = '31', b = '90', c = '100'] = process.argv.slice(2);
const desde = +a, hasta = +b, partidas = +c, ids = [];
for (let n = desde; n <= hasta; n++) ids.push(n);

function enHilos(tarea, cada, fin) {
  const nW = 2, res = []; let listos = 0;
  for (let k = 0; k < nW; k++) {
    const w = new Worker(__filename, { workerData: { tarea, ids: ids.filter((_, j) => j % nW === k), partidas } });
    w.on('message', m => { res.push(m); cada(m); });
    w.on('error', e => { console.error(e); process.exit(1); });
    w.on('exit', () => { if (++listos === nW) fin(res.sort((x, y) => x.n - y.n)); });
  }
}

if (cmd === 'ver') {
  for (const n of ids) { const d = levelAt(n); console.log(`N${n} ${resumen(d).padEnd(28)} meta ${Math.round(d.target * 100)}%  ${d.tune === 'score' ? 'obj ' + d.goals[0].n : d.time ? d.time + ' s' : d.moves + ' mov'}  ${d.colors} colores`); }
} else if (cmd === 'datos') {
  const t0 = Date.now();
  enHilos('datos', m => process.stdout.write('.'), res => { fs.writeFileSync(DATOS, JSON.stringify(res)); console.log(`\n${res.length} niveles en ${((Date.now() - t0) / 1000) | 0} s → ${DATOS}`); });
} else if (cmd === 'ajustar') {
  const D = JSON.parse(fs.readFileSync(DATOS, 'utf8'));
  const jug = D.filter(d => d.done), keys = ['piezas', 'pads', 'golpes', 'cintas', 'valvulas'];
  // nunca: los que el bot no termina ni con 150 jugadas
  for (const d of jug) { const nunca = d.done.filter(v => v === null).length / d.done.length; if (nunca > 0.05) console.log(`N${d.n} ${d.resumen}: no termina en el ${(nunca * 100) | 0} %`); }
  // costos, «juntos» y el factor de colores: descenso por coordenadas sobre el error relativo de la mediana
  const y = jug.map(d => q(d.done.filter(v => v !== null), 0.5));
  const G = JSON.parse(JSON.stringify(GEN));
  const params = [['costo', 'base'], ...keys.map(k => ['costo', k]), ['juntos'], ['seguidas'], ['golpesConValvulas'], ['colores', '7']];
  const get = p => p.length === 1 ? G[p[0]] : G[p[0]][p[1]], set = (p, v) => { if (p.length === 1) G[p[0]] = v; else G[p[0]][p[1]] = v; };
  const pred = d => medianMoves({ colors: d.colors }, G, d.f);
  const loss = () => jug.reduce((s, d, i) => s + Math.log(pred(d) / y[i]) ** 2, 0);
  for (let it = 0; it < 80; it++) for (const p of params) {
    let best = loss(), v = get(p);
    for (const f of [1.3, 1.1, 1.03, 1 / 1.03, 1 / 1.1, 1 / 1.3]) { set(p, v * f); const l = loss(); if (l < best) { best = l; v = v * f; } }
    set(p, v);
  }
  if (!jug.some(d => d.colors === 5)) G.colores['5'] = 1;
  const r = x => +x.toFixed(3);
  console.log('costo:', JSON.stringify(Object.fromEntries(Object.entries(G.costo).map(([k, v]) => [k, r(v)]))), 'juntos:', r(G.juntos), 'seguidas:', r(G.seguidas), 'golpesConValvulas:', r(G.golpesConValvulas), 'colores:', JSON.stringify({ 5: r(G.colores[5]), 6: 1, 7: r(G.colores[7]) }));
  const err = jug.map((d, i) => Math.abs(pred(d) - y[i]) / y[i]);
  console.log(`error mediano ${(q(err, 0.5) * 100).toFixed(0)} %, el peor ${(Math.max(...err) * 100).toFixed(0)} %`);
  // razón: cuántas veces la mediana hace falta para cada tasa
  const razon = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98].map(t => [t, +q(jug.map(d => { const f = d.done.map(v => v === null ? 1e9 : v); return q(f, t) / q(f, 0.5); }), 0.5).toFixed(3)]);
  console.log('razon:', JSON.stringify(razon));
  // la ayuda de piezas de cada modo: el factor sobre costo.piezas que mejor explica las medianas con esa ayuda
  const ayuda = { dificil: 1 };
  for (const M of LV.MODES.filter(m => m.ayuda)) {
    const conj = jug.filter(d => d.doneModo);
    const err = a => conj.reduce((acc, d) => { const v = d.doneModo[M.id].filter(x => x !== null); return acc + Math.log(medianMoves({ colors: d.colors }, G, d.f, a) / q(v, 0.5)) ** 2; }, 0);
    let best = 1, be = err(1);
    for (let a = 0.4; a <= 1.0001; a += 0.01) { const e = err(a); if (e < be) { be = e; best = a; } }
    ayuda[M.id] = +best.toFixed(2);
  }
  console.log('ayudaPiezas:', JSON.stringify(ayuda));
  const spj = q(jug.filter(d => d.tune === 'time').flatMap(d => d.done.map((v, i) => v ? d.times[i] / v : null).filter(Boolean)), 0.5);
  console.log('segundosPorJugada:', spj.toFixed(2));
  const ppm = q(jug.flatMap(d => d.done.map((v, i) => v ? d.scoreAt[i] / v : null).filter(Boolean)), 0.5);
  console.log('puntosPorMovimientoGanado (al terminar, sin bonus):', ppm | 0);
  const sc = D.filter(d => d.scores);
  if (sc.length) {
    for (const cc of [5, 6, 7]) { const v = sc.filter(d => d.colors === cc).map(d => q(d.scores, 0.5) / (d.jug || d.time / spj)); if (v.length) console.log(`puntosPorJugada con ${cc} colores:`, q(v, 0.5) | 0, `(${v.length} niveles)`); }
    const rp = [0.3, 0.5, 0.7, 0.9, 0.95, 0.98].map(t => [t, +q(sc.map(d => q(d.scores, 1 - t) / q(d.scores, 0.5)), 0.5).toFixed(3)]);
    console.log('razonPuntos:', JSON.stringify(rp));
  }
} else if (cmd === 'estrellas') {
  // con la última medición, las estrellas de S-28 en cada modo: en los de pedido, la fracción del límite para dos y tres
  // estrellas como a + b × tasa buscada (mínimos cuadrados); en los de puntos, la segunda y la tercera meta como múltiplos
  // de la primera; y el fondo de escala del vúmetro por jugada, según los colores
  const R = JSON.parse(fs.readFileSync(MEDICION, 'utf8')), r3d = v => +v.toFixed(3);
  const recta = pts => { const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const b = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0); return [r3d(my - b * mx), r3d(b)]; };
  const umbrales = {}, metas = {};
  LV.MODES.forEach((m, k) => {
    const pe = R.filter(r => r.tune !== 'score' && r.modos[k].r && r.modos[k].r.every(Number.isFinite));
    umbrales[m.id] = [0, 1].map(j => recta(pe.map(r => [r.target, r.modos[k].r[j]])));
    const sc = R.filter(r => r.tune === 'score' && r.modos[k].k && r.modos[k].k.every(Number.isFinite));
    if (sc.length) metas[m.id] = [0, 1].map(j => +q(sc.map(r => r.modos[k].k[j]), 0.5).toFixed(2));
  });
  const escala = {};
  for (const cc of [5, 6, 7]) { const v = R.filter(r => r.tune !== 'score' && r.colors === cc).flatMap(r => r.modos.map(m => m.escala)).filter(Number.isFinite); if (v.length) escala[cc] = Math.round(q(v, 0.5) / 10) * 10; }
  console.log('umbrales:', JSON.stringify(umbrales));
  console.log('metas:', JSON.stringify(metas));
  console.log('escalaPorJugada:', JSON.stringify(escala));
} else if (cmd === 'medir') {
  const t0 = Date.now();
  enHilos('medir', () => process.stdout.write('.'), res => {
    console.log('');
    const pc = v => String(Math.round(v * 100)).padStart(3) + '%';
    for (const r of res) console.log(`N${r.n} ${r.resumen.padEnd(28)} ${String(r.knob).padEnd(8)} meta ${pc(r.target)}  ` + r.modos.map(m => `${m.id} ${pc(m.win)} ≥2 ${pc(m.dos)} 3 ${pc(m.tres)}`).join('  '));
    const dif = res.map(r => r.modos[2].win - r.target), prom = (k, f) => pc(res.reduce((s, r) => s + r.modos[k][f], 0) / res.length);
    console.log(`Difícil: desvío mediano ${(q(dif.map(Math.abs), 0.5) * 100).toFixed(0)} puntos, sesgo ${(q(dif, 0.5) * 100).toFixed(0)}; ` + LV.MODES.map((m, k) => `${m.name} gana ${prom(k, 'win')}, ≥2★ ${prom(k, 'dos')}, 3★ ${prom(k, 'tres')}`).join(' · ') + ` · ${((Date.now() - t0) / 1000) | 0} s`);
    fs.writeFileSync(MEDICION, JSON.stringify(res));
  });
}
