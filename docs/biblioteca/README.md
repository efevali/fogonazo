# Biblioteca

Un juego de ordenar en la biblioteca baja del living: se juntan tres objetos iguales en un casillero para que se vayan y avance lo que hay detrás. Parecido, aunque no igual, a los Sort It de mercadería en estantes. Se entra por la biblioteca baja de la sala, la de la lámpara hongo.

**Estado:** boceto S-37 aprobado (10/11). **Implementado en la 0.18.0** con los dibujos del boceto hechos con código, para probar la mecánica y la dificultad en el teléfono antes de pedir las imágenes y el sonido (como Buen ojo). Idea original en el issue [#71](https://github.com/efevali/fogonazo/issues/71).

## Cómo se juega

- **La biblioteca** tiene casilleros de tres lugares, con más objetos en fila detrás, en sombra, para que se pueda planear y no sea azar.
- **Se arrastra** un objeto a un lugar libre de otro casillero (va al lugar libre más cercano a donde se suelta). También se puede tocar el objeto, que se levanta con borde ámbar, y después el casillero. Tres iguales juntos brillan, se van y avanza la fila de atrás; también avanza si se saca lo último de adelante. Se gana al vaciar la biblioteca.
- **Siempre tiene solución:** cada reparto se genera al revés, desde la biblioteca vacía, y antes de entregarlo se vuelve a jugar su solución hacia adelante. Si alguien se traba, es por sus movidas.
- **Sin lugares libres:** un cartel, «No queda lugar», con «Empezar de nuevo» y «Deshacer». Producto evalúa jugando si «Deshacer» sirve ahí.
- **Deshacer** sin límite, también un trío ya retirado. **Pausa**, siempre.
- **Partidas sueltas**, sin camino de niveles. **El tiempo no hace perder:** solo se mide, desde la primera movida.
- **Récord por dificultad:** primero las movidas; ante un empate, el tiempo. Se muestran las dos cosas.
- **Dificultad elegible:** Fácil, 9 casilleros y menos tipos de objeto; Normal, 12 casilleros y 12 tipos; Difícil, 12 casilleros, los 14 tipos y más filas detrás.

## Cómo se ve

- **La sala** (S-37a): la biblioteca baja pasa a ser objeto activo, con el brillo tenue de los demás. Hace falta solo su máscara, no una imagen nueva.
- **La entrada** (S-37d): la parte de arriba de la biblioteca baja de cerca, con la lámpara hongo a la derecha, la costilla de Adán a la izquierda y, sobre el mueble, los tres libros de la dificultad (el más gordo, el más difícil; el elegido, levantado y con borde ámbar), un despertador y la cámara. En la pared, una ficha de préstamo clavada con el título, la dificultad, el récord y «Jugar».
- **El título** (S-37h): «BIBLIOTECA» en Fraunces, que al entrar aparece desordenado («BLIO BI CA TE»), con flechas rojas que dicen dónde va cada sílaba, y se ordena en unos 4 segundos; las sílabas quedan apenas torcidas.
- **La partida** (S-37b y c): el mueble de frente, de madera, con sus casilleros; a la izquierda, una ficha clavada con las movidas, el tiempo y el récord, y la dificultad; a la derecha, «Deshacer» y «Pausa»; «◀ Volver» en Dymo, como en toda la colección.
- **El final** (S-37e): una ficha de préstamo con las movidas y el tiempo; el récord, con un sello rojo. «Otra partida» y «Salir».
- **La pausa:** sin boceto; una ficha como la del final, con «Seguir», «Empezar de nuevo» y «Salir».
- **Los objetos** (S-37g), catorce: el tomo, tres libros parados (fino y alto, medio, bajo, sin que se vean las hojas), tres casetes (naranja con carcasa negra, blanco con etiqueta celeste, ahumado con etiqueta roja), la torre Eiffel, el avión, el auto, el globo terráqueo, el despertador, la mamushka, el cactus, la cámara y la radio. Cada uno, de silueta propia, para distinguirlo de un vistazo en el teléfono.
- **Las imágenes:** el fondo de la partida, el de la entrada y los objetos, en láminas de varios, los pinta la IA (pedidos por armar). Los dibujos del boceto son de ejemplo.

## En la app (0.18.0)

- **Archivos:** [`biblioteca/`](../../biblioteca/): la entrada (`index.html`), la partida (`partida.html`), las reglas y los repartos (`repartos.js`, que corre igual en Node), los catorce objetos dibujados con código (`objetos.js`), el avance (`estado.js`) y lo común a las dos pantallas (`mueble.css`). En la sala, la máscara de la biblioteca baja (`sala/mask-biblioteca.png`).
- **Los repartos:** Fácil, 15 tríos de 8 tipos en 9 casilleros de hasta 3 capas; Normal, 25 tríos de 12 tipos en 12 casilleros de hasta 4 capas; Difícil, 33 tríos de los 14 tipos en 12 casilleros de hasta 5 capas. Las capas de atrás siempre están completas; los huecos, solo adelante (unos 9 en Fácil y 13 o 14 en Normal y Difícil). Fácil usa los ocho objetos de silueta más distinta; Normal suma los tres libros, el auto, la cámara y la radio; Difícil, el casete blanco y el ahumado, que se parecen al naranja. `node herramientas/biblioteca/probar.js` verifica que cada reparto tenga solución y hace jugar a un bot simple.
- **Se ve adelante y la fila de atrás, en sombra;** «+2» dice cuántas filas quedan más atrás, sin mostrarlas.
- **Sin sonido** por ahora (ni música ni efectos), hasta definirlo.
- **Registro de partidas:** cada partida con su reparto (la semilla), cada movida, los deshacer, las pausas y cómo terminó (ver [la colección](../coleccion.md#registro-de-partidas)).

### Decisiones de implementación, a revisar jugando

- **«Deshacer» no descuenta la movida:** la movida deshecha sigue contando, igual que la que la corrige. Si descontara, se podría usar para espiar las filas de atrás sin costo y el récord por movidas perdería sentido.
- **«Empezar de nuevo» repite el mismo reparto**, desde cero (en «No queda lugar» y en la pausa); «Otra partida», al final, reparte uno nuevo.
- **La pausa** es una ficha como la del final, con «Seguir», «Empezar de nuevo» y «Salir». «Atrás» la abre, como en el mahjong; con la ficha abierta, «atrás» vuelve a la entrada.
- **La dificultad de los repartos** (tríos, capas y cuánto se mezclan) es una primera aproximación: se ajusta con lo que Producto juegue y con el registro.

## Lo que falta

- **Probarlo en el teléfono:** la mecánica, el tamaño de los objetos y la dificultad de cada modo.
- **Los pedidos de imágenes** (fondos y láminas de objetos).
- **El sonido:** un primo de Taller con otra instrumentación (¿algo de los 70, piano eléctrico o vibráfono?) y efectos del rubro (el libro que se apoya, el clic del casete, el trío que se va). Se aprueba escuchándolo.
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
