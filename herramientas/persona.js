/* El bot persona (codigo/persona.js): ajuste con el registro de partidas y comparación con el bot de siempre.

   node herramientas/persona.js ajustar registro.json [otro.json…]
     Arma, para cada movida real de Fogonazo, las jugadas que había y la que se eligió, ajusta los pesos del modelo
     (logit condicional, con validación cruzada por partida) y los guarda en codigo/persona.json, junto con los tiempos
     de pensar medidos en los niveles contrarreloj.

   node herramientas/persona.js comparar [partidas] registro.json [otro.json…]
     Para cada nivel y modo jugado en el registro, simula al bot de siempre y al bot persona (150 partidas cada uno,
     o las que se pidan) y compara victorias y estrellas con las reales: por modo, por tramo de niveles y por qué tan
     difícil ve el nivel el bot de siempre. Al final, la verosimilitud de los resultados reales con cada bot.
     Con TEMPLE=2 (por ejemplo) prueba otra temperatura de decisión sin tocar codigo/persona.json.

   El modelo usa solo lo que una persona ve en el tablero: lo que pasa en el primer golpe, qué tan cerca cae de lo que
   falta, qué tan abajo está la jugada y los especiales. Sin cascadas ni la evaluación completa del bot de siempre. */
const fs = require('fs'), path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const E = require('../codigo/engine.js');
const L = require('../codigo/levels.js');
const CAL = require('../codigo/calibrated.json');
const P = require('../codigo/persona.js');
const ARCHIVO = path.join(__dirname, '../codigo/persona.json');
const VISIBLES = ['meta1', 'piezas1', 'especial1', 'usaEsp', 'combo', 'cerca', 'puntos1', 'abajo', 'valvula', 'bajaValvula']
  .concat(process.env.CON_BOT ? ['valorBot'] : []);   // CON_BOT=1: suma la evaluación completa del bot de siempre como rasgo
const L2 = 0.5;
// la temperatura de decisión: con los pesos ajustados a las jugadas, el bot elige con demasiado azar (sus jugadas
// «no óptimas» son peores que las de una persona, que tienen un valor que el modelo no ve); se multiplica por este
// número, ajustado para que las victorias y estrellas simuladas se parezcan a las reales (ver «comparar»)
const TEMPLE = +process.env.TEMPLE || 2;

const defDe = (id, modo) => L.applyMode(L.levelAt(id, CAL), L.MODES.find(m => m.id === modo));
const leer = fs_ => fs_.flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).registro.fogonazo).filter(p => p.modo !== 'zen' && p.movidas && p.movidas.length);

// ---------------------------------------------------------------- simular una partida
// el bot de siempre (62 % la mejor) o el persona; el reloj suma lo que se piensa y las animaciones, como en la partida
function jugar(d, seed, quien, M) {
  const g = E.createGame(d, seed), rnd = E.rngFrom(seed * 2654435761 >>> 0);
  let time = 0, usadas = null, segundos = null;
  while (!g.over) {
    let m, t;
    if (quien === 'bot') { m = E.botChoose(g, rnd, { best: 0.62, second: 0.2 }); t = 1.7 + rnd() * 1.4; }
    else {
      // lo que piensa, medido en las partidas reales; si pasa de lo que tarda la pista, la ve y a veces la sigue
      t = piensa(rnd, g.mode === 'time' ? M.piensa : M.piensaMovidas);
      m = t > (d.n >= 1 && d.n <= 3 ? 5 : 8) && rnd() < M.siguePista ? E.rankMoves(g, null)[0] : null;
      if (!m) m = P.elegir(g, rnd, M.pesos, M.temple);
    }
    if (!m) break;
    const r = E.trySwap(g, m.a, m.b);
    time += t;
    for (const s of r.steps) time += E.stepDuration(s) / 1000;
    if (g.mode === 'time') { g.timeLeft = d.time - time; E.evaluateEnd(g, time >= d.time); } else E.evaluateEnd(g);
    if (g.won && usadas === null) { usadas = g.movesUsed; segundos = time; }
  }
  if (g.won) E.bonus(g);
  return L.estrellasDe(d, { won: g.won, usadas, segundos, puntos: g.score });
}
// el tiempo de pensar: un valor al azar de la distribución medida (cuantiles, interpolados)
function piensa(rnd, q) {
  const x = rnd() * (q.length - 1), k = Math.floor(x);
  return (q[k] + (q[Math.min(k + 1, q.length - 1)] - q[k]) * (x - k)) / 1000;
}

