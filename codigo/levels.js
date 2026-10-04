/* Chispazo — definición de niveles.
   Colores: 0 resistencia · 1 capacitor electrolítico · 2 LED · 3 bobina · 4 chip · 5 capacitor cerámico · 6 cristal
   Layout: '.' normal · 'x' hueco · '1'/'2' pad sin soldar (capas) · 'b'/'B' quemado (1/2 golpes) · 'k' cinta kapton · 'q' kapton sobre pad
   target = tasa de victoria buscada para el bot de calibración.
   tune: qué se calibra ('moves' | 'time' | 'score'). */
(function (root) {
const LEVELS = [
  // ---------------- Bloque 1 · Protoboard
  { name: 'Blink', colors: 5, moves: 18, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.97, tip: 'swap',
    text: 'El primer circuito de todos: hacer titilar un LED. Deslizá un componente hacia un vecino para armar líneas de 3 iguales.' },
  { name: 'Divisor de tensión', colors: 5, moves: 20, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.95, tip: 'line',
    text: 'Dos resistencias en serie y la tensión se reparte. Probá juntar 4 en línea.' },
  { name: 'Filtro RC', colors: 5, moves: 20, goals: [{ type: 'collect', color: 0, n: 28 }, { type: 'collect', color: 1, n: 28 }], tune: 'moves', target: 0.92,
    text: 'Con una resistencia y un capacitor ya se puede filtrar ruido. Esta vez hay que juntar de los dos.' },
  { name: 'Puente rectificador', colors: 5, moves: 20, goals: [{ type: 'collect', color: 2, n: 36 }], tune: 'moves', target: 0.87, tip: 'bomb',
    text: 'Cuatro diodos convierten la alterna en continua. Un LED también es un diodo: juntá LEDs.' },
  { name: 'Multivibrador astable', colors: 5, time: 60, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.82, tip: 'battery',
    text: 'Oscila solo, sin parar. Este nivel es contrarreloj: sumá puntos antes de que se acabe el tiempo.' },

  // ---------------- Bloque 2 · Integrados
  { name: 'Timer 555', colors: 6, moves: 20, goals: [{ type: 'collect', color: 4, n: 22 }], tune: 'moves', target: 0.9, tip: 'color6',
    text: 'Uno de los integrados más fabricados de la historia. Además, llega un componente nuevo a la mesa: el capacitor cerámico.' },
  { name: 'Regulador 7805', colors: 6, moves: 22, goals: [{ type: 'collect', color: 5, n: 20 }, { type: 'collect', color: 1, n: 20 }], tune: 'moves', target: 0.83,
    text: 'Entra tensión sucia y salen 5 V limpios. Necesita un capacitor de cada lado.' },
  { name: 'Flip-flop', colors: 6, moves: 22, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.76,
    text: 'Un bit de memoria con dos estados estables. Buscá cascadas y combiná especiales.' },
  { name: 'Generador PWM', colors: 6, time: 90, goals: [{ type: 'collect', color: 2, n: 25 }], tune: 'time', target: 0.7,
    text: 'Pulsos de ancho variable para regular el brillo de un LED. Contrarreloj: juntá los LEDs a tiempo.' },
  { name: 'Fuente lineal', colors: 6, moves: 30, goals: [{ type: 'collect', color: 3, n: 22 }, { type: 'collect', color: 2, n: 22 }, { type: 'collect', color: 1, n: 22 }], tune: 'moves', target: 0.62,
    text: 'Transformador, puente de diodos y filtro. Primer jefe: tres pedidos a la vez.' },

  // ---------------- Bloque 3 · Soldadura
  { name: 'Pistas de cobre', colors: 5, moves: 20, goals: [{ type: 'pads' }], tune: 'moves', target: 0.88, tip: 'pads',
    layout: ['........', '........', '.111111.', '.111111.', '.111111.', '.111111.', '........', '........'],
    text: 'Hay pads de cobre sin soldar. Formá líneas encima de ellos para estañarlos.' },
  { name: 'Plaqueta perforada', colors: 6, moves: 22, goals: [{ type: 'pads' }], tune: 'moves', target: 0.8,
    layout: ['........', '.1.1.1..', '..1.1.1.', '.1.1.1..', '..1.1.1.', '.1.1.1..', '..1.1.1.', '........'],
    text: 'Una placa universal llena de pads que esperan estaño.' },
  { name: 'Doble faz', colors: 6, moves: 24, goals: [{ type: 'pads' }], tune: 'moves', target: 0.72, tip: 'pads2',
    layout: ['........', '.111111.', '.122221.', '.12..21.', '.12..21.', '.122221.', '.111111.', '........'],
    text: 'Placa de doble faz: los pads con remaches necesitan dos pasadas de estaño.' },
  { name: 'Soldadura por ola', colors: 6, time: 120, goals: [{ type: 'pads' }], tune: 'time', target: 0.65,
    layout: ['........', '........', '.111111.', '........', '........', '.111111.', '........', '........'],
    text: 'En la fábrica, el estaño pasa en una ola. Contrarreloj: soldá todo a tiempo.' },
  { name: 'Montaje SMD', colors: 6, moves: 28, goals: [{ type: 'pads' }], tune: 'moves', target: 0.55,
    layout: ['........', '.22..22.', '........', '..2..2..', '..2..2..', '........', '.22..22.', '........'],
    text: 'Jefe del bloque: componentes de montaje superficial, con pads chicos que necesitan doble pasada.' },

  // ---------------- Bloque 4 · Taller
  { name: 'Cortocircuito', colors: 5, moves: 22, goals: [{ type: 'burnt' }], tune: 'moves', target: 0.82, tip: 'burnt',
    layout: ['........', '........', '..b..b..', '.b.BB.b.', 'bb.bb.bb', '.b....b.', '........', '........'],
    text: 'Algo hizo humo. Los componentes quemados no se mueven: rompelos con líneas al lado o con especiales.' },
  { name: 'Cinta kapton', colors: 6, moves: 22, goals: [{ type: 'locks' }], tune: 'moves', target: 0.74, tip: 'locks',
    layout: ['........', '........', '.k.k.k..', '..k.k.k.', '.k.k.k..', '..k.k.k.', '........', '........'],
    text: 'Piezas fijadas con cinta kapton. No se pueden mover, pero podés incluirlas en una línea para despegarlas.' },
  { name: 'Placa dañada', colors: 6, moves: 26, goals: [{ type: 'burnt' }], tune: 'moves', target: 0.66, tip: 'burnt2',
    layout: ['xx....xx', 'x......x', '..BBBB..', '.B....B.', '.B....B.', '..BBBB..', 'x......x', 'xx....xx'],
    text: 'Placa rota y componentes carbonizados. Los que tienen carcasa necesitan dos golpes.' },
  { name: 'Reparación urgente', colors: 6, time: 120, goals: [{ type: 'burnt' }], tune: 'time', target: 0.58,
    layout: ['........', '........', '........', 'bb.bb.bb', '........', '........', 'bb.bb.bb', '........'],
    text: 'El equipo tiene que salir hoy. Contrarreloj: sacá todos los quemados.' },
  { name: 'Fuente quemada', colors: 6, moves: 30, goals: [{ type: 'burnt' }, { type: 'pads' }], tune: 'moves', target: 0.5,
    layout: ['........', '.k.kk.k.', '..BBBB..', '.11BB11.', '.11..11.', '..bbbb..', '.k.kk.k.', '........'],
    text: 'Jefe del bloque: limpiar lo quemado y volver a soldar.' },

  // ---------------- Bloque 5 · Válvulas
  { name: 'Tríodo', colors: 5, moves: 20, goals: [{ type: 'tubes', n: 2 }], tubes: { n: 2, max: 1 }, tune: 'moves', target: 0.76, tip: 'tubes',
    text: 'Antes de los transistores estaban las válvulas. Bajalas hasta el zócalo, en la fila de abajo.' },
  { name: 'Radio a válvulas', colors: 5, moves: 26, goals: [{ type: 'tubes', n: 3 }], tubes: { n: 3, max: 2 }, tune: 'moves', target: 0.66,
    layout: ['........', '........', '........', '...xx...', '...xx...', '........', '........', '........'],
    text: 'La radio del abuelo. Tres válvulas al zócalo.' },
  { name: 'Amplificador valvular', colors: 5, moves: 26, goals: [{ type: 'tubes', n: 3 }, { type: 'collect', color: 3, n: 20 }], tubes: { n: 3, max: 2 }, tune: 'moves', target: 0.58,
    text: 'Para un sonido cálido hacen falta válvulas y un buen transformador de salida, o sea, bobinas.' },
  { name: 'Theremin', colors: 6, time: 75, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.52,
    text: 'Se toca sin tocarlo. Contrarreloj de puntos: aprovechá las cascadas.' },
  { name: 'Transmisor AM', colors: 5, moves: 30, goals: [{ type: 'tubes', n: 4 }, { type: 'pads' }], tubes: { n: 4, max: 2 }, tune: 'moves', target: 0.46,
    layout: ['........', '........', '........', '........', '.111111.', '.111111.', '........', '........'],
    text: 'Jefe del bloque: válvulas de potencia y dos filas de pads por soldar.' },

  // ---------------- Bloque 6 · Prototipo final
  { name: 'Contador binario', colors: 7, moves: 26, goals: [{ type: 'collect', color: 6, n: 18 }, { type: 'collect', color: 4, n: 18 }], tune: 'moves', target: 0.6, tip: 'color7',
    text: 'Un cristal de cuarzo marca el ritmo y los chips cuentan. Es el último componente nuevo: con él ya conocés los siete.' },
  { name: 'Display 7 segmentos', colors: 6, moves: 28, goals: [{ type: 'pads' }], tune: 'moves', target: 0.52,
    layout: ['..2222..', '.2....2.', '.2....2.', '..1111..', '.2....2.', '.2....2.', '..2222..', '........'],
    text: 'Siete segmentos y un 8 entero por soldar.' },
  { name: 'Sintetizador', colors: 7, time: 90, goals: [{ type: 'score', n: 0 }], tune: 'score', target: 0.45,
    text: 'Osciladores, filtros y envolventes. Contrarreloj con siete componentes en la mesa.' },
  { name: 'Osciloscopio', colors: 5, moves: 30, goals: [{ type: 'burnt' }, { type: 'locks' }, { type: 'tubes', n: 2 }], tubes: { n: 2, max: 1 }, tune: 'moves', target: 0.4,
    layout: ['........', '........', '........', 'b.b..b.b', '.k.kk.k.', '........', '........', '........'],
    text: 'El instrumento para ver las señales. Quemados, cinta y válvulas a la vez.' },
  { name: 'Computadora de 8 bits', colors: 5, moves: 32, goals: [{ type: 'pads' }, { type: 'burnt' }, { type: 'tubes', n: 2 }], tubes: { n: 2, max: 1 }, tune: 'moves', target: 0.34,
    layout: ['........', '.2.BB.2.', '.2....2.', '...11...', '...11...', '.2....2.', '.2.bb.2.', '........'],
    text: 'El proyecto final: todo lo aprendido en una sola placa.' },
];

const BLOCKS = [
  { name: 'Protoboard', desc: 'Lo básico' },
  { name: 'Integrados', desc: 'Más componentes' },
  { name: 'Soldadura', desc: 'Pads de cobre' },
  { name: 'Taller', desc: 'Quemados y cinta' },
  { name: 'Válvulas', desc: 'Bajar al zócalo' },
  { name: 'Prototipo final', desc: 'Todo junto' },
];

if (typeof module !== 'undefined' && module.exports) module.exports = { LEVELS, BLOCKS };
else { root.LEVELS = LEVELS; root.BLOCKS = BLOCKS; }
})(typeof window !== 'undefined' ? window : this);
