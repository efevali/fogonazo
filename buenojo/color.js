// Buen ojo: las cuentas del color. Pasar de tono, saturación y brillo (HSB, como los pomos) a RGB y a Lab, medir la
// diferencia entre dos colores como la ve el ojo (CIEDE2000), convertirla en puntaje, armar la ayuda de la revelación
// y sortear los colores de una partida. Sin pantalla: lo usan partida.html y herramientas/buenojo/probar.js.
(function (raiz) {
  'use strict';

  // ------------------------------------------------------------ conversiones
  // h de 0 a 360, s y v de 0 a 100 → [r, g, b] de 0 a 255
  function hsvARgb(h, s, v) {
    h = ((h % 360) + 360) % 360; s /= 100; v /= 100;
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r + m, g + m, b + m].map(n => Math.round(n * 255));
  }
  const css = (h, s, v) => { const [r, g, b] = hsvARgb(h, s, v); return `rgb(${r},${g},${b})`; };

  function rgbALab([r, g, b]) {
    const lin = n => { n /= 255; return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); };
    const R = lin(r), G = lin(g), B = lin(b);
    // sRGB → XYZ (D65), relativo al blanco
    const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
    const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750);
    const Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883;
    const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
    const fx = f(X), fy = f(Y), fz = f(Z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }

  // CIEDE2000 (Sharma, Wu y Dalal, 2005)
  function deltaE([L1, a1, b1], [L2, a2, b2]) {
    const rad = Math.PI / 180, deg = 180 / Math.PI;
    const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Math.pow(Cm, 7) / (Math.pow(Cm, 7) + Math.pow(25, 7))));
    const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
    const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    const hp = (b, a) => { if (b === 0 && a === 0) return 0; const h = Math.atan2(b, a) * deg; return h < 0 ? h + 360 : h; };
    const h1p = hp(b1, a1p), h2p = hp(b2, a2p);
    const dLp = L2 - L1, dCp = C2p - C1p;
    let dhp = 0;
    if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2 * rad);
    const Lmp = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
    let hmp = h1p + h2p;
    if (C1p * C2p !== 0) { if (Math.abs(h1p - h2p) <= 180) hmp /= 2; else hmp = h1p + h2p < 360 ? (hmp + 360) / 2 : (hmp - 360) / 2; }
    const T = 1 - 0.17 * Math.cos((hmp - 30) * rad) + 0.24 * Math.cos(2 * hmp * rad) + 0.32 * Math.cos((3 * hmp + 6) * rad) - 0.20 * Math.cos((4 * hmp - 63) * rad);
    const dTheta = 30 * Math.exp(-Math.pow((hmp - 275) / 25, 2));
    const Rc = 2 * Math.sqrt(Math.pow(Cmp, 7) / (Math.pow(Cmp, 7) + Math.pow(25, 7)));
    const Sl = 1 + 0.015 * Math.pow(Lmp - 50, 2) / Math.sqrt(20 + Math.pow(Lmp - 50, 2));
    const Sc = 1 + 0.045 * Cmp, Sh = 1 + 0.015 * Cmp * T;
    const Rt = -Math.sin(2 * dTheta * rad) * Rc;
    return Math.sqrt(Math.pow(dLp / Sl, 2) + Math.pow(dCp / Sc, 2) + Math.pow(dHp / Sh, 2) + Rt * (dCp / Sc) * (dHp / Sh));
  }
  const diferencia = (c1, c2) => deltaE(rgbALab(hsvARgb(c1.h, c1.s, c1.v)), rgbALab(hsvARgb(c2.h, c2.s, c2.v)));

  // ------------------------------------------------------------ puntaje
  // De 0 a 10, con un decimal. Hasta ΔE 1 (lo que el ojo apenas distingue) es un 10; ΔE 3 da 9,6, ΔE 6 da 8,4,
  // ΔE 12 da 6, ΔE 20 da 3,8. Es una propuesta para ajustar jugando.
  function puntaje(dE) {
    const p = dE <= 1 ? 10 : 10 / (1 + Math.pow((dE - 1) / 14, 1.6));
    return Math.round(p * 10) / 10;
  }
  // la ayuda (qué le faltó al color) aparece cuando la diferencia ya se ve sin esfuerzo
  const UMBRAL_AYUDA = 6;

  // ------------------------------------------------------------ las frases de la revelación, por banda de puntaje
  // Se sortean sin repetir dentro de una partida. «¡Buen ojo!» es fija: el nombre del juego se gana.
  const BANDAS = [
    { desde: 10, frases: ['Calcado.', 'Idéntico. ¿Hiciste trampa?', 'Mejor que la máquina de la pinturería.'] },
    { desde: 9.5, frases: ['¡Buen ojo!'] },
    { desde: 8, frases: ['Hay que mirarlos dos veces.', 'Por un pelo de pincel.', 'Esto ya es ojo.', 'La diferencia la ve solo un chapista.', 'Le faltó una gota, nada más.'] },
    { desde: 6, frases: ['Se nota que lo viste.', 'El ojo está; falta la mano.', 'Encaminado. Sin afinar, pero encaminado.', 'Un pintor diría «bastante bien» y seguiría mezclando.', 'Casi, casi. El «casi» pesa.'] },
    { desde: 4, frases: ['Se parecen como primos lejanos.', 'De lejos y con poca luz, pasa.', 'Ibas bien hasta que no.', 'Algo de razón tenías. Algo.'] },
    { desde: 0, frases: ['Estamos seguros de que tenés los ojos abiertos.', 'Con esa vista, que hayas abierto este juego es un milagro.', '¿Seguro que no lo armaste con los ojos cerrados?', 'Ese color existe, pero no es este.'] },
  ];
  // usadas: un Set de frases ya dichas en la partida; se agrega la elegida
  function frase(p, usadas, azar = Math.random) {
    const banda = BANDAS.find(b => p >= b.desde);
    let libres = banda.frases.filter(f => !usadas || !usadas.has(f));
    if (!libres.length) libres = banda.frases;
    const f = libres[Math.floor(azar() * libres.length)];
    if (usadas) usadas.add(f);
    return f;
  }

  // ------------------------------------------------------------ la ayuda: cómo quedó el tuyo al lado del original
  // Las familias de tono, por su centro: el tono que se corrió se nombra por la familia hacia la que fue.
  const FAMILIAS = [[0, 'rojizo'], [28, 'anaranjado'], [52, 'amarillento'], [110, 'verdoso'], [170, 'turquesa'], [200, 'celeste'], [232, 'azulado'], [275, 'violeta'], [320, 'rosado']];
  const difTono = (a, b) => { let d = b - a; d = ((d % 360) + 540) % 360 - 180; return d; };   // de a hacia b, de -180 a 180
  function haciaFamilia(h, sentido) {
    // la primera familia que se encuentra yendo desde h en ese sentido
    let mejor = null, dist = 999;
    FAMILIAS.forEach(([c, nombre]) => {
      let d = sentido > 0 ? c - h : h - c; d = ((d % 360) + 360) % 360;
      if (d > 0 && d < dist) { dist = d; mejor = nombre; }
    });
    return mejor;
  }
  // original y tuyo: {h, s, v}. Devuelve { texto } o null si no hace falta ayuda. Los valores de cada uno van aparte,
  // en la tabla de la revelación (S-32).
  function ayuda(orig, tuyo, dE) {
    if (dE <= UMBRAL_AYUDA) return null;
    const dh = difTono(orig.h, tuyo.h), ds = tuyo.s - orig.s, dv = tuyo.v - orig.v;
    // el tono no cuenta si alguno de los dos es casi gris o casi negro
    const tonoCuenta = Math.min(orig.s, tuyo.s) >= 12 && Math.min(orig.v, tuyo.v) >= 15;
    const partes = [];
    const cuanto = (d, chico) => Math.abs(d) < chico ? 'un poco más ' : 'mucho más ';
    if (tonoCuenta && Math.abs(dh) >= 6) partes.push(cuanto(dh, 25) + haciaFamilia(orig.h, Math.sign(dh)));
    if (Math.abs(ds) >= 6) partes.push(cuanto(ds, 20) + (ds > 0 ? 'vivo' : 'apagado'));
    if (Math.abs(dv) >= 5) partes.push(cuanto(dv, 15) + (dv > 0 ? 'claro' : 'oscuro'));
    // si nada pasa los umbrales, se nombra lo que más se corrió
    if (!partes.length) {
      const r = [[tonoCuenta ? Math.abs(dh) / 6 : 0, 'h'], [Math.abs(ds) / 6, 's'], [Math.abs(dv) / 5, 'v']].sort((a, b) => b[0] - a[0])[0][1];
      partes.push(r === 'h' ? 'un poco más ' + haciaFamilia(orig.h, Math.sign(dh) || 1) : r === 's' ? 'un poco más ' + (ds > 0 ? 'vivo' : 'apagado') : 'un poco más ' + (dv > 0 ? 'claro' : 'oscuro'));
    }
    // «un poco más celeste, un poco más apagado» → «un poco más celeste, más apagado»: no se repite el «un poco»
    const lim = partes.map((p, i) => i > 0 && p.slice(0, 12) === partes[i - 1].slice(0, 12) ? p.replace(/^(un poco |mucho )/, '') : p);
    const lista = lim.length === 1 ? lim[0] : lim.slice(0, -1).join(', ') + ' y ' + lim[lim.length - 1];
    return { texto: 'Te quedó ' + lista + '.' };
  }

  // ------------------------------------------------------------ los colores de una partida
  // Tono libre; saturación desde 25 y brillo desde 30, para que el tono siempre se vea. Cada color de una partida
  // queda bien lejos de los anteriores (ΔE 20 o más), para que no se parezcan entre sí.
  function sortear(previos = [], azar = Math.random) {
    let c;
    for (let i = 0; i < 60; i++) {
      c = { h: Math.round(azar() * 3600) / 10, s: Math.round(25 + azar() * 75), v: Math.round(30 + azar() * 70) };
      if (previos.every(p => diferencia(p, c) >= 20)) break;
    }
    return c;
  }

  const coma = n => n.toFixed(1).replace('.', ',');

  const API = { hsvARgb, css, rgbALab, deltaE, diferencia, puntaje, UMBRAL_AYUDA, BANDAS, frase, ayuda, sortear, difTono, coma };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.Color = API;
})(typeof window !== 'undefined' ? window : this);