// ---------------------------------------------------------------- ajuste
function decisiones(partidas) {
  const out = [];
  partidas.forEach((p, pi) => {
    const g = E.createGame(defDe(p.nivel, p.modo), p.semilla);
    for (const [a, b, , f] of p.movidas) {
      if (!(f & 1)) {
        const ops = P.opciones(g, !process.env.CON_BOT);
        const k = ops.findIndex(o => (o.a === a && o.b === b) || (o.a === b && o.b === a));
        if (k >= 0 && ops.length > 1) out.push({ pi, k, F: ops.map(o => VISIBLES.map(r => o.f[r])) });
      }
      const r = E.trySwap(g, a, b);
      if (!r.valid) continue;
      E.evaluateEnd(g);
      if (g.over) break;
    }
  });
  return out;
}
function verosimilitud(w, data) {
  let ll = 0, t1 = 0;
  for (const d of data) {
    const s = d.F.map(f => f.reduce((a, v, k) => a + v * w[k], 0)), m = Math.max(...s);
    ll += s[d.k] - m - Math.log(s.reduce((a, v) => a + Math.exp(v - m), 0));
    if (s.indexOf(m) === d.k) t1++;
  }
  return { ll: ll / data.length, t1: t1 / data.length };
}
function resolver(A, b) {
  const n = b.length; A = A.map((r, i) => r.concat([b[i]]));
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = 0; r < n; r++) { if (r === i) continue; const f = A[r][i] / A[i][i]; for (let c = i; c <= n; c++) A[r][c] -= f * A[i][c]; }
  }
  return A.map((r, i) => r[n] / r[i]);
}
// logit condicional por Newton amortiguado, con una penalización chica para que los pesos no se disparen
function ajustar(data) {
  const K = VISIBLES.length; let w = new Array(K).fill(0);
  const obj = ww => verosimilitud(ww, data).ll * data.length - 0.5 * L2 * ww.reduce((a, v) => a + v * v, 0);
  for (let it = 0; it < 60; it++) {
    const gr = new Array(K).fill(0), H = [...Array(K)].map(() => new Array(K).fill(0));
    for (const d of data) {
      const s = d.F.map(f => f.reduce((a, v, k) => a + v * w[k], 0)), m = Math.max(...s);
      const e = s.map(v => Math.exp(v - m)), Z = e.reduce((a, b) => a + b, 0), p = e.map(v => v / Z);
      const mu = new Array(K).fill(0); d.F.forEach((f, i) => f.forEach((v, k) => { mu[k] += p[i] * v; }));
      for (let k = 0; k < K; k++) gr[k] += d.F[d.k][k] - mu[k];
      d.F.forEach((f, i) => { for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) H[a][b] -= p[i] * (f[a] - mu[a]) * (f[b] - mu[b]); });
    }
    for (let k = 0; k < K; k++) { gr[k] -= L2 * w[k]; H[k][k] -= L2; }
    const paso = resolver(H.map(r => r.map(v => -v)), gr), o0 = obj(w);
    let t = 1, nw = w;
    for (let h = 0; h < 30; h++) { nw = w.map((v, k) => v + t * paso[k]); if (obj(nw) >= o0 - 1e-9) break; t /= 2; }
    const mx = Math.max(...nw.map((v, k) => Math.abs(v - w[k]))); w = nw;
    if (mx < 1e-6) break;
  }
  return w;
}

