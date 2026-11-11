/* Biblioteca: las reglas y los repartos (sin dibujo). Lo usan la partida (biblioteca/partida.html) y las pruebas
   (herramientas/biblioteca/probar.js).

   La biblioteca es una lista de casilleros. Cada casillero es una fila de capas, de adelante hacia atrás; cada capa
   tiene tres lugares, con un objeto (su número de tipo) o vacío (null). Solo se toca la capa de adelante: se lleva un
   objeto a un lugar libre de la capa de adelante de otro casillero. Tres iguales adelante se van; si la capa de
   adelante queda vacía (porque se fue un trío o porque se sacó lo último), avanza la de atrás. Se gana al vaciar todo.

   Puertas (S-38): en Normal un casillero arranca cerrado con una puerta de vidrio, y en Difícil otro más con una
   reja. Lo de adentro no se toca ni se le apoya nada hasta abrirla, y se abre llevándole su llave: un objeto más,
   escondido unas filas atrás en otro casillero (la de bronce abre el vidrio; la de hierro, la reja). La llave ocupa
   un lugar, solo va a su puerta y, al abrirla, se va. Las llaves son los números 100 (vidrio) y 101 (reja).

   Cada reparto se genera al revés, desde la biblioteca vacía: se deshacen jugadas (se vuelve a poner un trío y se
   reparten sus objetos, se devuelven objetos a donde podían haber estado, se cierra una puerta y su llave vuelve al
   casillero de donde la sacaron, y después queda tapada por lo que se pone delante), así que el reparto queda con al
   menos una solución, la que se anotó. Antes de entregarlo se la juega de nuevo hacia adelante, por las dudas. */
