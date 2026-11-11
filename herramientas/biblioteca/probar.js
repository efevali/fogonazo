/* Pruebas de Biblioteca: que cada reparto tenga solución y cómo le va a un jugador simple en cada dificultad.

   node herramientas/biblioteca/probar.js [repartos por dificultad]   (por defecto, 300)

   Para cada dificultad: reparte con semillas distintas, comprueba que la solución anotada vacíe la biblioteca, y hace
   jugar a un bot que mira solo lo que se ve (adelante y la fila de atrás, en sombra), sin deshacer: junta un trío si
   puede, si no arma un par donde convenga, y si no mueve algo que libere lugar. Informa cuántas ganó, en cuántas
   movidas, y cuántas veces se trabó (sin lugar). Termina con error si algún reparto no tiene solución. */
const R = require('../../biblioteca/repartos.js');
const N = Number(process.argv[2]) || 300;

// el bot: puntúa cada movida posible con lo que se ve y elige la mejor (con un poco de azar para desempatar)
function jugar(bib, r, tope = 600) {
  let movidas = 0;
  const ultima = [], vistos = new Set();
  while (!R.vacia(bib)) {
    if (!R.hayMovida(bib) || movidas >= tope) return { gano: false, movidas, trabada: !R.hayMovida(bib) };
    let mejor = null, mp = -Infinity;
    bib.forEach((A, a) => {
      for (const i of R.objetos(A)) {
        const x = A[0][i];
        const quedanA = A[0].filter((y, k) => k !== i && y !== null);
        bib.forEach((B, b) => {
          if (a === b) return;
          for (const j of R.libres(B)) {
            const enB = B.length ? B[0].filter(y => y !== null) : [];
            const iguales = enB.filter(y => y === x).length;
            let p = 0;
            if (iguales === 2) p += 100;                       // trío
            else if (iguales === 1 && enB.length === 1) p += 30; // par, con lugar para el tercero
            else if (iguales === 1) p += 4;
            else if (enB.length === 0) p += 2;
            else p -= 6 * enB.length;                          // mezclar con otros
            // sacar de un casillero donde x estaba solo o con distintos: bueno; romper un par: malo
            if (quedanA.filter(y => y === x).length === 1) p -= 25;
            if (!quedanA.length) p += 8 + (A.length > 1 ? 6 : 0); // vacía adelante y avanza lo de atrás
            // lo de atrás de B: si espera un x, mejor
            if (B[1] && B[1].includes(x)) p += 3;
            if (ultima.some(u => u[0] === b && u[1] === a && u[2] === x)) p -= 40; // no ir y volver
            // no volver a una biblioteca que ya tuvo
            const prueba = R.copiar(bib); R.mover(prueba, a, i, b, j);
            if (vistos.has(JSON.stringify(prueba))) p -= 60;
            p += r() * 3;
            if (p > mp) { mp = p; mejor = [a, i, b, j, x]; }
          }
        });
      }
    });
    R.mover(bib, mejor[0], mejor[1], mejor[2], mejor[3]);
    ultima.push([mejor[0], mejor[2], mejor[4]]); if (ultima.length > 4) ultima.shift();
    vistos.add(JSON.stringify(bib));
    movidas++;
  }
  return { gano: true, movidas };
}

let fallas = 0;
for (const dif of Object.keys(R.DIFICULTADES)) {
  const D = R.DIFICULTADES[dif];
  let ganadas = 0, trabadas = 0, mov = [], sol = [], libresIni = [], capas = [], t0 = Date.now();
  for (let s = 1; s <= N; s++) {
    const x = R.repartir(dif, s * 104729);
    if (!R.comprobar(x.bib, x.solucion)) { fallas++; console.log(`  ✗ ${dif}, semilla ${x.semilla}: la solución no vacía la biblioteca`); }
    if (R.cuenta(x.bib) !== D.trios * 3) { fallas++; console.log(`  ✗ ${dif}: faltan objetos`); }
    sol.push(x.solucion.length);
    libresIni.push(x.bib.reduce((t, c) => t + R.libres(c).length, 0));
    capas.push(Math.max(...x.bib.map(c => c.length)));
    const j = jugar(R.copiar(x.bib), R.azar(s));
    if (j.gano) { ganadas++; mov.push(j.movidas); } else if (j.trabada) trabadas++;
  }
  const prom = l => l.length ? (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) : '—';
  console.log(`${D.nombre}: ${D.casilleros} casilleros, ${D.tipos} tipos, ${D.trios} tríos (${D.trios * 3} objetos), hasta ${D.capas} capas`);
  console.log(`  el bot gana ${(100 * ganadas / N).toFixed(0)} % (se traba en ${(100 * trabadas / N).toFixed(0)} %), en ${prom(mov)} movidas; la solución anotada, ${prom(sol)}`);
  console.log(`  lugares libres al empezar: ${prom(libresIni)} · capas como máximo: ${prom(capas)} · ${((Date.now() - t0) / N).toFixed(1)} ms por reparto y partida`);
}
console.log(fallas ? `\n${fallas} falla(s).` : '\nTodos los repartos tienen solución.');
process.exit(fallas ? 1 : 0);