function cmdAjustar(archivos) {
  const partidas = leer(archivos), data = decisiones(partidas);
  const azar = data.reduce((a, d) => a - Math.log(d.F.length), 0) / data.length;
  const par = data.filter(d => d.pi % 2 === 0), impar = data.filter(d => d.pi % 2 === 1);
  const a = verosimilitud(ajustar(par), impar), b = verosimilitud(ajustar(impar), par);
  const w = ajustar(data);
  // el bot de siempre, para comparar: solo su evaluación, con su mejor temperatura
  const vb = P.RASGOS.indexOf('valorBot');
  const dataBot = []; partidas.forEach((p, pi) => {
    const g = E.createGame(defDe(p.nivel, p.modo), p.semilla);
    for (const [x, y, , f] of p.movidas) {
      if (!(f & 1)) { const ops = P.opciones(g, false); const k = ops.findIndex(o => (o.a === x && o.b === y) || (o.a === y && o.b === x)); if (k >= 0 && ops.length > 1) dataBot.push({ pi, k, F: ops.map(o => [o.f.valorBot]) }); }
      const r = E.trySwap(g, x, y); if (!r.valid) continue; E.evaluateEnd(g); if (g.over) break;
    }
  });
  let mejor = { ll: -1e9 };
  for (let t = 0.1; t <= 3; t += 0.1) { const v = verosimilitud([t], dataBot); if (v.ll > mejor.ll) mejor = Object.assign(v, { t }); }
  // los tiempos de pensar, contra reloj y con movidas, en 21 cuantiles
  const cuantiles = ps => { const ms = ps.flatMap(p => p.movidas.map(m => m[2])).sort((x, y) => x - y); return [...Array(21)].map((_, i) => ms[Math.round(i / 20 * (ms.length - 1))]); };
  const q = cuantiles(partidas.filter(p => p.def.tiempo)), qm = cuantiles(partidas.filter(p => !p.def.tiempo));
  // la pista: aparece tras 8 s sin jugar (5 s en los niveles 1 a 3) y muestra la mejor jugada del bot de siempre;
  // se reconstruye con el tiempo de pensar (hasta la 0.16.0 el registro no la marcaba bien)
  let vista = 0, seguida = 0;
  for (const p of partidas) {
    const g = E.createGame(defDe(p.nivel, p.modo), p.semilla), demora = p.nivel <= 3 ? 5000 : 8000;
    for (const [x, y, ms, f] of p.movidas) {
      if (!(f & 1) && (ms > demora || f & 2)) { vista++; const b = E.rankMoves(g, null)[0]; if (b && ((b.a === x && b.b === y) || (b.a === y && b.b === x))) seguida++; }
      const r = E.trySwap(g, x, y); if (!r.valid) continue; E.evaluateEnd(g); if (g.over) break;
    }
  }
  const out = {
    ajustado: new Date().toISOString().slice(0, 10), partidas: partidas.length, decisiones: data.length,
    validacion: { ll: +((a.ll + b.ll) / 2).toFixed(3), acierta: +((a.t1 + b.t1) / 2).toFixed(3), azar: +azar.toFixed(3), botDeSiempre: { ll: +mejor.ll.toFixed(3), acierta: +mejor.t1.toFixed(3) } },
    pesos: Object.fromEntries(VISIBLES.map((k, i) => [k, +w[i].toFixed(3)])),
    temple: TEMPLE,
    piensa: q, piensaMovidas: qm,
    siguePista: vista ? +(seguida / vista).toFixed(2) : 0,
  };
  fs.writeFileSync(ARCHIVO, JSON.stringify(out, null, 1) + '\n');
  console.log(`${partidas.length} partidas, ${data.length} decisiones (${(data.reduce((s, d) => s + d.F.length, 0) / data.length).toFixed(1)} opciones cada una)`);
  console.log(`Validación cruzada: verosimilitud ${out.validacion.ll} por decisión (azar ${out.validacion.azar}, bot de siempre ${out.validacion.botDeSiempre.ll}); acierta la jugada ${Math.round(out.validacion.acierta * 100)} % (bot de siempre ${Math.round(mejor.t1 * 100)} %)`);
  console.log('Pesos: ' + VISIBLES.map((k, i) => `${k} ${w[i].toFixed(2)}`).join(', '));
  console.log(`Piensa: mediana ${(q[10] / 1000).toFixed(2)} s contra reloj, ${(qm[10] / 1000).toFixed(2)} s con movidas · pista vista ${vista} veces, seguida ${seguida}`);
  console.log(`Temperatura de decisión: ${TEMPLE} (se ajusta contra los resultados con «comparar» y TEMPLE=…) · guardado en codigo/persona.json`);
}

// ---------------------------------------------------------------- comparar
// el bot de siempre no cambia entre corridas: sus resultados se guardan en un caché (en la carpeta temporal)
const CACHE = path.join(require('os').tmpdir(), 'fogonazo-bot-de-siempre.json');
const leerCache = () => { try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch (e) { return {}; } };
if (!isMainThread) {
  const M = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
  if (workerData.temple) M.temple = workerData.temple;
  const cache = leerCache();
  for (const [id, modo] of workerData.casos) {
    const d = defDe(id, modo), k = id + ' ' + modo, ck = k + ' ' + workerData.n + ' ' + JSON.stringify(d.stars) + (d.moves || d.time);
    const r = { bot: cache[ck] || null, persona: [0, 0, 0, 0] };
    if (!r.bot) { r.bot = [0, 0, 0, 0]; for (let s = 0; s < workerData.n; s++) r.bot[jugar(d, 70000 + s, 'bot', M)]++; }
    for (let s = 0; s < workerData.n; s++) r.persona[jugar(d, 90000 + s, 'persona', M)]++;
    parentPort.postMessage({ k, ck, r });
  }
} else {
  const [cmd, ...resto] = process.argv.slice(2);
  if (cmd === 'ajustar' && resto.length) cmdAjustar(resto);
  else if (cmd === 'comparar' && resto.length) {
    const n = /^\d+$/.test(resto[0]) ? +resto.shift() : 150;
    const partidas = leer(resto);
    const casos = [...new Set(partidas.map(p => p.nivel + ' ' + p.modo))].map(k => { const [a, b] = k.split(' '); return [+a, b]; });
    const nW = require('os').cpus().length, res = {}; let fin = 0;
    for (let w = 0; w < nW; w++) {
      const wk = new Worker(__filename, { workerData: { casos: casos.filter((_, j) => j % nW === w), n, temple: +process.env.TEMPLE || 0 } });
      wk.on('message', m => { res[m.k] = m.r; const c = leerCache(); c[m.ck] = m.r.bot; fs.writeFileSync(CACHE, JSON.stringify(c)); });
      wk.on('exit', () => { if (++fin === nW) informe(partidas, res, n); });
    }
  } else console.log('Uso: node herramientas/persona.js ajustar registro.json… | comparar [partidas] registro.json…');
}

