/* Lee un registro de partidas exportado desde la sala (cinco toques en la lámpara de arco; ver comun/registro.js) y
   resume lo jugado. En Fogonazo, además, vuelve a jugar cada partida en el motor con su semilla y sus movidas y verifica
   que dé lo mismo que en el teléfono: es la base para comparar los bots con personas.

   node herramientas/registro.js registro-2026-11-10-2130.json [registro-otro.json…]

   Las partidas se reproducen con la calibración actual (codigo/calibrated.json): si en el teléfono se jugaron con otra
   (otra versión), se avisa y no se verifican. */
const fs = require('fs');
const E = require('../codigo/engine.js');
const { MODES, ZEN, applyMode, levelAt } = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');

// la partida tal como la arma fogonazo/partida.html (open)
function armar(p) {
  if (p.modo === 'zen') {
    const d = Object.assign({}, ZEN, { n: 0, goals: ZEN.goals.map(o => Object.assign({}, o)) });
    d.stars = [0, 1, 1];
    const g = E.createGame(d, p.semilla), o = g.goals[0], R = d.order;
    o.color = (g.rng() * d.colors) | 0;
    o.need = R.min + R.step * ((g.rng() * ((R.max - R.min) / R.step + 1)) | 0);
    return { d, g };
  }
  const M = MODES.find(m => m.id === p.modo);
  const d = applyMode(levelAt(p.nivel, CAL), M);
  return { d, g: E.createGame(d, p.semilla) };
}
const igualDef = (d, r) => (d.moves || 0) === r.movidas && (d.time || 0) === r.tiempo && JSON.stringify(d.stars) === JSON.stringify(r.estrellas);

// vuelve a jugar las movidas; devuelve lo que daría la partida (antes del bonus final)
function reproducir(p) {
  const { d, g } = armar(p);
  if (p.modo !== 'zen' && !igualDef(d, p.def)) return { otraCalibracion: true };
  let usadas = null;
  for (const [a, b] of p.movidas) {
    const r = E.trySwap(g, a, b);
    if (r.blocked || !r.valid) continue;
    if (g.mode === 'zen') { E.zenOrder(g); continue; }
    E.evaluateEnd(g);
    if (g.won && usadas === null) usadas = g.movesUsed;
    if (g.over) break;
  }
  return { puntos: g.score, usadas, over: g.over, won: g.won };
}

const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
const mediana = v => { if (!v.length) return null; const s = v.slice().sort((x, y) => x - y); return s[s.length >> 1]; };

const archivos = process.argv.slice(2);
if (!archivos.length) { console.log('Uso: node herramientas/registro.js registro.json [otro.json…]'); process.exit(1); }
const todo = { fogonazo: [], mahjong: [], buenojo: [], app: [] };
for (const f of archivos) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`${f}: versión ${j.version || '?'}, exportado ${j.exportado}`);
  for (const k in todo) todo[k].push(...(j.registro[k] || []));
}

