# Biblioteca

Un juego de ordenar en la biblioteca baja del living: se juntan tres objetos iguales en un casillero para que se vayan y avance lo que hay detrás. Parecido, aunque no igual, a los Sort It de mercadería en estantes. Se entra por la biblioteca baja de la sala, la de la lámpara hongo.

**Estado:** boceto S-37 aprobado (10/11). Sin implementar. Idea original en el issue [#71](https://github.com/efevali/fogonazo/issues/71).

## Cómo se juega

- **La biblioteca** tiene casilleros de tres lugares, con más objetos en fila detrás, en sombra, para que se pueda planear y no sea azar.
- **Se arrastra** un objeto a un lugar libre de otro casillero. Tres iguales juntos brillan, se van y avanza la fila de atrás. Se gana al vaciar la biblioteca.
- **Siempre tiene solución:** cada reparto se genera al revés, desde la biblioteca vacía. Si alguien se traba, es por sus movidas.
- **Sin lugares libres:** un cartel, «No queda lugar», con «Empezar de nuevo» y «Deshacer». Producto evalúa jugando si «Deshacer» sirve ahí.
- **Deshacer** sin límite, también un trío ya retirado. **Pausa**, siempre.
- **Partidas sueltas**, sin camino de niveles. **El tiempo no hace perder:** solo se mide.
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

## Lo que falta

- **Los pedidos de imágenes** (fondos y láminas de objetos).
- **El sonido:** un primo de Taller con otra instrumentación (¿algo de los 70, piano eléctrico o vibráfono?) y efectos del rubro (el libro que se apoya, el clic del casete, el trío que se va). Se aprueba escuchándolo.
- **El registro de partidas:** sumar este juego, como los demás.
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