function informe(partidas, res, n) {
  const tasa = (h, e) => (e === 1 ? h[1] + h[2] + h[3] : e === 2 ? h[2] + h[3] : h[3]) / n;
  const pc = v => (Math.round(v * 100) + ' %').padStart(5);
  // cada intento real, con lo que esperaban de él el bot de siempre y el persona
  const filas = partidas.map(p => ({ p, h: p.estrellas || 0, b: res[p.nivel + ' ' + p.modo].bot, q: res[p.nivel + ' ' + p.modo].persona }));
  function bloque(titulo, fs_) {
    if (!fs_.length) return;
    const m = (f, e) => fs_.reduce((a, x) => a + f(x, e), 0) / fs_.length;
    const real = (x, e) => (x.h >= e ? 1 : 0), bot = (x, e) => tasa(x.b, e), per = (x, e) => tasa(x.q, e);
    console.log(`${titulo.padEnd(26)} ${String(fs_.length).padStart(3)}  ` + [1, 2, 3].map(e => `${pc(m(real, e))} ${pc(m(bot, e))} ${pc(m(per, e))}`).join('   '));
  }
  console.log(`\nCada celda: real · bot de siempre · bot persona (${n} partidas simuladas por nivel y modo)`);
  console.log(`${''.padEnd(26)} int.  ${'gana'.padEnd(17)}   ${'★★ o más'.padEnd(17)}   ★★★`);
  for (const modo of ['facil', 'normal', 'dificil']) bloque(modo, filas.filter(x => x.p.modo === modo));
  console.log('');
  for (const [a, b] of [[1, 10], [11, 20], [21, 30], [31, 999]]) bloque(`niveles ${a}–${b > 100 ? '…' : b}`, filas.filter(x => x.p.nivel >= a && x.p.nivel <= b));
  bloque('con movidas', filas.filter(x => !x.p.def.tiempo));
  bloque('contrarreloj', filas.filter(x => x.p.def.tiempo));
  console.log('\nSegún qué tan seguido gana el bot de siempre:');
  for (const [a, b] of [[0, 0.7], [0.7, 0.85], [0.85, 0.95], [0.95, 1.01]]) bloque(`  gana ${Math.round(a * 100)}–${Math.min(100, Math.round(b * 100))} %`, filas.filter(x => tasa(x.b, 1) >= a && tasa(x.b, 1) < b));
  if (process.env.DETALLE) {
    console.log('\nPor nivel (intentos reales: estrellas · el persona gana / ★★ o más):');
    const ks = [...new Set(filas.map(x => x.p.nivel + ' ' + x.p.modo))].sort((u, v) => parseInt(u) - parseInt(v));
    for (const k of ks) { const fs_ = filas.filter(x => x.p.nivel + ' ' + x.p.modo === k), q = fs_[0].q; console.log(`  ${k.padEnd(11)} ${fs_.map(x => x.h).join('')} · ${pc(tasa(q, 1))} ${pc(tasa(q, 2))}`); }
  }
  // la verosimilitud de las estrellas reales (0 a 3) con cada bot: cuánto se sorprende cada uno de lo que pasó
  const ll = k => filas.reduce((a, x) => a + Math.log(Math.max(x[k][x.h], 0.5) / (n + 2)), 0) / filas.length;
  console.log(`\nVerosimilitud de las estrellas reales por intento (más alto es mejor): bot de siempre ${ll('b').toFixed(3)} · bot persona ${ll('q').toFixed(3)}`);
}
