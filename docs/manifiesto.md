# Manifiesto, reglas y niveles

Qué es Fogonazo, cómo se juega y por qué camino avanza. Ante una duda de diseño, se resuelve contra este documento. Las decisiones puntuales, con su fecha y su motivo, están en el [registro de decisiones](decisiones.md); las reglas de interfaz, dibujos, sonido y música, en la guía de estilo, al principio del CSS de `codigo/page.html`.

## Qué es Fogonazo

Un juego de juntar tres para el celular, con componentes electrónicos en pixel art. Se juega sobre una placa de 8 × 10 (8 columnas por 10 filas) y tiene 30 niveles con nombres de circuitos reales, de un LED que titila a una computadora de 8 bits, y un modo zen para jugar sin límite. Es parte de un proyecto más amplio: hacer juegos simples, divertidos y visualmente atractivos.

Lo que se acordó al empezar, y vale para todo el juego:

1. **Pensado para el celular**: se juega deslizando o tocando las piezas, con el teléfono en vertical.
2. **Mixto**: niveles por movimientos y niveles contrarreloj.
3. **Electrónica de verdad**: los componentes, los nombres de los niveles y los textos son técnicamente correctos.
4. **Dificultad en oleadas**: cada bloque de cinco niveles arranca más fácil, con algo nuevo, y desde el segundo termina en un nivel «jefe». El nivel 30 se gana en unos pocos intentos.
5. **Dos consolas**: 8 bits, el estilo por defecto, y 16 bits como alternativa. El estilo cambia todo: dibujos, interfaz, tipografía, música y efectos.
6. **Textos amenos**, en voseo rioplatense, sin errores ni redundancias.

La meta de desarrollo es la **versión 1.0.0**: estable y revisada, sin pendientes ni dudas.

## Reglas

### Componentes

En orden de aparición: resistencia (naranja), capacitor electrolítico (azul), LED (rojo), bobina toroidal (verde) y chip (violeta) desde el nivel 1; capacitor cerámico (amarillo) desde el 6; cristal de cuarzo (plateado) desde el 26.

### Cómo se juega

Se desliza una pieza hacia su vecina, o se toca una y después la otra. Si quedan tres o más iguales en línea, o cuatro en un cuadrado de 2 × 2, se eliminan y caen piezas nuevas. Hay que cumplir el pedido del nivel antes de quedarse sin movimientos o sin tiempo. Los niveles de puntaje se juegan hasta el final; los de pedido terminan al cumplirlo.

### Especiales

- **Rayo** (4 en línea): barre la fila o la columna que marcan las flechas, perpendicular a la línea que lo armó: cuatro en vertical dan un rayo que barre la fila.
- **Sobrecarga** (línea en L o en T): explota en rombo, con radio 2.
- **Batería** (5 en línea): intercambiada con un componente, elimina todos los de ese tipo; tocada, los del tipo que más hay.
- **Antena** (cuadrado de 2 × 2): rompe sus cuatro vecinas y transmite a un blanco, que elige sola: primero lo que pide el nivel (quemados, cinta, pads), después piezas de un color del pedido, después la pieza que está debajo de una válvula y, si no, una al azar.

Si una jugada forma más de un especial, gana el de mayor rango: batería > sobrecarga > rayo > antena. Los especiales se activan al eliminarlos en una línea, cuando los alcanza otra explosión, al intercambiarlos con otro especial o **tocándolos**: el toque cuenta como un movimiento.

Combinaciones: rayo + rayo (cruz), rayo + sobrecarga (3 filas y 3 columnas), sobrecarga + sobrecarga (5 × 5), batería + especial (convierte en ese especial todo el color y lo dispara), batería + batería (toda la placa), antena + antena (tres transmisiones), antena + rayo o sobrecarga (lo lleva al blanco y lo activa ahí).

### Obstáculos y pedidos

- **Pads de cobre**: se sueldan con una línea encima o con un especial. Los de remaches necesitan dos pasadas.
- **Quemados**: no se mueven ni dejan pasar lo que cae. Se rompen con líneas al lado o con especiales; los de carcasa metálica, con dos golpes.
- **Cinta kapton**: la pieza encintada no se mueve ni deja pasar lo que cae. Se despega incluyéndola en una línea.
- **Huecos**: la placa puede tener celdas cortadas; las piezas los atraviesan al caer.
- **Válvulas**: hay que bajarlas hasta la fila de abajo (el zócalo). Bajan solo cuando desaparecen las piezas que tienen debajo, y caen siempre derecho, nunca en diagonal. Se intercambian como cualquier pieza, solo si el cambio forma una línea. Aparecen en columnas sin obstáculos fijos hasta el zócalo; si no hay ninguna (nivel 29), en cualquiera, y esperan sobre el obstáculo hasta que se rompe.

### Caída

Las piezas bajan de a un casillero y las nuevas entran solo por arriba. Un lugar tapado por un quemado o una cinta se llena en diagonal, a 45°, con una pieza de una columna vecina, que se repone desde arriba. Un lugar sin camino desde arriba, ni derecho ni en diagonal, queda vacío hasta que se rompa lo que lo tapa; no se puede mover una pieza a un lugar vacío.

### Estrellas y bonus

