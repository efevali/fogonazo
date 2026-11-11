/* Biblioteca: las reglas y los repartos (sin dibujo). Lo usan la partida (biblioteca/partida.html) y las pruebas
   (herramientas/biblioteca/probar.js).

   La biblioteca es una lista de casilleros. Cada casillero es una fila de capas, de adelante hacia atrás; cada capa
   tiene tres lugares, con un objeto (su número de tipo) o vacío (null). Solo se toca la capa de adelante: se lleva un
   objeto a un lugar libre de la capa de adelante de otro casillero. Tres iguales adelante se van; si la capa de
   adelante queda vacía (porque se fue un trío o porque se sacó lo último), avanza la de atrás. Se gana al vaciar todo.

   Cada reparto se genera al revés, desde la biblioteca vacía: se deshacen jugadas (se vuelve a poner un trío y se
   reparten sus objetos, se devuelven objetos a donde podían haber estado), así que el reparto queda con al menos una
   solución, la que se anotó. Antes de entregarlo se la juega de nuevo hacia adelante, por las dudas. */
(function (raiz) {
  'use strict';

  // los catorce objetos (S-37g); Fácil usa los primeros ocho, los de silueta más distinta; Normal suma cuatro y
  // Difícil, los dos casetes que se parecen al naranja
  const OBJETOS = ['tomo', 'casete', 'eiffel', 'avion', 'globo', 'despertador', 'mamushka', 'cactus',
    'libros', 'auto', 'camara', 'radio', 'caseteBlanco', 'caseteAhumado'];

  // casilleros, tipos de objeto, tríos, capas como máximo por casillero (adelante y atrás) y cuánto se mezcla
  const DIFICULTADES = {
    facil: { nombre: 'Fácil', casilleros: 9, columnas: 3, tipos: 8, trios: 15, capas: 3, mezcla: 1.2 },
    normal: { nombre: 'Normal', casilleros: 12, columnas: 4, tipos: 12, trios: 25, capas: 4, mezcla: 1.6 },
    dificil: { nombre: 'Difícil', casilleros: 12, columnas: 4, tipos: 14, trios: 33, capas: 5, mezcla: 2 },
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

  /* Una movida: el objeto del lugar i del casillero a, al lugar j (libre) del casillero b. Cambia la biblioteca y
     devuelve qué pasó (trio: el tipo que se fue, o null; avanzaA, avanzaB: si avanzó la capa de atrás), o null si
     la movida no vale. */
  function mover(bib, a, i, b, j) {
    if (a === b || !bib[a] || !bib[b]) return null;
    const A = bib[a], B = bib[b];
    if (!A.length || A[0][i] === null || (B.length && B[0][j] !== null)) return null;
    const x = A[0][i];
    A[0][i] = null;
    if (!B.length) B.push([null, null, null]);
    B[0][j] = x;
    const r = { tipo: x, trio: null, avanzaA: false, avanzaB: false };
    if (esTrio(B[0])) { r.trio = x; B[0] = [null, null, null]; }
    if (vaciaCapa(B[0])) { B.shift(); r.avanzaB = B.length > 0; }
    if (A.length && vaciaCapa(A[0])) { A.shift(); r.avanzaA = A.length > 0; }
    return r;
  }
  const vacia = bib => bib.every(c => !c.length);
  // ¿queda alguna movida? (un lugar libre adelante en un casillero y un objeto adelante en otro)
  function hayMovida(bib) {
    const conLugar = [], conObjeto = [];
    bib.forEach((c, k) => { if (libres(c).length) conLugar.push(k); if (objetos(c).length) conObjeto.push(k); });
    return conLugar.some(b => conObjeto.some(a => a !== b));
  }
  const cuenta = bib => bib.reduce((s, c) => s + c.reduce((t, capa) => t + capa.filter(x => x !== null).length, 0), 0);

  // ------------------------------------------------------------ los repartos, al revés
  function intento(D, r) {
    const N = D.casilleros, bib = Array.from({ length: N }, () => []), pasos = [];
    // los tríos: cada tipo, al menos uno; el resto, repartido parejo
    const tipos = mezclar(r, Array.from({ length: D.tipos }, (_, k) => k));
    const pozo = []; for (let k = 0; k < D.trios; k++) pozo.push(tipos[k % D.tipos]);
    mezclar(r, pozo);

    // dónde puede caer un objeto x, al revés, que no sea el casillero c: un lugar libre de una capa de adelante que
    // ya tiene algo (sin armar un trío), o una capa nueva adelante (si el casillero no está lleno de capas)
    function destinos(x, c) {
      const d = [];
      bib.forEach((C, k) => {
        if (k === c) return;
        if (C.length) {
          for (const j of libres(C)) {
            const otros = C[0].filter((y, m) => m !== j && y !== null);
            if (otros.length === 2 && otros[0] === x && otros[1] === x) continue;
            d.push({ k, j, nueva: false, peso: 3 });
          }
        }
        // una capa nueva solo delante de una llena: así las de atrás quedan siempre completas
        if (C.length < D.capas && (!C.length || !libres(C).length)) for (let j = 0; j < 3; j++) d.push({ k, j, nueva: true, peso: C.length ? 0.5 : 1.2 });
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

    for (const x of pozo) {
      // el trío vuelve adelante de un casillero que todavía tenga lugar atrás (los más vacíos, más seguido)
      const cand = bib.map((C, k) => k).filter(k => bib[k].length < D.capas && !libres(bib[k]).length || !bib[k].length);
      if (!cand.length) return null;
      const pesos = cand.map(k => 1 / (1 + bib[k].length * bib[k].length));
      let u = r() * pesos.reduce((s, p) => s + p, 0), b = cand[cand.length - 1];
      for (let n = 0; n < cand.length; n++) { u -= pesos[n]; if (u <= 0) { b = cand[n]; break; } }
      bib[b].unshift([x, x, x]);
      if (!devolver(b, Math.floor(r() * 3))) return null;
      // y unas movidas más, que lo mezclan con lo que ya estaba
      let m = Math.floor(D.mezcla) + (r() < D.mezcla % 1 ? 1 : 0);
      for (let n = 0; n < m * 3 && m > 0; n++) {
        const c = Math.floor(r() * N), C = bib[c];
        if (!C.length) continue;
        const os = objetos(C); if (!os.length) continue;
        // más seguido, uno de un par que espera su tercero (si no, el reparto arranca casi resuelto)
        const par = os.filter(i => os.some(k => k !== i && C[0][k] === C[0][i]));
        const i = par.length && r() < 0.8 ? elegir(r, par) : elegir(r, os);
        // si se lleva lo último de adelante y hay capas atrás, no vale (adelante nunca queda vacío con algo atrás)
        if (os.length === 1 && C.length > 1) continue;
        if (devolver(c, i)) m--;
      }
    }
    return { bib, solucion: pasos.reverse() };
  }

  // jugar la solución hacia adelante: tiene que vaciar la biblioteca
  function comprobar(bib, solucion) {
    const b = copiar(bib);
    for (const [a, i, c, j] of solucion) if (!mover(b, a, i, c, j)) return false;
    return vacia(b);
  }

  /* Un reparto para una dificultad: { bib, solucion, semilla }. Sin semilla, una al azar. Un reparto no arranca con
     casilleros vacíos ni con la biblioteca sin lugares libres adelante. */
  function repartir(dif, semilla) {
    const D = DIFICULTADES[dif] || DIFICULTADES.normal;
    if (semilla === undefined) semilla = Math.floor(Math.random() * 2 ** 31);
    for (let k = 0; k < 400; k++) {
      const r = azar(semilla + k * 7919);
      const x = intento(D, r);
      if (!x || x.bib.some(c => !c.length) || !hayMovida(x.bib)) continue;
      if (!comprobar(x.bib, x.solucion)) continue;
      return { bib: x.bib, solucion: x.solucion, semilla: semilla + k * 7919 };
    }
    throw new Error('No salió un reparto para ' + dif);
  }

  const api = { OBJETOS, DIFICULTADES, repartir, mover, vacia, hayMovida, libres, objetos, frente, copiar, cuenta, comprobar, azar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.Repartos = api;
})(typeof window !== 'undefined' ? window : globalThis);