// ---------- Fogonazo
const F = todo.fogonazo;
console.log(`\nFOGONAZO · ${F.length} partidas`);
let ok = 0, mal = 0, otra = 0;
for (const p of F) {
  if (!p.movidas || p.semilla == null) continue;
  const r = reproducir(p);
  if (r.otraCalibracion) { otra++; continue; }
  // lo que se puede comparar: los puntos antes del bonus y en qué movida se completó el pedido
  const esperado = p.modo === 'zen' ? p.puntos : p.resultado === 'gano' || p.resultado === 'perdio' ? p.puntosJugada : null;
  const bien = (esperado == null || esperado === r.puntos) && (p.resultado !== 'gano' || p.usadas == null || p.usadas === r.usadas || p.def.por === 'score');
  if (bien) ok++; else { mal++; if (mal <= 5) console.log('  no coincide:', JSON.stringify({ nivel: p.nivel, modo: p.modo, semilla: p.semilla, esperado, obtenido: r.puntos, usadas: [p.usadas, r.usadas] })); }
}
console.log(`  Reproducidas: ${ok} coinciden, ${mal} no coinciden, ${otra} con otra calibración`);
const grupos = new Map();
for (const p of F) {
  if (p.modo === 'zen') continue;
  const k = `${String(p.nivel).padStart(3)} ${p.modo}`;
  if (!grupos.has(k)) grupos.set(k, []);
  grupos.get(k).push(p);
}
console.log('  Nivel modo      partidas gana  abandona  ★ (1/2/3)   movidas al completar (mediana)  piensa (mediana, s)');
for (const [k, ps] of [...grupos].sort()) {
  const gan = ps.filter(p => p.resultado === 'gano'), ab = ps.filter(p => p.resultado === 'abandono' || p.resultado === 'interrumpida');
  const est = [1, 2, 3].map(n => gan.filter(p => p.estrellas === n).length).join('/');
  const ms = ps.flatMap(p => (p.movidas || []).map(m => m[2]));
  console.log(`  ${k.padEnd(14)} ${String(ps.length).padStart(4)}  ${pct(gan.length, ps.length).padStart(5)}  ${pct(ab.length, ps.length).padStart(7)}   ${est.padEnd(10)}  ${String(mediana(gan.map(p => p.usadas).filter(u => u != null)) ?? '—').padStart(6)}                          ${ms.length ? (mediana(ms) / 1000).toFixed(1) : '—'}`);
}
const zen = F.filter(p => p.modo === 'zen');
if (zen.length) console.log(`  Zen: ${zen.length} partidas, mediana ${mediana(zen.map(p => p.puntos))} puntos`);

// ---------- Mahjong
const MJ = todo.mahjong;
console.log(`\nMAHJONG · ${MJ.length} repartos`);
const porTab = new Map();
for (const p of MJ) { if (!porTab.has(p.tablero)) porTab.set(p.tablero, []); porTab.get(p.tablero).push(p); }
for (const [t, ps] of porTab) {
  const l = ps.filter(p => p.resultado === 'limpio');
  console.log(`  ${t.padEnd(14)} ${ps.length} repartos, ${l.length} limpios, tiempo mediano ${mediana(l.map(p => p.segundos)) ?? '—'} s, barajadas solas ${ps.reduce((a, p) => a + p.barajadasSolas, 0)}, a mano ${ps.reduce((a, p) => a + p.barajadas, 0)}, pistas ${ps.reduce((a, p) => a + p.pistas, 0)}`);
}

// ---------- Buen ojo
const BO = todo.buenojo, BP = BO.filter(p => p.ev === 'partida');
console.log(`\nBUEN OJO · ${BP.length} partidas, ${BO.length - BP.length} colores de práctica`);
for (const dif of [...new Set(BP.map(p => p.dificultad))]) {
  const ps = BP.filter(p => p.dificultad === dif && p.resultado === 'terminada'), cs = ps.flatMap(p => p.colores);
  const dh = cs.map(c => Math.abs(((c.tuyo.h - c.objetivo.h + 540) % 360) - 180)), ds = cs.map(c => Math.abs(c.tuyo.s - c.objetivo.s)), dv = cs.map(c => Math.abs(c.tuyo.v - c.objetivo.v));
  console.log(`  ${dif.padEnd(8)} ${ps.length} terminadas, total mediano ${mediana(ps.map(p => p.total)) ?? '—'}, ΔE mediano ${mediana(cs.map(c => c.dE)) ?? '—'} · desvío mediano: tono ${mediana(dh) == null ? "—" : Math.round(mediana(dh))}°, saturación ${mediana(ds) ?? '—'}, brillo ${mediana(dv) ?? '—'}`);
}

// ---------- La app
const A = todo.app, entradas = {};
for (const e of A) if (e.ev === 'pantalla' || e.ev === 'inicio') { const j = e.url.split('/')[0]; entradas[j] = (entradas[j] || 0) + 1; }
console.log(`\nAPP · ${A.filter(e => e.ev === 'inicio').length} aperturas · pantallas: ${Object.entries(entradas).map(([k, v]) => `${k} ${v}`).join(', ')}`);