Una estrella por cumplir el pedido; dos y tres según el puntaje. Al cumplir el pedido, cada movimiento que sobra (o cada 5 segundos) se convierte en un rayo de bonus. En los niveles de puntaje, al terminar explotan los especiales que quedaron en la placa.

Hay tres modos de dificultad, que se eligen en Ajustes: Fácil, Normal (el de entrada) y Difícil. Una estrella vale lo mismo en cualquier modo, pero cada modo guarda sus propias estrellas y récords; el mapa muestra las del modo elegido y el total suma lo mejor de cada nivel. Tocando el total se ven las de cada modo. Un nivel que se pasó en cualquier modo queda abierto en todos.

### Modo zen

Una placa libre, sin obstáculos, con los seis primeros componentes y todos los especiales. No hay límite de movimientos ni de tiempo: un reloj cuenta cuánto lleva la partida y el puntaje sube hasta que el jugador termina desde la pausa. Si no quedan jugadas, la placa se rebaraja sola. El encargo es optativo: un pedido de un componente, de 12 a 20 piezas, que al cumplirse suma 500 puntos y se renueva con otro componente. Se guardan dos récords, el de puntos (la mejor partida) y el de tiempo (la más larga). No da estrellas y es igual en todos los modos de dificultad. La definición está en `ZEN`, en `codigo/levels.js`.

### Ayuda de piezas del pedido

En los niveles que piden piezas, una parte de las piezas nuevas sale de los colores que todavía faltan: 0,14 × (tipos que faltan ÷ tipos en la mesa). Con un solo tipo pedido, la ayuda es menor. No cambia los movimientos ni el tiempo.

## Niveles

La lista vigente vive en el código: los niveles en `codigo/levels.js` y sus movimientos, tiempos y metas en `codigo/calibrated.json`. Este resumen explica su lógica; si alguna vez no coinciden, manda el código y se corrige este documento.

| Bloque | Qué suma | Niveles | Jefe |
|---|---|---|---|
| 1 · Protoboard | Lo básico: líneas, especiales, primer contrarreloj | 1 Blink · 2 Divisor de tensión · 3 Filtro RC · 4 Puente rectificador · 5 Multivibrador astable ⏱ | — |
| 2 · Integrados | El capacitor cerámico (sexto componente) | 6 Timer 555 · 7 Regulador 7805 · 8 Flip-flop · 9 Generador PWM ⏱ · 10 Fuente lineal | 10: tres pedidos a la vez |
| 3 · Soldadura | Pads de cobre, con una y dos pasadas | 11 Pistas de cobre · 12 Plaqueta perforada · 13 Doble faz · 14 Soldadura por ola ⏱ · 15 Montaje SMD | 15: pads chicos de doble pasada |
| 4 · Taller | Quemados, cinta y huecos | 16 Cortocircuito · 17 Cinta kapton · 18 Placa dañada · 19 Reparación urgente ⏱ · 20 Fuente quemada | 20: quemados, cinta y pads |
| 5 · Válvulas | Válvulas que bajan al zócalo | 21 Tríodo · 22 Radio a válvulas · 23 Amplificador valvular · 24 Theremin ⏱ · 25 Transmisor AM | 25: cuatro válvulas y pads |
| 6 · Prototipo final | El cristal de cuarzo (séptimo componente) y todo junto | 26 Contador binario · 27 Display 7 segmentos · 28 Sintetizador ⏱ · 29 Osciloscopio · 30 Computadora de 8 bits | 30: pads, quemados y válvulas |

⏱ contrarreloj. Hay 24 niveles por movimientos y 6 contrarreloj (5, 9, 14, 19, 24 y 28). Los niveles de puntaje son el 1, 2, 5, 8, 24 y 28; el resto pide piezas, pads, quemados, cinta o válvulas.

## Dificultad

Se calibra con un bot que juega imperfecto: elige la mejor jugada el 62 % de las veces, la segunda el 20 % y cualquiera el 18 %. En contrarreloj piensa entre 1,7 y 3,1 segundos por jugada. Con 400 partidas por nivel se eligen los movimientos, el tiempo o la meta de puntos para la tasa de victoria que pide cada nivel (`target` en `codigo/levels.js`), que baja en oleadas: de 97 % en el nivel 1 a 34 % en el 30. Un bot que siempre elige la mejor jugada gana apenas un poco más (nivel 30: 46 % contra 41 %).

Esa calibración es la del modo Difícil. Normal y Fácil multiplican los movimientos (o el tiempo) y los puntos de cada estrella, y en los niveles de puntaje también la meta: Normal da 12 % más de movimientos y pide 10 % menos de puntos; Fácil, 30 % más y 20 % menos (`MODES` en `codigo/levels.js`). Con 100 partidas por nivel y modo (`node herramientas/modos.js`), el bot gana en promedio el 71 % de las partidas en Difícil, el 82 % en Normal y el 90 % en Fácil, y llega a dos estrellas o más en el 35 %, el 54 % y el 76 %.

La tasa del bot es una guía, no la última palabra: en los niveles de pedido de piezas una persona rindió por debajo del bot, y por eso se agregó la ayuda de piezas. Manda cómo se siente el nivel en el teléfono. Cómo se recalibra está en [CONTRIBUTING.md](../CONTRIBUTING.md#dificultad).
