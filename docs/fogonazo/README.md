# Fogonazo

Un juego de juntar tres con componentes electrónicos, el primero de la colección. Se juega en horizontal, sobre una placa de 10 × 8 (10 columnas por 8 filas), en el banco de electrónica de la sala visto de cerca. Tiene un camino continuo de niveles, los 30 primeros hechos a mano y los siguientes generados sin fin, y un modo zen para jugar sin límite. El nombre puede cambiar.

Cómo se ve y cómo suena está en la [guía de estilo](../estilo.md#fogonazo); por qué se decidió cada cosa, en el [registro de decisiones](../decisiones.md#fogonazo). Ante una duda de diseño del juego, se resuelve contra este documento.

Lo que vale para todo el juego:

1. **Mixto:** niveles por movimientos y niveles contrarreloj.
2. **Electrónica de verdad:** los componentes son técnicamente correctos, y el sabor de electrónica real está en las piezas, el banco y el manual.
3. **Dificultad en oleadas:** tramos exigentes y respiros. El nivel 30 se gana en unos pocos intentos.

## Estado

- **Jugable en la app desde la 0.4.0:** la partida real, con el motor y los 30 niveles hechos a mano, los especiales, los obstáculos, las válvulas, la nota de cuaderno, el contrarreloj y el zen (ver «Cómo está hecho»). De la 0.1.0 a la 0.3.1 fue una maqueta navegable, con una lógica mínima propia.
- **Arte vigente**, en [`arte/`](arte/): las siete piezas ([P-003](arte/P-003_piezas-fogonazo.jpg)), la escena de la pantalla-instrumento ([P-004](arte/P-004_escena-instrumento.png), de 1679 × 937; el teléfono la estira un 43 %, aceptable por el estilo pintado) y los especiales y obstáculos ([P-005](arte/P-005_especiales-obstaculos.jpg)). Los recortes listos para usar están en [`fogonazo/piezas/`](../../fogonazo/piezas/), en la app.
- **El motor** (`codigo/`) ya está en la placa de 10 × 8, con los 30 niveles hechos a mano pasados a horizontal, sin nombres ni textos, y recalibrados (0.3.0); la partida lo usa desde la 0.4.0.
- **Estrellas con umbrales a la vista y ayuda de piezas por dificultad, desde la 0.12.0** (S-28): ver «Dificultad, estrellas y récords».
- **Cada dificultad con su propia curva, desde la 0.13.0.** Producto la jugó (4/11): las oleadas se sienten en los tres modos y no pide ajustes, tampoco en los niveles que más se apartan de lo buscado (el 23 en Difícil y el 14, el 29 y el 30).
- **Los generados, del 31 en adelante, sin fin, desde la 0.9.0:** el generador y su fórmula en `codigo/levels.js` y el mapa sin tope (ver «Niveles: un camino continuo»). Los pasos que siguen están en [la colección](../coleccion.md#lo-que-sigue).

## Recorrido

```
Sala ── banco de electrónica ──► pantalla-instrumento
                                    ├── Niveles ──► mapa ──► partida
                                    ├── Zen ─────────────► partida
                                    ├── Dificultad y Récords
                                    ├── Manual (la revista de la pared)
                                    └── Sonido (la placa con el parlante)
```

- **Se entra directo** a la pantalla-instrumento: no hay pantalla de título aparte.
- **El «atrás» de Android:** de la partida a la pausa; de la pausa al mapa (o a la pantalla-instrumento, si era zen); del mapa a la pantalla-instrumento, y de ahí a la sala.
- **«◀ Volver»**, abajo a la derecha en cada pantalla: en la partida va directo al mapa, sin pasar por la pausa.

## La pantalla-instrumento

La portada del juego y su lugar de ajustes: un osciloscopio del banco visto de cerca, con la pantalla verde fósforo que muestra y las perillas que eligen.

- **Perilla «Modo»:** Niveles (con el nivel siguiente a la vista; tocar la pantalla abre el mapa), Zen y Récords.
- **Perilla «Dificultad»:** Fácil, Normal y Difícil.
- **Récords** de la dificultad elegida en la perilla (S-26): el nivel más alto superado y las estrellas ganadas, con el aviso de que el avance vive en Chrome. También los récords del zen.
- **La perilla «Modo» queda donde se la dejó**, también al volver de una partida.
- **Sonido:** la placa con el parlante abre los ajustes de música y efectos, los mismos de toda la colección.
- **Manual:** la revista pegada en la pared, «Proyecto Nº 21», en dos hojas: cómo se juega, y los especiales con sus combinaciones.
- **«◀ Volver»**, abajo a la derecha, vuelve a la sala.

## Niveles: un camino continuo

Una sola secuencia numerada, sin capítulos, nombres ni textos por nivel, como en Candy Crush.

- **Del 1 al 30, hechos a mano.** Son los 30 niveles del Fogonazo publicado, pasados de 8 × 10 a 10 × 8 y recalibrados (ver «Cómo se pasaron a horizontal»). Conservan su progresión: enseñan cada componente, especial y obstáculo en orden, con las oleadas de dificultad (ver la tabla).
- **Del 31 en adelante, generados.** Cada nivel sale de su número, que fija una semilla y su lugar en la curva de dificultad: el nivel 57 es siempre el mismo para cualquiera, y reintentarlo es jugar el mismo nivel. No hay último nivel. No traen mecánicas nuevas: combinan lo que ya existe (tipo de pedido, obstáculos, forma de la placa y huecos, movimientos o contrarreloj).
- **La curva** sigue en oleadas, en bloques de cinco como del 1 al 30: cada bloque arranca amable y cierra con un nivel exigente. Baja de a poco hasta una meseta cercana a la dificultad de los niveles 26 a 30, para que nunca se vuelva imposible: en Difícil, la tasa de victoria buscada va de 62 % a 38 % dentro del bloque, y **uno de cada dos bloques es un respiro**, 8 puntos más fácil, para que se note en una sesión de 5 a 10 niveles. Del 31 al 50, una rampa suma unos puntos más.
- **Contrarreloj:** uno de cada cinco, también en los generados: el cuarto de cada bloque.
- **Qué pide cada nivel:** en cada bloque, tres pedidos simples distintos (piezas, pads, quemados, cinta o válvulas; a veces puntaje), el contrarreloj y el cierre, con dos pedidos o, desde el nivel 46, a veces tres. La placa, simétrica de izquierda a derecha, con las reglas de los hechos a mano: pads lejos del borde de abajo y de las esquinas, quemados siempre con pasos entre sí y huecos solo en las esquinas o en el centro. Seis componentes, siete en algunos de los difíciles y cinco con válvulas.
- **Calibración con una fórmula, sin calibrar nivel por nivel:** los movimientos, el tiempo, las metas de puntos y las estrellas de cada generado, en cada modo, salen de `GEN`, en `codigo/levels.js`, ajustada con el bot persona sobre una muestra (`herramientas/generados.js`). El teléfono no simula nada. Cada modo busca su propia tasa, como los hechos a mano (0.13.0), y la ayuda de piezas de Normal y Fácil acorta en la fórmula lo que cuesta juntar piezas (`ayudaPiezas`). Medidos del 31 al 120 (0.17.0), el bot persona gana en promedio el 57 % en Difícil, el 72 % en Normal y el 84 % en Fácil; en Difícil, cada nivel se aparta de su tasa unos 9 puntos (mediana), algunos bastante más, y ninguno es imposible (el más duro, el 120: 5 %, 13 % y 30 %). Llega a dos estrellas o más en el 32 %, el 49 % y el 69 % de las partidas, y a tres en el 11 %, el 22 % y el 38 %. Producto prefirió esto a calibrar uno por uno (31/10).
- **Agregar un nivel a mano** más adelante es insertarlo en la lista; los generados se corren detrás.
- **Novedades:** cada componente, especial u obstáculo aparece por primera vez en un nivel puntual. Esa primera vez, junto a la placa hay una nota de cuaderno que explica el movimiento de la forma más simple. Lo que presenta cada nivel está en `tip`, en `codigo/levels.js`.

| Niveles | Qué suma | Contrarreloj | Cierre |
|---|---|---|---|
| 1 a 5 | Lo básico: el intercambio (1), el rayo (2), la antena (3), la sobrecarga (4) y la batería (5) | 5 | — |
| 6 a 10 | El capacitor cerámico, sexto componente (6) | 9 | 10: tres pedidos a la vez |
| 11 a 15 | Pads de cobre (11), con dos pasadas (13) | 14 | 15: pads chicos de doble pasada |
| 16 a 20 | Quemados (16), cinta kapton (17), quemados de dos golpes y huecos (18) | 19 | 20: quemados, cinta y pads |
| 21 a 25 | Válvulas que bajan al zócalo (21) | 24 | 25: cuatro válvulas y pads |
| 26 a 30 | El cristal de cuarzo, séptimo componente (26), y todo junto | 28 | 30: pads, quemados y válvulas |

Hay 24 niveles por movimientos y 6 contrarreloj. Los de puntaje son el 1, 2, 5, 8, 24 y 28; el resto pide piezas, pads, quemados, cinta o válvulas. La lista vigente vive en el código (`codigo/levels.js` y `codigo/calibrated.json`); si no coincide con esta tabla, manda el código.

### Cómo se pasaron a horizontal

- **Las filas siguen siendo filas.** La placa no se giró: las piezas caen igual y la fila de abajo sigue siendo el zócalo de las válvulas, así que los diseños pensados contra el borde inferior se conservan.
- **Ocho filas en lugar de diez.** Las dos filas que se habían sumado arriba para la placa de 8 × 10 se sacan; los diseños más altos se reacomodaron en ocho filas.
- **Diez columnas en lugar de ocho.** Los diseños se centran con una columna libre de cada lado, o se estiran para conservar la cantidad de pads, quemados o cintas. Piden lo mismo que antes, salvo el 16 (de 16 a 22 golpes de quemado, porque en horizontal bajaba a 9 movimientos) y el 27 (el ocho del display queda más ancho: de 44 a 46 pasadas de estaño).
- **Recalibrados con el bot**, con las mismas tasas de victoria buscadas. Los movimientos quedaron parecidos a los de antes: la mayoría igual o con uno a tres más, y los niveles más cortos siguen entre 11 y 15.

### El mapa

Un camino continuo en horizontal que se recorre deslizando, con el nivel siguiente siempre a la vista: una señal medida sobre hoja milimetrada. Muestra los niveles jugados con sus estrellas y unos pocos por delante; como no hay último nivel, se va armando a medida que se avanza. Se juega el nivel siguiente o se repite uno pasado.

## Dificultad, estrellas y récords

- **Tres modos:** Fácil, Normal (el de entrada) y Difícil, que se eligen en la pantalla-instrumento.
- **Cada modo, su tasa de victoria** (desde la 0.13.0). Cada nivel tiene una tasa buscada para Difícil (`target` en `codigo/levels.js`), que baja en oleadas: de 97 % en el nivel 1 a 34 % en el 30. Normal recorta el 40 % de lo que a Difícil le falta para ganar siempre, y Fácil el 70 % (`recorte` en `MODES`): un nivel de 34 % en Difícil busca 60 % en Normal y 80 % en Fácil; uno de 70 %, 82 % y 91 %. Así las oleadas se conservan en los tres modos.
- **Qué se calibra en cada modo:** en los de pedido, los movimientos o el tiempo; en los de puntos, la primera meta (las movidas o el tiempo son los mismos en los tres). El bot persona (ver más abajo) juega 400 partidas por nivel y modo, con la ayuda de piezas del modo. En contrarreloj se calibra pensando un 50 % más lento que lo medido (`MARGEN_RELOJ`, en `codigo/persona.js`), porque ahí la velocidad pesa más que el criterio y el modelo copia la de un solo jugador: el tiempo no queda justo para otras personas, y a quien juega rápido le resulta más fácil que la tasa buscada. Un modo más fácil nunca da menos movimientos ni pide una meta más alta que uno más difícil: en los de piezas, la ayuda sola ya los acerca a la tasa buscada, y sin ese piso Fácil daría menos movimientos que Difícil.
- **Estrellas con umbrales a la vista** (desde la 0.12.0, S-28). Una sola regla: el nivel termina cuando ya no hay nada más que ganar.
  - **De pedido** (piezas, pads, quemados, cinta, válvulas): termina al completarlo, y las estrellas salen de en cuántas movidas se completó (en contrarreloj, en cuánto tiempo). La nota dice la cantidad máxima de movidas para cada estrella («★★★ en 11 movidas», «★★ en 16», «★ en 22», que es el límite) y tacha en vivo las que ya no se alcanzan. El bonus final suma puntos, no estrellas.
  - **De puntos:** tres metas a la vista en la nota «Metas», que se tildan al alcanzarlas. Se juega hasta la tercera o hasta quedarse sin movidas o tiempo; se gana con la primera. El bonus del final (las movidas que sobran y los especiales que quedaron) puede alcanzar la estrella siguiente.
  - **Cada modo tiene sus umbrales**, calibrados con el bot persona para que, de las partidas que gana, lleguen a dos estrellas o más la mitad en Difícil, el 65 % en Normal y el 80 % en Fácil, y a tres el 15 %, el 25 % y el 40 % (`reparto`, en `MODES`). En los 30 hechos a mano, cada nivel se aparta de la tasa de su modo unos 2 a 3 puntos en promedio; los que más, el 20 en Fácil y el 29 en Normal y Difícil (9 o 10 puntos), porque los movimientos van de a uno. Con otras 150 partidas por nivel y modo (`herramientas/modos.js`), el bot persona gana el 69 % en Difícil, el 82 % en Normal y el 91 % en Fácil; llega a dos estrellas o más en el 34 %, el 54 % y el 72 % de las partidas, y a tres en el 11 %, el 20 % y el 36 %.
  - **Valen lo mismo en cualquier modo**, y cada modo guarda las suyas. El avance de los niveles arrancó de cero con este sistema y vuelve a hacerlo con la recalibración de la 0.17.0; la dificultad elegida y los récords del zen se conservan.
- **Un camino por dificultad** (desde la 0.11.0, S-26): cada modo tiene su próximo nivel, que es el primero que no se pasó en ese modo contando desde el 1, y su mapa con sus estrellas. Pasar un nivel en un modo no lo abre en los otros. El mapa dice en el sticker la dificultad y las estrellas conseguidas en ella.
- **Récords por modo:** el nivel más alto superado de corrido desde el 1, que es el récord principal, y todas las estrellas ganadas en ese modo.
- **El bot persona** (desde la 0.17.0, `codigo/persona.js`), con el que se calibra todo. El bot de siempre prueba cada jugada con sus cascadas y saca más estrellas que una persona: con el registro de partidas (ver [colección](../coleccion.md#registro-de-partidas)), Producto coincidió con su mejor jugada solo el 21 % de las veces, y en los niveles con movidas ganó el 74 % de los intentos contra el 81 % que esperaba el bot, y llegó a dos estrellas o más en el 43 % contra el 54 %. El bot persona elige como una persona: describe cada jugada por lo que se ve en el tablero (lo que pasa en el primer golpe, qué tan cerca cae de lo que falta, qué tan abajo está, los especiales, si saca piezas debajo de una válvula) y elige al azar con un modelo logit cuyos pesos salen de las movidas reales (`herramientas/persona.js ajustar`). Con datos que no vio, acierta la jugada exacta el 33 % de las veces (el bot de siempre, el 21 %). Como sus jugadas «no óptimas» son peores que las de una persona, elige con una temperatura de decisión (2) ajustada contra los resultados reales (`comparar`). Piensa lo que pensó Producto (mediana 1,1 s contra reloj, 1,75 s con movidas; el bot de siempre, 1,7 a 3,1 s), y si piensa más de lo que tarda la pista, la ve y la sigue la mitad de las veces. Verificado con 46 intentos que no vio (8/11, Normal del 25 al 38 y generados): acierta la jugada el 36 % (el bot de siempre, el 24 %); en resultados, sin ventaja clara en esa muestra chica. Reajustado con los 151 intentos (2540 decisiones; los pesos casi no cambiaron): en los niveles con movidas gana el 73 % (real 73 %, bot de siempre 78 %), llega a dos estrellas en el 46 % (real 47 %, 52 %) y a tres en el 19 % (real 16 %, 23 %); en contrarreloj, 85 % (real 96 %, 79 %). Lo que no reproduce: del 11 al 20 gana más que Producto en las dos muestras (89 % contra 81 %) y en los generados, menos (80 % contra 91 %; el bot de siempre, 76 %). Es un solo jugador.
- **Los registros usados** quedan en [`registros/`](registros/), tal como se exportaron. La 0.17.0 se calibró con `registro-2026-11-08-2115.json` (153 partidas de Fogonazo de Producto, jugadas en la 0.16.0): con ese archivo se puede repetir el ajuste (`node herramientas/persona.js ajustar docs/fogonazo/registros/registro-2026-11-08-2115.json`). Cada registro exportado trae toda la historia del teléfono, hasta el tope: alcanza con guardar el último de cada calibración.
- **Cómo se recalibra**, cuando cambia una regla del motor o el diseño de un nivel: `herramientas/probar.js` tiene que pasar sin errores; `herramientas/medir.js <niveles>` muestra cuánto cambió la tasa de victoria en Difícil; si se apartó de lo buscado, `herramientas/calibrar.js 400 <niveles>` recalibra el límite y las estrellas de los tres modos y actualiza `codigo/calibrated.json` (con `--estrellas`, deja el límite y rehace solo las estrellas), y `herramientas/modos.js 100 <niveles>` lo controla con otras partidas. Los cambios se cuentan en el registro de cambios y, si importan, en el de decisiones.
- **Los generados**, si cambia una regla del motor o del generador: `herramientas/probar.js` también juega los del 31 al 90 y revisa las metas y las estrellas hasta el 1000; `herramientas/generados.js datos 31 90 100` juega la muestra con el bot persona, `ajustar` propone los valores de la fórmula, `medir 31 90 100` muestra cómo quedan en los tres modos y `estrellas` propone las estrellas de cada modo. Cambiar la fórmula cambia niveles que alguien quizás ya pasó: conviene hacerlo poco y contarlo en el registro de cambios.

## Reglas

### Componentes

En orden de aparición: resistencia, capacitor electrolítico, LED, bobina toroidal y chip desde el nivel 1; capacitor cerámico desde el 6; cristal de cuarzo desde el 26.

### Cómo se juega

Se desliza una pieza hacia su vecina, o se toca una y después la otra. Si quedan tres o más iguales en línea, o cuatro en un cuadrado de 2 × 2, se eliminan y caen piezas nuevas. Hay que cumplir el pedido del nivel antes de quedarse sin movimientos o sin tiempo, y termina al cumplirlo. Los de puntos se juegan hasta la tercera meta o hasta quedarse sin movimientos o tiempo, y se ganan con la primera (desde la 0.12.0; ver «Estrellas con umbrales a la vista»).

### Especiales

- **Rayo** (4 en línea): barre la fila o la columna que marcan las flechas, perpendicular a la línea que lo armó: cuatro en vertical dan un rayo que barre la fila.
- **Sobrecarga** (línea en L o en T): explota en rombo, con radio 2.
- **Batería** (5 en línea): intercambiada con un componente, elimina todos los de ese tipo; tocada, los del tipo que más hay.
- **Antena** (cuadrado de 2 × 2): rompe sus cuatro vecinas y transmite a un blanco, que elige sola: primero lo que pide el nivel (quemados, cinta, pads), después piezas de un color del pedido, después la pieza que está debajo de una válvula y, si no, una al azar.

Si una jugada forma más de un especial, gana el de mayor rango: batería > sobrecarga > rayo > antena. Los especiales se activan al eliminarlos en una línea, cuando los alcanza otra explosión, al intercambiarlos con otro especial o **tocándolos**: el toque cuenta como un movimiento.

Combinaciones: rayo + rayo (cruz), rayo + sobrecarga (3 filas y 3 columnas), sobrecarga + sobrecarga (5 × 5), batería + especial (convierte en ese especial todo el color y lo dispara), batería + batería (toda la placa), antena + antena (tres transmisiones), antena + rayo o sobrecarga (lo lleva al blanco y lo activa ahí).

### Obstáculos y pedidos

- **Pads de cobre:** se sueldan con una línea encima o con un especial. Los de remaches necesitan dos pasadas.
- **Quemados:** no se mueven ni dejan pasar lo que cae. Se rompen con líneas al lado o con especiales; los de carcasa metálica, con dos golpes.
- **Cinta kapton:** la pieza encintada no se mueve ni deja pasar lo que cae. Se despega incluyéndola en una línea.
- **Huecos:** la placa puede tener celdas cortadas; las piezas los atraviesan al caer.
- **Válvulas:** hay que bajarlas hasta la fila de abajo, el zócalo. Bajan solo cuando desaparecen las piezas que tienen debajo, y caen siempre derecho, nunca en diagonal. Se intercambian como cualquier pieza, solo si el cambio forma una línea. La partida arranca con una, y las siguientes aparecen con las jugadas, aunque la anterior todavía esté bajando: nunca dos en la misma jugada, con al menos 3 jugadas entre una y otra y como mucho dos a la vez en la placa. Pasadas esas 3 jugadas, cada jugada tiene un 35 % de traer la siguiente; si la placa quedó sin válvulas, aparece seguro. Caen desde arriba, por una de las columnas que se rellenan en esa jugada, de preferencia distinta de la anterior y sin otra válvula, siempre en columnas sin obstáculos fijos hasta el zócalo; si no hay ninguna (nivel 29), en cualquiera, y esperan sobre el obstáculo hasta que se rompe.

### Caída

Las piezas bajan de a un casillero y las nuevas entran solo por arriba. Un lugar tapado por un quemado o una cinta se llena en diagonal, a 45°, con una pieza de una columna vecina, que se repone desde arriba. Un lugar sin camino desde arriba, ni derecho ni en diagonal, queda vacío hasta que se rompa lo que lo tapa; no se puede mover una pieza a un lugar vacío.

### Bonus

Solo al ganar, igual en todos los niveles: al terminar, cada movimiento que sobra (o cada 5 segundos), hasta 20, se convierte en un especial al azar sobre una pieza común: rayos y bombas como base, antenas de vez en cuando y rara vez una batería, como mucho una por final (`BONUS_MIX`, en `codigo/engine.js`). Explotan, y después explotan los especiales que quedaron en la placa. Los puntos y el vúmetro suben con cada explosión. En los de pedido solo suma puntos; en los de puntos puede alcanzar la estrella siguiente. Al perder no hay bonus ni explosiones.

### Ayuda de piezas del pedido

En los niveles que piden piezas, una parte de las piezas nuevas sale de los colores que todavía faltan. En Difícil, 0,14 × (tipos que faltan ÷ tipos en la mesa): con un solo tipo pedido entre seis, poco más del 2 %. Desde la 0.12.0, Normal y Fácil tienen un piso que no depende de cuántos tipos se piden: el 10 % y el 16 % de las piezas nuevas (`ayuda` en `MODES`). Con eso, el bot completa el pedido de un tipo del nivel 6 en una mediana de 17 movidas en Difícil, 13 en Normal y 12 en Fácil (`herramientas/ayuda_piezas.js`). Por eso, en varios niveles de piezas los tres modos tienen los mismos movimientos: la diferencia la hace la ayuda.

## Modo zen

Una placa libre, sin obstáculos, con los seis primeros componentes y todos los especiales. No hay límite de movimientos ni de tiempo: un reloj cuenta cuánto lleva la partida y el puntaje sube hasta que el jugador termina desde la pausa. Si no quedan jugadas, la placa se rebaraja sola. El encargo es optativo: un pedido de un componente, de 12 a 20 piezas, que al cumplirse suma 500 puntos y se renueva con otro componente. Se guardan dos récords, el de puntos (la mejor partida) y el de tiempo (la más larga). No da estrellas y es igual en todos los modos de dificultad. La definición está en `ZEN`, en `codigo/levels.js`.

## Sonido y guardado

- **En Fogonazo, solo música y efectos;** la lluvia es de la sala. Los volúmenes son los de toda la colección.
- **El avance** (estrellas por nivel y modo, récords del zen, dificultad elegida) vive en Chrome, en el teléfono, sin clave. Ver [la colección](../coleccion.md#guardado).

## Cómo está hecho

Vive en [`fogonazo/`](../../fogonazo/), en la app, y se entra desde la sala por el banco. Cada pantalla dibuja encima de su imagen lo que cambia.

- **Pantalla-instrumento** (`instrumento.html`), sobre la escena del P-004 tal cual, con las medidas de la pantalla, las perillas y los LEDs tomadas sobre ella: las perillas Modo y Dificultad; tocar la pantalla abre el mapa en Niveles y la partida zen en Zen; los récords con el aviso de Chrome; el sonido (perillas que giran con el dedo en círculo y diez LEDs que siguen al dedo, con los volúmenes de toda la colección, sobre la placa de S-16) y el manual de dos hojas (S-15), que siempre abre en la primera. La placa del sonido y la revista tienen aureolas que respiran por turno.
- **Mapa** (`mapa.html`): la señal sobre hoja milimetrada, que se arrastra de costado, sin fin y sin marca en el paso del 30 al 31 (S-24). Abre en el nivel siguiente y dibuja ocho más por delante.
- **Partida** (`partida.html`), con la distribución de S-08c, sobre `codigo/engine.js`, `codigo/levels.js` y `codigo/calibrated.json`, con el modo de dificultad aplicado. La placa se dibuja en un *canvas*: las piezas del P-003 y los especiales y obstáculos del P-005, recortados en [`fogonazo/piezas/`](../../fogonazo/piezas/) (con `herramientas/sala/piezas.py` y `herramientas/sala/obstaculos.py`); las señales de S-10 (flechas del rayo, chispas de la sobrecarga, wifi de la antena), la cinta kapton y los huecos, con código. Cada paso del motor se anima con su misma duración (`Engine.stepDuration`), como en el Fogonazo publicado. Con `?zen=1`, la partida zen.
- **Tres fondos** con el marcador grabado, sin las estrellas del vúmetro, de `herramientas/sala/escena-banco.html` capturado a 915 × 412 con densidad 2,625: `fondo.webp` (`?v=a2&bg=1`), `fondo-tiempo.webp` para el contrarreloj, que solo cambia «MOVIMIENTOS» por «TIEMPO» (`&tiempo=1`), y `fondo-zen.webp`, sin estrellas y con «Encargo» (`&zen=1`).
- **El reloj**, del contrarreloj y del zen, arranca con el primer toque en la placa. Los últimos 10 segundos suenan.
- **La pista:** si nadie toca la placa, después de 5 segundos en los niveles 1 a 3 y de 8 en los demás, se mueven las dos piezas de la mejor jugada (o late el especial que conviene tocar).
- **La nota de cuaderno** (S-08c) sale en el nivel que presenta algo (`tip`): un título, un dibujito en birome y una o dos frases. Los textos están en `NOTAS`, en `partida.html`.
- **La nota del pedido** (S-28): una hoja rayada pegada con cinta sobre la ficha pintada en el fondo (que sigue usando el zen). En los de pedido, lo que se pide, con su dibujo y la cuenta, y debajo en cuántas movidas (o en cuánto tiempo) se gana cada estrella, que se tachan en rojo cuando ya no se alcanzan; en los de puntos, «Metas» con los tres puntajes, tildados al llegar. La arma `buildMetas`, en `partida.html`.
- **El vúmetro:** en los de puntos, con las tres estrellas en sus metas, que se pintan al alcanzarlas; en los de pedido, solo puntos, sin estrellas, con el fondo de escala de cada nivel (`escala`, de la calibración). Las estrellas ya no están pintadas en los fondos: las dibuja la partida.
- **El fin de un nivel:** la etiqueta de control de calidad de S-13. Al ganar, las estrellas se estampan de a una; en pedido, una línea en rojo dice en cuántas movidas (o segundos) se completó, y en puntos, si el bonus alcanzó la estrella siguiente («la tercera, con el bonus», con las estrellas de la jugada y del total). Si hubo bonus, las líneas dicen lo que se hizo jugando, el bonus y el total; al perder, lo que faltó. En el zen, el parte de trabajo, con el sello «Nuevo récord» o, si no lo hubo, «Terminado».
- **Sonido:** Taller suena en el instrumento y el mapa; en la partida, Placa, Urgente en el contrarreloj y Siesta en el zen (la elige la partida con `App.sonido.musica`). Los efectos son los de siempre.
- **Guardado** (`estado.js`), en Chrome: la dificultad, la posición de la perilla Modo, las estrellas y el mejor puntaje de cada nivel en cada dificultad, y los récords del zen, que se anotan en cada jugada y cada 10 segundos. Lleva el número del sistema de estrellas (`v`): si no coincide, el avance de los niveles arranca de cero.
- **Para las herramientas:** `?semilla=n` da siempre el mismo tablero, y `window.__partida` deja ver el estado, jugar una jugada y terminar el nivel sin jugarlo (lo usa `herramientas/capturas.js`).
- **Detalle por revisar:** los rótulos «MOVIMIENTOS» y «PUNTOS» de la partida, pintados en el fondo, son legibles pero justos.

## Bocetos

| Boceto | Qué fija | Estado |
|---|---|---|
| [S-06a](bocetos/S-06a-fogonazo-banco.png) | La partida como el banco visto de cerca: componentes reales sobre una protoboard en el nogal, con display de LED, instrumento de aguja, etiquetas Dymo y el pedido en una ficha |
| S-08 | [a · la escena del instrumento](bocetos/S-08a-fogonazo-escena-instrumento.png), composición para la IA ([versión limpia](bocetos/S-08a-fogonazo-escena-instrumento-limpia.png), sin textos ni contenido de pantalla); [b · el mapa sobre hoja milimetrada](bocetos/S-08b-fogonazo-mapa-milimetrado.png); [c · la partida redistribuida, con la nota](bocetos/S-08c-fogonazo-partida-nota.png) |
| S-09 | Las letras al tamaño del teléfono: [a · instrumento, antes y después](bocetos/S-09a-tipografias-instrumento.jpg), [b · récords](bocetos/S-09b-tipografias-records.jpg). El sonido y el manual como página de revista de este boceto quedaron superados por S-16 y S-15. Las palabras de las perillas, un poco más chicas que en la propuesta |
| S-10 | Especiales y obstáculos en el estilo del banco: [a · especiales en la partida](bocetos/S-10a-especiales-partida.jpg), [b · obstáculos](bocetos/S-10b-obstaculos-partida.jpg), [c · lámina de detalle](bocetos/S-10c-catalogo.jpg). Después se corrigieron la batería (parada, en negro y turquesa) y la antena (sin varilla, con wifi animado) |
| S-12 | «◀ Volver» abajo a la derecha y aureolas: [el instrumento](bocetos/S-12b-instrumento-volver-aureolas.jpg), con las aureolas del parlante y de la revista en su punto más alto (en la app respiran por turno); [el mapa](bocetos/S-12c-mapa-volver.jpg); [la partida](bocetos/S-12d-partida-volver.jpg), donde «Volver» sale al mapa sin pasar por la pausa. Aprobado (27/10) |
| S-13 | La partida real, lo que faltaba: [a · la pausa](bocetos/S-13a-pausa.jpg), una placa de aluminio con sus tornillos y teclas de cinta Dymo (la principal, en cinta roja); [b · nivel ganado](bocetos/S-13b-fin-gano.jpg) y [c · nivel perdido](bocetos/S-13c-fin-perdio.jpg), una etiqueta de control de calidad, con las estrellas y el sello «Aprobada» o «Rechazada» en tinta, y lo que faltó; [d · la partida zen](bocetos/S-13d-partida-zen.jpg), con un reloj en el display, el instrumento sin estrellas y una marca de lápiz rojo en el récord, y el encargo optativo en la ficha; [e · fin del zen](bocetos/S-13e-fin-zen.jpg), un parte de trabajo con puntos, tiempo y récords. Capturas de la maqueta | Aprobado (27/10), sin el hilo que ataba la etiqueta en el boceto: «mejor la tarjeta sola» |
| S-15 | El manual en dos hojas, con el texto nuevo: [a · cómo se juega](bocetos/S-15a-manual-hoja-1.jpg) y [b · las piezas especiales](bocetos/S-15b-manual-hoja-2.jpg). Capturas de la app | Aprobado (29/10) |
| S-16 | [La placa del sonido](bocetos/S-16-placa-sonido.jpg) como la de la ilustración, con las letras oscuras. Captura de la app | Aprobado (29/10), con los componentes ubicados como en la ilustración |
| S-17 | [La nota de cuaderno con letra más grande](bocetos/S-17-nota-nivel-18.jpg), en el nivel 18, el de la nota más larga. Captura de la app | Aprobado (29/10) |
| S-18 | [La batería con siete rayitos de colores](bocetos/S-18a-bateria-rayitos.jpg), uno por componente, girando a su alrededor. Captura de la partida | Aprobado (29/10). *Descartada:* la aureola de colores (b) |
| S-24 | [El mapa sin fin](bocetos/S-24a-mapa-sin-fin.jpg): la señal sigue igual del 30 al 31, sin marca que separe los niveles hechos a mano de los generados. Fija que no hay corte; los números y las estrellas son solo ejemplo | Aprobado (31/10). *Descartada:* una hoja nueva pegada con cinta cada 30 niveles (b) |
| S-26 | [Un camino por dificultad](bocetos/S-26-dificultades.jpg), con capturas de la app y un avance real: cada modo tiene su próximo nivel, su mapa y sus estrellas; los récords muestran solo la dificultad de la perilla (nivel más alto superado y estrellas ganadas); el sticker del mapa, en dos renglones. Los avances que ya existen siguen desde el primer nivel sin pasar de cada modo | Aprobado (1/11) |
| S-28 | [Estrellas con umbrales a la vista](bocetos/S-28-estrellas.jpg), con capturas de la app (de [`herramientas/fogonazo/boceto-estrellas.html`](../../herramientas/fogonazo/boceto-estrellas.html)): en los niveles de pedido, la nota dice en cuántas movidas (o en cuánto tiempo) se gana cada estrella y tacha en vivo las que ya no se alcanzan; en los de puntos, la nota «Metas» lleva los tres puntajes y se juega hasta la tercera o hasta quedarse sin movidas o tiempo. El bonus final suma puntos; solo en los de puntos puede alcanzar la estrella siguiente. El vúmetro, solo puntos en pedido y con las estrellas en puntos. Los números son ejemplo. El avance arranca de cero. En la app, «Metas» lleva solo los tres puntajes, sin la línea de abajo del boceto: se aprende jugando (0.12.1) | Aprobado (1/11), en la app desde la 0.12.0 |

Montajes de los pedidos de imágenes: [las piezas con patas cortas](bocetos/P-002-montaje-cortas.png) (con su [lámina de referencia](bocetos/P-002-referencia-piezas.png)), [la escena del instrumento en el teléfono](bocetos/P-004-montaje-telefono-chatgpt.png), y [los especiales](bocetos/P-005-montaje-especiales.jpg) y [los obstáculos](bocetos/P-005-montaje-obstaculos.jpg) en la partida (con su [lámina](bocetos/P-005-referencia.png)).

## Por definir

El ícono de la app, cuando la colección tenga nombre.
