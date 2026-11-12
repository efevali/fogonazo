# Biblioteca

Un juego de ordenar en la biblioteca baja del living: se juntan tres objetos iguales en un casillero para que se vayan y avance lo que hay detrás. Parecido, aunque no igual, a los Sort It de mercadería en estantes. Se entra por la biblioteca baja de la sala, la de la lámpara hongo.

**Estado:** boceto S-37 aprobado (10/11). **Implementado en la 0.18.0** con los dibujos del boceto hechos con código, para probar la mecánica y la dificultad en el teléfono antes de pedir las imágenes y el sonido (como Buen ojo). Producto lo probó (11/11): la experiencia es muy buena; pidió más libros, otro casete, la Eiffel más clara y algo que complique Difícil. Boceto S-38 aprobado (11/11): **en la 0.19.0**, cinco objetos nuevos, la Eiffel gris y las **puertas con llave**. **0.20.0, más difícil sin alargar** (11/11): quien más jugó pidió más dificultad («la duración está ok»); menos lugares libres, casi sin pares armados, el tercero de más tríos escondido, más puertas, la fila de atrás en silueta en Difícil y otra enciclopedia (S-39). Idea original en el issue [#71](https://github.com/efevali/fogonazo/issues/71). **0.21.0, con las imágenes pintadas** (11/11, S-40): los fondos de la partida y de la entrada, los objetos, las llaves, las puertas y los libros de la dificultad, pedidos a Gemini (P-010 a P-016). Sigue sin sonido.

## Cómo se juega

- **La biblioteca** tiene casilleros de tres lugares, con más objetos en fila detrás, en sombra, para que se pueda planear y no sea azar.
- **Se arrastra** un objeto a un lugar libre de otro casillero (va al lugar libre más cercano a donde se suelta). También se puede tocar el objeto, que se levanta con borde ámbar, y después el casillero. Tres iguales juntos brillan, se van y avanza la fila de atrás; también avanza si se saca lo último de adelante. Se gana al vaciar la biblioteca.
- **Siempre tiene solución:** cada reparto se genera al revés, desde la biblioteca vacía, y antes de entregarlo se vuelve a jugar su solución hacia adelante. Si alguien se traba, es por sus movidas.
- **Sin lugares libres:** un cartel, «No queda lugar», con «Empezar de nuevo» y «Deshacer». Producto evalúa jugando si «Deshacer» sirve ahí.
- **Deshacer** sin límite, también un trío ya retirado. **Pausa**, siempre.
- **Partidas sueltas**, sin camino de niveles. **El tiempo no hace perder:** solo se mide, desde la primera movida.
- **Récord por dificultad:** primero las movidas; ante un empate, el tiempo. Se muestran las dos cosas.
- **Dificultad elegible** (0.20.0): Fácil, 9 casilleros, 8 tipos y una puerta, con la llave a la vista en la fila en sombra; Normal, 12 casilleros, 14 tipos y dos puertas; Difícil, 12 casilleros, los 20 tipos (entre ellos los que se parecen a otros), más filas detrás, dos puertas y la fila de atrás en silueta (S-39b): se adivina la forma, no el color.
- **No todo a mano** (0.20.0): pocos lugares libres al empezar (unos 6, 8 y 8), casi ningún par de iguales ya armado y, en buena parte de los tríos, el tercero arranca escondido (dos filas atrás o más, o detrás de una puerta): en el 43, 61 y 70 % (antes, 29, 50 y 59 %).
- **Puertas con llave** (S-38): en Normal un casillero arranca cerrado con una puerta de vidrio de marco de bronce y cerradura; en Difícil, además, otro con una reja de tijera de ascensor viejo y candado. Lo de adentro se ve, un poco apagado, pero no se puede sacar ni apoyar nada ahí, y hace falta para ganar. Su llave está escondida en otro casillero, unas filas atrás (en Fácil, 1, a la vista en sombra; en Normal, 2; en Difícil, 3 o 4), sin que se sepa en cuál: aparece al ir vaciando, primero oscura en la fila en sombra. La de bronce, con cinta roja, abre el vidrio; la de hierro, con ojo de trébol y cinta verde, la reja. La llave ocupa un lugar (en esa fila no se arma un trío hasta sacarla) y solo va a su puerta: se la arrastra, o se la toca y después la puerta, y la cerradura se ilumina; soltada en otro lado o en la otra puerta, vuelve. Al abrir, el vidrio gira sobre su bisagra y la reja se pliega contra el costado, y la llave se va. Cuenta como una movida; «Deshacer» la vuelve atrás.

## Cómo se ve

- **La sala** (S-37a): la biblioteca baja pasa a ser objeto activo, con el brillo tenue de los demás. Hace falta solo su máscara, no una imagen nueva.
- **La entrada** (S-37d): la parte de arriba de la biblioteca baja de cerca, con la lámpara hongo a la derecha, la costilla de Adán a la izquierda y, sobre el mueble, los tres libros de la dificultad (el más gordo, el más difícil; el elegido, levantado y con borde ámbar), un despertador y la cámara. En la pared, una ficha de préstamo clavada con el título, la dificultad, el récord y «Jugar». Desde la 0.21.0, pintada (P-016): la ficha y su chinche vienen en la imagen y el código escribe encima; la cámara es la pieza del P-013, derecha y más grande que la del fondo; los libros, pintados (P-012), con el nombre en Fraunces dorado viejo.
- **El título** (S-37h): «BIBLIOTECA» en Fraunces, que al entrar aparece desordenado («BLIO BI CA TE»), con flechas rojas que dicen dónde va cada sílaba, y se ordena en unos 4 segundos; las sílabas quedan apenas torcidas.
- **La partida** (S-37b y c): el mueble de frente, de madera, con sus casilleros; a la izquierda, una ficha clavada con las movidas, el tiempo y el récord, y la dificultad; a la derecha, «Deshacer» y «Pausa»; «◀ Volver» en Dymo, como en toda la colección. Desde la 0.21.0, el mueble es la imagen (P-010, y P-011 en Fácil), con profundidad: los objetos se apoyan en el canto del estante arriba y en el medio (0.21.1: antes parecían flotar), y apenas adentro en el de abajo, donde se ve más estante.
- **El final** (S-37e): una ficha de préstamo con las movidas y el tiempo; el récord, con un sello rojo. «Otra partida» y «Salir».
- **La pausa:** sin boceto; una ficha como la del final, con «Seguir», «Empezar de nuevo» y «Salir».
- **Los objetos** (S-37g, S-38a y S-39a), veinte: el tomo, tres libros parados (fino y alto, medio, bajo, sin que se vean las hojas), tres casetes (naranja con carcasa negra, blanco con etiqueta celeste, ahumado con etiqueta roja), la torre Eiffel (gris claro desde S-38a, para que se despegue del fondo; era de bronce), el avión, el auto, el globo terráqueo, el despertador, la mamushka, el cactus, la cámara y la radio; otra enciclopedia, verde botella, más baja y con números plateados (S-39a, Difícil); y desde S-38a, dos libros muy distintos (una pila de tres acostados y una enciclopedia de cuatro tomos finos numerados) y tres que se parecen a propósito, para Difícil (los tres libros con la misma forma en verde, bordó, verde; el tomo en azul; un casete transparente azulado de etiqueta amarilla, el C de S-38a). Cada uno, de silueta propia, salvo los parecidos.
- **Las puertas y las llaves** (S-38b a g): la puerta de vidrio, la reja y las dos llaves, como se describen arriba.
- **Las imágenes** (0.21.0): [los pedidos](../imagenes.md#pedidos-cerrados) P-010 a P-016; las entregas aprobadas, en [`arte/`](arte/), y sus composiciones, en [`bocetos/`](bocetos/). `python3 herramientas/biblioteca/recortar.py` las recorta y las deja en `biblioteca/arte/` en WebP: cada objeto en el recuadro de su dibujo con código (60 × 80, a 4×), con su mismo tamaño y apoyo, así no cambia dónde se agarra; los huecos de los casetes, del tono de la cinta. Se pintaron también los casetes A y B de S-38a, que no entran en el juego, para tenerlos. El P-011 tiene la columna del medio ensanchada a mano y el P-015, las puertas llevadas a mano a la proporción del casillero (ver [imágenes](../imagenes.md)).

## En la app (0.18.0 a 0.21.0)

- **Archivos:** [`biblioteca/`](../../biblioteca/): la entrada (`index.html`), la partida (`partida.html`), las reglas y los repartos (`repartos.js`, que corre igual en Node), los objetos y las llaves (`objetos.js`: las piezas pintadas de `arte/objetos/` y, como medida y respaldo, los dibujos con código), las imágenes (`arte/`), el avance (`estado.js`) y lo común a las dos pantallas (`mueble.css`). En la sala, la máscara de la biblioteca baja (`sala/mask-biblioteca.png`).
- **Los repartos (0.19.0):** Fácil, 15 tríos de 8 tipos en 9 casilleros de hasta 3 capas, sin puertas; Normal, 25 tríos de 14 tipos en 12 casilleros de hasta 4 capas, con la puerta de vidrio y su llave 2 filas atrás; Difícil, 26 tríos de los 19 tipos en 12 casilleros de hasta 5 capas, con las dos puertas y sus llaves 3 filas atrás (hasta la 0.19.0, 33 tríos y llaves a 3 o 4 filas: se sentía demasiado largo). Las capas de atrás siempre están completas; los huecos, solo adelante (unos 9 en Fácil y 13 en Normal y Difícil). Fácil usa los ocho objetos de silueta más distinta; Normal suma los tres libros, el auto, la cámara, la radio, la pila y la enciclopedia; Difícil, los cinco que se parecen a otros. Al generar al revés, en un punto se cierra cada puerta (lo que hay en ese casillero queda adentro) y su llave vuelve a otro casillero; después queda tapada por lo que se pone delante, hasta la fila que pide la dificultad. `node herramientas/biblioteca/probar.js` verifica que cada reparto tenga solución, sus puertas y sus llaves donde deben, y hace jugar a un bot simple.
- **Lo que mostró el primer registro** (11/11, 5 partidas, todas ganadas sin deshacer): nunca cerca de trabarse (en Difícil, 6 lugares libres como mínimo), una movida cada 1,8 s y entre 1,6 y 2 movidas por trío en Normal y Difícil. De ahí las puertas y los objetos parecidos de la 0.19.0.
- **Lo que mostró el cuarto** (11/11, 0.20.0): ella, 4 partidas en Difícil: 64 movidas de mediana (antes 56) en 2:16 (antes 2:01), lugares libres mínimos de 3 a 5 (antes 6), más pausas para pensar; sin trabarse ni deshacer. Dice que se siente más difícil. Producto: Fácil 33 movidas en 58 s; Difícil 90 en 3:33, con 2 lugares libres como mínimo. Le gustó: «se siente más complejo y hace pensar más». Agarrar se siente más cómodo y la duración de Difícil es adecuada. Si Difícil pasara seguido de los 3 minutos, el ajuste sería cerrar antes las puertas al generar (que se abran antes en la partida).
- **Lo que mostró el tercero** (11/11, otra jugadora, 25 partidas en Difícil con la 0.19.1): ganó 23 sin deshacer, mediana de 56 movidas en 2 minutos (la solución anotada, 72), una movida cada 1,5 s; se trabó una vez. Las puertas se abrieron tarde (mediana al 71 % de la partida). Su opinión: la duración está bien, la dificultad tiene que aumentar; y la sensación de tener siempre a mano todo lo que necesita (se midió: entre el 70 y el 84 % de los objetos a la vista al empezar). De ahí la 0.20.0.
- **Lo que mostró el segundo** (11/11, una partida por dificultad con la 0.19.0): Difícil, 81 movidas en 4:30, casi el doble que Normal (62 en 2:28), con más pausas para pensar; de ahí los 26 tríos de la 0.19.1. En Normal la puerta se abrió en la movida 13 de 62 (a mirar si se repite). Costaba agarrar los objetos: solo respondía el recuadro del objeto y, mientras se iba un trío, se ignoraban los toques en toda la biblioteca.
- **Agarrar** (0.19.1): toda la columna del casillero agarra el objeto de adelante, también la parte de la fila en sombra; mientras un trío se va o una puerta se abre, solo espera ese casillero.
- **Se ve adelante y la fila de atrás, en sombra;** «+2» dice cuántas filas quedan más atrás, sin mostrarlas.
- **Sin sonido** por ahora (ni música ni efectos), hasta definirlo.
- **Registro de partidas:** cada partida con su reparto (la semilla y la versión de los repartos: 2 desde la 0.19.0, 3 desde la 0.19.1), cada movida (las de las llaves, con el lugar de destino en -1), los deshacer, las pausas y cómo terminó (ver [la colección](../coleccion.md#registro-de-partidas)).

### Decisiones de implementación, a revisar jugando

- **«Deshacer» no descuenta la movida:** la movida deshecha sigue contando, igual que la que la corrige. Si descontara, se podría usar para espiar las filas de atrás sin costo y el récord por movidas perdería sentido.
- **«Empezar de nuevo» repite el mismo reparto**, desde cero (en «No queda lugar» y en la pausa); «Otra partida», al final, reparte uno nuevo.
- **La pausa** es una ficha como la del final, con «Seguir», «Empezar de nuevo» y «Salir». «Atrás» la abre, como en el mahjong; con la ficha abierta, «atrás» vuelve a la entrada.
- **La dificultad de los repartos** (tríos, capas, cuánto se mezclan, dónde se cierran las puertas y qué tan atrás van las llaves) es una aproximación: se ajusta con lo que Producto juegue y con el registro.

## Lo que falta

- **La mecánica y la dificultad quedaron cerradas** (11/11, 0.20.0): probadas en el teléfono por Producto y otra jugadora. Se vuelve a mirar con registros nuevos.
- **Las imágenes, hechas** (11/11, 0.21.0). Si Producto ve en el juego que los libros (P-012) quedan más planos que los adornos (P-013), se pueden repedir con el P-013 de referencia.
- **El sonido, lo próximo:** un primo de Taller con otra instrumentación (¿algo de los 70, piano eléctrico o vibráfono?) y efectos del rubro (el libro que se apoya, el clic del casete, el trío que se va). Se aprueba escuchándolo.
- **El nombre:** «Biblioteca» por ahora.

## Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| S-37a | La sala, con la biblioteca baja como objeto activo | Aprobado (10/11) |
| S-37b | La partida | Aprobado (10/11) |
| S-37c | Una movida: el trío que brilla antes de irse | Aprobado (10/11) |
| S-37d | La entrada, sobre la biblioteca baja | Aprobado (10/11) |
| S-37e | El final, con récord | Aprobado (10/11) |
| S-37f | Sin lugares libres | Aprobado (10/11) |
| S-37g | Los catorce objetos | Aprobado (10/11); los dibujos son de ejemplo |
| S-37h | El título animado | Aprobado (10/11) |
| S-38a | Objetos nuevos: cuatro libros, tres casetes para elegir (A, B, C) y la Eiffel gris | Aprobado (11/11): los cuatro libros, el casete C y la Eiffel gris; A y B solo para los pedidos de imágenes |
| S-38b | Un casillero cerrado con puerta de vidrio | Aprobado (11/11) |
| S-38c | Aparece la llave, entre dos objetos | Aprobado (11/11) |
| S-38d | La llave, arrastrada a su puerta | Aprobado (11/11) |
| S-38e | La puerta, abierta | Aprobado (11/11) |
| S-38f | Difícil con dos puertas: vidrio y reja, y sus dos llaves | Aprobado (11/11), con la llave de hierro más clara |
| S-38g | La reja, plegada al abrirse | Aprobado (11/11) |
| S-39a | Otra enciclopedia, verde y más baja | Aprobado (11/11) |
| S-39b | Difícil con la fila de atrás en silueta | Aprobado (11/11) |
| S-40a | La entrada con las imágenes (P-016), los lomos en Fraunces dorado y la cámara derecha | Aprobado (11/11), en la 0.21.0 |
| S-40b | Normal con las imágenes (P-010, P-012 a P-015) | Aprobado (11/11), con los objetos más adelante en los estantes del medio y de abajo |
| S-40c | Difícil, al tamaño de un teléfono | Aprobado (11/11) |
| S-40d | Fácil (P-011) | Aprobado (11/11) |
| S-41 | La música: Taller como primo de dibujos animados, A (caricatura clásica), B (dibujito de los 70) y B2 (B con brillo), con o sin swing y a cuatro tempos; elegida (12/11) B2 a 116 con swing y la melodía silbada; en [`herramientas/biblioteca/prueba-musica.html`](../../herramientas/biblioteca/prueba-musica.html) | Elegida; faltan el nivel en la partida y los efectos |