(function (raiz) {
  'use strict';

  // los diecinueve objetos (S-37g y S-38a); Fácil usa los primeros ocho, los de silueta más distinta; Normal suma
  // seis (entre ellos la pila acostada y la enciclopedia) y Difícil, los que se parecen a otros: dos casetes más
  // como el naranja, el trío de libros alternado, el tomo azul y el casete transparente
  const OBJETOS = ['tomo', 'casete', 'eiffel', 'avion', 'globo', 'despertador', 'mamushka', 'cactus',
    'libros', 'auto', 'camara', 'radio', 'pila', 'enciclopedia',
    'caseteBlanco', 'caseteAhumado', 'librosAlt', 'tomoAzul', 'caseteTransparente'];
  // las llaves: cada una abre su puerta
  const LLAVES = { vidrio: 100, reja: 101 };
  const esLlave = x => x !== null && x >= 100;
  const dibujo = x => x === 100 ? 'llave' : x === 101 ? 'llaveReja' : OBJETOS[x];

  /* casilleros, tipos de objeto, tríos, capas como máximo por casillero (adelante y atrás), cuánto se mezcla y las
     puertas: de qué tipo, cuántas filas atrás arranca su llave (0 es adelante; 1, la fila en sombra) y en qué punto
     del reparto al revés se cierra (lo que se puso antes queda como el final de la partida, con la puerta abierta) */
  const DIFICULTADES = {
    facil: { nombre: 'Fácil', casilleros: 9, columnas: 3, tipos: 8, trios: 15, capas: 3, mezcla: 1.2, puertas: [] },
    normal: { nombre: 'Normal', casilleros: 12, columnas: 4, tipos: 14, trios: 25, capas: 4, mezcla: 1.6,
      puertas: [{ tipo: 'vidrio', hondo: [2, 2], cierre: 0.3 }] },
    // Difícil: 26 tríos desde la 0.19.1 (con 33 se sentía demasiado largo) y las llaves, siempre 3 filas atrás
    dificil: { nombre: 'Difícil', casilleros: 12, columnas: 4, tipos: 19, trios: 26, capas: 5, mezcla: 2,
      puertas: [{ tipo: 'vidrio', hondo: [3, 3], cierre: 0.25 }, { tipo: 'reja', hondo: [3, 3], cierre: 0.4 }] },
  };

  // números al azar con semilla, para poder repetir un reparto
  function azar(semilla) {
    let a = semilla >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const elegir = (r, lista) => lista[Math.floor(r() * lista.length)];
  function mezclar(r, l) { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; }

  // ------------------------------------------------------------ las reglas
  const frente = c => c[0] || null;
  const libres = c => c.length ? [0, 1, 2].filter(i => c[0][i] === null) : [0, 1, 2];
  const objetos = c => c.length ? [0, 1, 2].filter(i => c[0][i] !== null) : [];
  const esTrio = capa => capa[0] !== null && capa[0] === capa[1] && capa[1] === capa[2];
  const vaciaCapa = capa => capa.every(x => x === null);
  const copiar = b => b.map(c => c.map(capa => capa.slice()));
  const copiarPuertas = p => (p || []).map(x => Object.assign({}, x));
  // la puerta cerrada del casillero k, o null
  const cerrada = (puertas, k) => (puertas || []).find(p => p.k === k && !p.abierta) || null;

  /* Una movida: el objeto del lugar i del casillero a, al lugar j (libre) del casillero b; si es una llave, a la
     puerta del casillero b (j no importa). Cambia la biblioteca (y las puertas) y devuelve qué pasó (trio: el tipo que
     se fue, o null; puerta: la que se abrió, o null; avanzaA, avanzaB: si avanzó la capa de atrás), o null si la
     movida no vale. */
  function mover(bib, a, i, b, j, puertas) {
    if (a === b || !bib[a] || !bib[b] || cerrada(puertas, a)) return null;
    const A = bib[a], B = bib[b];
    if (!A.length || A[0][i] === null) return null;
    const x = A[0][i];
    if (esLlave(x)) {
      const p = cerrada(puertas, b);
      if (!p || LLAVES[p.tipo] !== x) return null;
      A[0][i] = null; p.abierta = true;
      const r = { tipo: x, trio: null, puerta: p, avanzaA: false, avanzaB: false };
      if (vaciaCapa(A[0])) { A.shift(); r.avanzaA = A.length > 0; }
      return r;
    }
    if (cerrada(puertas, b) || (B.length && B[0][j] !== null)) return null;
    A[0][i] = null;
    if (!B.length) B.push([null, null, null]);
    B[0][j] = x;
    const r = { tipo: x, trio: null, puerta: null, avanzaA: false, avanzaB: false };
    if (esTrio(B[0])) { r.trio = x; B[0] = [null, null, null]; }
    if (vaciaCapa(B[0])) { B.shift(); r.avanzaB = B.length > 0; }
    if (A.length && vaciaCapa(A[0])) { A.shift(); r.avanzaA = A.length > 0; }
    return r;
  }
  const vacia = bib => bib.every(c => !c.length);
  // ¿queda alguna movida? (un lugar libre adelante en un casillero y un objeto adelante en otro, sin puertas
  // cerradas de por medio; o una llave adelante, con su puerta todavía cerrada)
  function hayMovida(bib, puertas) {
    const conLugar = [], conObjeto = [];
    let llave = false;
    bib.forEach((c, k) => {
      if (cerrada(puertas, k)) return;
      if (libres(c).length) conLugar.push(k);
      const os = objetos(c).filter(i => !esLlave(c[0][i]));
      if (os.length) conObjeto.push(k);
      if (objetos(c).some(i => esLlave(c[0][i]) && (puertas || []).some(p => !p.abierta && LLAVES[p.tipo] === c[0][i]))) llave = true;
    });
    return llave || conLugar.some(b => conObjeto.some(a => a !== b));
  }
  // los objetos que quedan (sin contar las llaves)
  const cuenta = bib => bib.reduce((s, c) => s + c.reduce((t, capa) => t + capa.filter(x => x !== null && !esLlave(x)).length, 0), 0);
  // dónde está una llave: { k, capa, lugar } o null
  function dondeLlave(bib, x) {
    for (let k = 0; k < bib.length; k++) for (let c = 0; c < bib[k].length; c++) { const i = bib[k][c].indexOf(x); if (i >= 0) return { k, capa: c, lugar: i }; }
    return null;
  }

  // ------------------------------------------------------------ los repartos, al revés
  function intento(D, r) {
    const N = D.casilleros, bib = Array.from({ length: N }, () => []), pasos = [];
    // las puertas, todas abiertas al final de la partida; al revés se cierran de a una (pendientes: las que faltan
    // cerrar; llaves: las que ya están puestas y todavía tienen que quedar más atrás)
    const puertas = [], pendientes = D.puertas.map((p, n) => Object.assign({ n }, p)), llaves = [];
    const tapada = k => puertas.some(p => p.k === k);   // casillero cerrado: al revés, ya no se toca
    const profundidad = l => { const d = dondeLlave(bib, LLAVES[l.tipo]); return d ? d.capa : -1; };
    // el casillero de una llave que todavía tiene que quedar más atrás (para empujarla) o que ya llegó (para no pasarse)
    const empujar = k => llaves.some(l => l.k === k && profundidad(l) < l.min);
    const tope = k => llaves.some(l => l.k === k && profundidad(l) >= l.max);
    // los tríos: cada tipo, al menos uno; el resto, repartido parejo
    const tipos = mezclar(r, Array.from({ length: D.tipos }, (_, k) => k));
    const pozo = []; for (let k = 0; k < D.trios; k++) pozo.push(tipos[k % D.tipos]);
    mezclar(r, pozo);

    // dónde puede caer un objeto x, al revés, que no sea el casillero c: un lugar libre de una capa de adelante que
    // ya tiene algo (sin armar un trío), o una capa nueva adelante (si el casillero no está lleno de capas)
    function destinos(x, c) {
      const d = [];
      bib.forEach((C, k) => {
        if (k === c || tapada(k)) return;
        if (C.length) {
          for (const j of libres(C)) {
            const otros = C[0].filter((y, m) => m !== j && y !== null);
            if (otros.length === 2 && otros[0] === x && otros[1] === x) continue;
            d.push({ k, j, nueva: false, peso: empujar(k) ? 12 : 3 });
          }
        }
        // una capa nueva solo delante de una llena: así las de atrás quedan siempre completas
        if (C.length < D.capas && (!C.length || !libres(C).length) && !tope(k)) for (let j = 0; j < 3; j++) d.push({ k, j, nueva: true, peso: empujar(k) ? 4 : C.length ? 0.5 : 1.2 });
      });
      return d;
    }
    function sortear(d) {
      const tot = d.reduce((s, x) => s + x.peso, 0); let u = r() * tot;
      for (const x of d) { u -= x.peso; if (u <= 0) return x; }
      return d[d.length - 1];
    }
    // devolver el objeto del lugar i del casillero c a otro lado (al revés de llevarlo de allá a c)
    function devolver(c, i) {
      const C = bib[c], x = C[0][i];
      const d = destinos(x, c); if (!d.length) return false;
      const t = sortear(d);
      C[0][i] = null;
      if (vaciaCapa(C[0])) C.shift();
      const T = bib[t.k];
      if (t.nueva) T.unshift([null, null, null]);
      T[0][t.j] = x;
      // hacia adelante: del casillero t.k, lugar t.j, al casillero c, lugar i
      pasos.push([t.k, t.j, c, i]);
      return true;
    }

    // cerrar una puerta: un casillero con al menos dos capas queda adentro; su llave vuelve a otro casillero (a un
    // lugar libre adelante, o a una capa nueva delante de una llena), con lugar atrás para quedar tapada
    function cerrar(p) {
      const dentro = bib.map((C, k) => k).filter(k => !tapada(k) && bib[k].length >= 2 && !llaves.some(l => l.k === k));
      if (!dentro.length) return false;
      const d = elegir(r, dentro), x = LLAVES[p.tipo], hondo = p.hondo[0] + Math.floor(r() * (p.hondo[1] - p.hondo[0] + 1));
      const opciones = [];
      bib.forEach((C, k) => {
        if (k === d || tapada(k) || llaves.some(l => l.k === k)) return;
        if (C.length && libres(C).length && C.length + hondo <= D.capas) libres(C).forEach(j => opciones.push({ k, j, nueva: false }));
        if ((!C.length || !libres(C).length) && C.length + 1 + hondo <= D.capas) [0, 1, 2].forEach(j => opciones.push({ k, j, nueva: true }));
      });
      if (!opciones.length) return false;
      const t = elegir(r, opciones), T = bib[t.k];
      if (t.nueva) T.unshift([null, null, null]);
      T[0][t.j] = x;
      puertas.push({ k: d, tipo: p.tipo, abierta: false });
      llaves.push({ k: t.k, tipo: p.tipo, min: hondo, max: p.hondo[1] });
      pasos.push([t.k, t.j, d, -1]);   // hacia adelante: la llave, de ahí a su puerta
      return true;
    }

    for (let n = 0; n < pozo.length; n++) {
      const x = pozo[n];
      if (pendientes.length && n >= pendientes[0].cierre * pozo.length && cerrar(pendientes[0])) pendientes.shift();
      // el trío vuelve adelante de un casillero que todavía tenga lugar atrás (los más vacíos, más seguido; el de una
      // llave que tiene que quedar más atrás, mucho más seguido)
      const cand = bib.map((C, k) => k).filter(k => !tapada(k) && !tope(k) && (bib[k].length < D.capas && !libres(bib[k]).length || !bib[k].length));
      if (!cand.length) return null;
      const pesos = cand.map(k => (empujar(k) ? 30 : 1) / (1 + bib[k].length * bib[k].length));
      let u = r() * pesos.reduce((s, p) => s + p, 0), b = cand[cand.length - 1];
      for (let n = 0; n < cand.length; n++) { u -= pesos[n]; if (u <= 0) { b = cand[n]; break; } }
      bib[b].unshift([x, x, x]);
      if (!devolver(b, Math.floor(r() * 3))) return null;
      // y unas movidas más, que lo mezclan con lo que ya estaba
      let m = Math.floor(D.mezcla) + (r() < D.mezcla % 1 ? 1 : 0);
      for (let n = 0; n < m * 3 && m > 0; n++) {
        const c = Math.floor(r() * N), C = bib[c];
        if (!C.length || tapada(c)) continue;
        const os = objetos(C).filter(i => !esLlave(C[0][i])); if (!os.length) continue;
        // más seguido, uno de un par que espera su tercero (si no, el reparto arranca casi resuelto)
        const par = os.filter(i => os.some(k => k !== i && C[0][k] === C[0][i]));
        const i = par.length && r() < 0.8 ? elegir(r, par) : elegir(r, os);
        // si se lleva lo último de adelante y hay capas atrás, no vale (adelante nunca queda vacío con algo atrás)
        if (objetos(C).length === 1 && C.length > 1) continue;
        if (devolver(c, i)) m--;
      }
    }
    // cada puerta cerrada y cada llave tan atrás como pide la dificultad
    if (pendientes.length || llaves.some(l => { const p = profundidad(l); return p < l.min || p > l.max; })) return null;
    return { bib, puertas, solucion: pasos.reverse() };
  }

  // jugar la solución hacia adelante: tiene que vaciar la biblioteca y abrir todas las puertas
  function comprobar(bib, solucion, puertas) {
    const b = copiar(bib), p = copiarPuertas(puertas);
    for (const [a, i, c, j] of solucion) if (!mover(b, a, i, c, j, p)) return false;
    return vacia(b) && p.every(x => x.abierta);
  }

  /* Un reparto para una dificultad: { bib, puertas, solucion, semilla }. Sin semilla, una al azar. Un reparto no
     arranca con casilleros vacíos ni sin movidas. */
  function repartir(dif, semilla) {
    const D = DIFICULTADES[dif] || DIFICULTADES.normal;
    if (semilla === undefined) semilla = Math.floor(Math.random() * 2 ** 31);
    for (let k = 0; k < 400; k++) {
      const r = azar(semilla + k * 7919);
      const x = intento(D, r);
      if (!x || x.bib.some(c => !c.length) || !hayMovida(x.bib, x.puertas)) continue;
      if (!comprobar(x.bib, x.solucion, x.puertas)) continue;
      return { bib: x.bib, puertas: x.puertas, solucion: x.solucion, semilla: semilla + k * 7919 };
    }
    throw new Error('No salió un reparto para ' + dif);
  }

  const api = { OBJETOS, LLAVES, DIFICULTADES, repartir, mover, vacia, hayMovida, libres, objetos, frente, copiar, copiarPuertas, cerrada,
    cuenta, comprobar, azar, esLlave, dibujo, dondeLlave };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.Repartos = api;
})(typeof window !== 'undefined' ? window : globalThis);
