/* Fogonazo — la clave de producto: todo el avance en un serial con el formato de Windows XP (#guardado).

   El avance vive solo en el teléfono. La clave es el resguardo: el jugador la copia, la guarda donde quiera
   (notas, un chat, un mail) y la pega para recuperar exactamente lo mismo.

   Formato: 15 grupos de 5 caracteres en 3 renglones, como tres claves de XP seguidas. Empieza siempre con
   FCKGW, el homenaje. Usa el alfabeto de las claves de XP: 24 caracteres, sin vocales ni 0, 1 y 5, para que
   nada se confunda al anotarla a mano.

     FCKGW-xxxxx-xxxxx-xxxxx-xxxxx
     xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
     xxxxx-xxxxx-xxxxx-xxxxx-xxxxx

   Lo que guarda (237 bits, entran en los 70 caracteres libres, ~320 bits):
     versión del formato   4 bits
     estrellas             2 bits por nivel y por modo (30 × 3)
     récord zen, puntos    24 bits (hasta 16.777.215)
     récord zen, tiempo    17 bits (segundos, hasta 36 horas)
     control de errores    12 bits, más ~80 bits de relleno que salen del resto y también se verifican:
                           un carácter cambiado, de más o de menos, da clave inválida
   No guarda el récord de puntos de cada nivel (no entra) ni los ajustes (son del teléfono, no del avance).

   Los bits se mezclan con una máscara fija para que la clave no se lea a simple vista. No es seguridad: es
   para que tocar un carácter no dé «tres estrellas en todo» sino una clave inválida. */
const Clave = (() => {
  const ALFA = 'BCDFGHJKMPQRTVWXY2346789';
  const PREFIJO = 'FCKGW';
  const LIBRES = 70;              // caracteres después de FCKGW
  const VERSION = 1;
  const MODOS = ['facil', 'normal', 'dificil'];
  const NIVELES = 30;
  const B_PUNTOS = 24, B_TIEMPO = 17, B_CRC = 12;
  const DATOS = 4 + NIVELES * MODOS.length * 2 + B_PUNTOS + B_TIEMPO;   // 225
  const TOTAL = DATOS + B_CRC;                                          // 237
  const UNO = 1n;

  // Máscara fija de TOTAL bits (un generador lineal congruente con semilla fija).
  const MASCARA = (() => {
    let m = 0n;
    let x = 0x46434B47n;                               // «FCKG»
    for (let i = 0; i < TOTAL; i++) {
      x = (x * 6364136223846793005n + 1442695040888963407n) & ((UNO << 64n) - UNO);
      m = (m << UNO) | (x >> 63n);
    }
    return m;
  })();

  /* Los 70 caracteres dan para ~320 bits y el avance ocupa 237: la parte alta se llena con un valor que sale
     del resto. Así la clave no empieza con una tira de «B» y además sirve de segundo control. */
  const ALTO = 24n ** BigInt(LIBRES) >> BigInt(TOTAL);
  function relleno(v) {
    let h = v ^ 0x5D3A9F17C2E4B681n;
    for (let i = 0; i < 3; i++) h = (h * 0x9E3779B97F4A7C15F39CC0605CEDC835n + 0xB7E151628AED2A6Bn) >> 17n;
    return h % ALTO;
  }

  // CRC de 12 bits sobre los bits de datos.
  function crc(v, n) {
    let r = 0;
    for (let i = n - 1; i >= 0; i--) {
      const bit = Number((v >> BigInt(i)) & UNO);
      const top = (r >> 11) & 1;
      r = ((r << 1) & 0xFFF);
      if (top ^ bit) r ^= 0x80F;
    }
    return BigInt(r);
  }

  /* estado: { modos: { facil: { 1: 3, … }, normal: {…}, dificil: {…} }, zen: { best, time } } */
  function codificar(estado) {
    let v = BigInt(VERSION);
    const poner = (val, bits) => { v = (v << BigInt(bits)) | BigInt(Math.max(0, Math.min(2 ** bits - 1, Math.floor(+val || 0)))); };
    for (const id of MODOS) for (let n = 1; n <= NIVELES; n++) poner(((estado.modos || {})[id] || {})[n] || 0, 2);
    const z = estado.zen || {};
    poner(z.best, B_PUNTOS);
    poner(z.time, B_TIEMPO);
    v = ((v << BigInt(B_CRC)) | crc(v, DATOS)) ^ MASCARA;
    v += relleno(v) << BigInt(TOTAL);
    let s = '';
    for (let i = 0; i < LIBRES; i++) { s = ALFA[Number(v % 24n)] + s; v /= 24n; }
    const todo = PREFIJO + s;
    const grupos = todo.match(/.{5}/g);
    return [0, 5, 10].map(i => grupos.slice(i, i + 5).join('-')).join('\n');
  }

  /* Acepta lo que el jugador pegue: saltos de línea, espacios, guiones, minúsculas y texto alrededor.
     Devuelve { ok: true, estado } o { ok: false, motivo: 'vacia' | 'sinPrefijo' | 'incompleta' | 'invalida' }. */
  function leer(texto) {
    const limpio = String(texto || '').toUpperCase().replace(/[\s\-–—_.·]/g, '');
    if (!limpio) return { ok: false, motivo: 'vacia' };
    const i = limpio.indexOf(PREFIJO);
    if (i < 0) return { ok: false, motivo: limpio.length < LIBRES ? 'incompleta' : 'sinPrefijo' };
    // después de FCKGW, los caracteres del alfabeto; lo que siga a la clave (texto pegado de más) se ignora
    let resto = limpio.slice(i + PREFIJO.length);
    const m = resto.match(new RegExp('^[' + ALFA + ']*'));
    const cuerpo = m[0];
    if (cuerpo.length < LIBRES) return { ok: false, motivo: cuerpo.length === resto.length ? 'incompleta' : 'invalida' };
    if (cuerpo.length > LIBRES) return { ok: false, motivo: 'invalida' };
    let v = 0n;
    for (const c of cuerpo) v = v * 24n + BigInt(ALFA.indexOf(c));
    const alto = v >> BigInt(TOTAL);
    v &= (UNO << BigInt(TOTAL)) - UNO;
    if (alto !== relleno(v)) return { ok: false, motivo: 'invalida' };
    v ^= MASCARA;
    const datos = v >> BigInt(B_CRC);
    if (crc(datos, DATOS) !== (v & ((UNO << BigInt(B_CRC)) - UNO))) return { ok: false, motivo: 'invalida' };
    let pos = DATOS;
    const sacar = bits => { pos -= bits; return Number((datos >> BigInt(pos)) & ((UNO << BigInt(bits)) - UNO)); };
    if (sacar(4) !== VERSION) return { ok: false, motivo: 'invalida' };
    const modos = {};
    for (const id of MODOS) { modos[id] = {}; for (let n = 1; n <= NIVELES; n++) { const s = sacar(2); if (s) modos[id][n] = s; } }
    const zen = { best: sacar(B_PUNTOS), time: sacar(B_TIEMPO) };
    return { ok: true, estado: { modos, zen } };
  }

  return { codificar, leer, ALFA, PREFIJO };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = { Clave };
