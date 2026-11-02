// Prueba de las cuentas de Buen ojo (buenojo/color.js): la diferencia de color contra los valores de referencia de
// CIEDE2000, el puntaje, que cada banda tenga sus frases, la ayuda y el sorteo de colores.
// node herramientas/buenojo/probar.js
const C = require('../../buenojo/color.js');
let fallas = 0;
const ok = (cond, msg) => { if (!cond) { fallas++; console.error('FALLA: ' + msg); } };

// pares de Sharma, Wu y Dalal (2005)
[[[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425], [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0000],
 [[50, 2.5, 0], [50, 0, -2.5], 4.3065], [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
 [[2.0776, 0.0795, -1.1350], [0.9033, -0.0636, -0.5514], 0.9082]]
  .forEach(([a, b, e]) => ok(Math.abs(C.deltaE(a, b) - e) < 1e-4, `ΔE ${C.deltaE(a, b)} en vez de ${e}`));

ok(C.puntaje(0) === 10 && C.puntaje(1) === 10, 'hasta ΔE 1 es un 10');
let antes = 11; for (let e = 0; e <= 80; e += 0.5) { const p = C.puntaje(e); ok(p <= antes && p >= 0, 'el puntaje baja con la diferencia'); antes = p; }
ok(C.puntaje(C.UMBRAL_AYUDA) >= 8, 'donde empieza la ayuda, el puntaje ronda el 8');

// cada puntaje cae en una banda con frases, y en una partida no se repiten mientras haya
for (let p = 0; p <= 10; p = Math.round((p + 0.1) * 10) / 10) ok(typeof C.frase(p) === 'string', 'frase para ' + p);
const usadas = new Set(), dichas = [0, 1, 2, 3].map(() => C.frase(7, usadas));
ok(new Set(dichas).size === 4, 'las frases de una banda no se repiten en una partida');
ok(C.frase(9.7) === '¡Buen ojo!', '«¡Buen ojo!» es fija en su banda');

// la ayuda: no aparece si la diferencia apenas se ve; si aparece, nombra hacia dónde se corrió
ok(C.ayuda({ h: 168, s: 58, v: 62 }, { h: 170, s: 57, v: 63 }, 1.5) === null, 'sin ayuda con poca diferencia');
const a = C.ayuda({ h: 200, s: 60, v: 60 }, { h: 230, s: 30, v: 80 }, 20);
ok(a && /azulado/.test(a.texto) && /apagado/.test(a.texto) && /claro/.test(a.texto), 'la ayuda nombra tono, saturación y brillo: ' + (a && a.texto));
ok(a && a.desglose === 'tono +30° · saturación −30 · brillo +20', 'el desglose: ' + (a && a.desglose));
const g = C.ayuda({ h: 10, s: 70, v: 60 }, { h: 10, s: 5, v: 60 }, 25);
ok(g && !/rojizo|anaranjado/.test(g.texto), 'con un gris, el tono no cuenta: ' + (g && g.texto));

// el sorteo: dentro de los márgenes y lejos de los anteriores
let lejos = 0;
for (let k = 0; k < 400; k++) {
  const prev = []; for (let i = 0; i < 5; i++) prev.push(C.sortear(prev));
  prev.forEach(c => ok(c.h >= 0 && c.h < 360 && c.s >= 25 && c.s <= 100 && c.v >= 30 && c.v <= 100, 'color fuera de rango ' + JSON.stringify(c)));
  if (prev.every((c, i) => prev.slice(0, i).every(p => C.diferencia(p, c) >= 20))) lejos++;
}
ok(lejos >= 390, `colores de una partida bien distintos entre sí (${lejos} de 400)`);

console.log(fallas ? `${fallas} fallas` : 'Buen ojo: todo bien');
process.exit(fallas ? 1 : 0);
