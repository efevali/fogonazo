/* Prueba la clave de producto (codigo/clave.js): que todo avance vaya y vuelva igual, que acepte la clave
   pegada de cualquier forma y que rechace una clave tocada.

   node herramientas/probar_clave.js */
const { Clave } = require('../codigo/clave.js');
const { LEVELS } = require('../codigo/levels.js');
const MODOS = ['facil', 'normal', 'dificil'];
let fallas = 0;
const mal = (msg) => { fallas++; console.log('FALLA:', msg); };
if (LEVELS.length !== 30) mal('la clave guarda 30 niveles y el juego tiene ' + LEVELS.length + ': hay que cambiar el formato (nueva versión)');

const azar = (k) => Math.floor(Math.random() * k);
function estadoAzar(lleno) {
  const modos = {};
  for (const id of MODOS) { modos[id] = {}; for (let n = 1; n <= 30; n++) { const s = lleno ? 3 : azar(4); if (s) modos[id][n] = s; } }
  return { modos, zen: { best: lleno ? 16777215 : azar(3e6), time: lleno ? 131071 : azar(40000) } };
}
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const casos = [estadoAzar(true), { modos: { facil: {}, normal: {}, dificil: {} }, zen: { best: 0, time: 0 } }];
for (let i = 0; i < 2000; i++) casos.push(estadoAzar(false));
for (const e of casos) {
  const k = Clave.codificar(e);
  if (!/^FCKGW(-[BCDFGHJKMPQRTVWXY2346789]{5}){4}\n([BCDFGHJKMPQRTVWXY2346789]{5}-){4}[BCDFGHJKMPQRTVWXY2346789]{5}\n([BCDFGHJKMPQRTVWXY2346789]{5}-){4}[BCDFGHJKMPQRTVWXY2346789]{5}$/.test(k)) { mal('formato: ' + k); break; }
  const r = Clave.leer(k);
  if (!r.ok || !igual(r.estado, e)) { mal('ida y vuelta: ' + JSON.stringify(e)); break; }
  // pegada de otras formas
  const variantes = [k.replace(/\n/g, ' '), k.toLowerCase(), k.replace(/[-\n]/g, ''), '  ' + k + '\n\n', 'Mi clave:\n' + k, k.replace(/\n/g, '\r\n')];
  for (const v of variantes) { const r2 = Clave.leer(v); if (!r2.ok || !igual(r2.estado, e)) { mal('variante: ' + JSON.stringify(v)); break; } }
}
// claves tocadas: un carácter cambiado, uno de menos, un renglón de menos
let aceptadas = 0, pruebas = 0;
for (let i = 0; i < 3000; i++) {
  const k = Clave.codificar(estadoAzar(false)).replace(/[-\n]/g, '');
  const p = 5 + azar(70);
  let c; do { c = Clave.ALFA[azar(24)]; } while (c === k[p]);
  pruebas++; if (Clave.leer(k.slice(0, p) + c + k.slice(p + 1)).ok) aceptadas++;
}
console.log(`Un carácter cambiado: ${aceptadas} de ${pruebas} pasaron como válidas (se espera 0).`);
if (aceptadas > 0) mal('el control de errores deja pasar demasiadas');
const base = Clave.codificar(estadoAzar(false));
const lin = base.split('\n');
if (Clave.leer(lin.slice(0, 2).join('\n')).motivo !== 'incompleta') mal('dos renglones deberían dar «incompleta»');
if (Clave.leer(base.slice(0, -1)).motivo !== 'incompleta') mal('un carácter de menos debería dar «incompleta»');
if (Clave.leer(lin.slice(1).join('\n')).ok) mal('sin el primer renglón no debería cargar');
if (Clave.leer('').motivo !== 'vacia') mal('vacía');
if (Clave.leer(base.replace('FCKGW-', 'FCKGW-O')).ok) mal('una O no debería pasar');
console.log(fallas ? `${fallas} falla(s).` : `Bien: ${casos.length} avances van y vuelven iguales, pegados de seis formas distintas.`);
console.log('Ejemplo, todo completo:\n' + Clave.codificar(casos[0]));
process.exit(fallas ? 1 : 0);
