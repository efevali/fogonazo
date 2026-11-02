# La colección

Qué es la colección de minijuegos y lo que vale para todos sus juegos. Lo propio de cada uno está en su carpeta ([sala](sala/README.md), [Fogonazo](fogonazo/README.md), [mahjong](mahjong/README.md), [Buen ojo](buenojo/README.md)); cómo se ve y cómo suena, en la [guía de estilo](estilo.md); por qué se decidió cada cosa, en el [registro de decisiones](decisiones.md).

## Qué es

Una colección de juegos simples, divertidos y visualmente atractivos para el celular. Es una sola app, que se instala desde Chrome, y se entra por **la sala**: un living de los 70 ilustrado, al atardecer con lluvia, donde algunos objetos, los **objetos activos**, llevan a los juegos. Hoy son tres, Fogonazo, el mahjong y Buen ojo, y se van a sumar más.

La colección y Fogonazo todavía no tienen nombre definitivo, y el repositorio conserva el de `fogonazo` hasta entonces.

Lo que vale para todos los juegos:

1. **Para el teléfono, en horizontal.** Android con Chrome, jugado con los pulgares.
2. **Una sola app**, con lo común resuelto una vez: la sala, el sonido, el guardado, el «atrás» de Android y la instalación.
3. **Cada juego con su estilo, pero parte del todo.** No hace falta que se parezcan entre sí, pero tienen que sentirse dentro de la colección, cerca de la sala ilustrada.
4. **Imágenes hechas con IA y código encima.** Una IA de imágenes pinta los fondos y las piezas; el código dibuja lo que cambia y lo que se anima. Ver [imágenes](imagenes.md).
5. **Textos amenos**, en voseo rioplatense, sin errores ni redundancias.

## Recorrido

```
Sala ── banco de electrónica ──► Fogonazo
     ── mesa ratona con el mahjong ──► Mahjong
     ── equipo de audio ──► Sonido
     ── cuadro del arcoíris ──► Buen ojo
```

- **Los objetos activos** no llevan carteles, círculos ni marcas: brillan apenas, de a uno por turno.
- **Se entra directo a cada juego**, sin pantalla de título aparte. Cómo se pasa de la sala a un juego (la transición) está por definir.
- **Los botones de volver van abajo a la derecha**, con una etiqueta Dymo: «◀ Volver» en los juegos y «Salir ▶» en la sala, con la flecha hacia afuera, como a una puerta. Hacen falta porque, a pantalla completa, los controles de Android quedan escondidos. Chrome solo deja que una página se cierre sola en algunos casos: si «Salir» no la cierra, avisa cómo salir con el gesto del teléfono.
- **El «atrás» de Android** desanda el camino, pantalla por pantalla, hasta la sala; desde la sala sale de la app. Cada juego define sus escalones (el de Fogonazo, en [su documentación](fogonazo/README.md#recorrido)). Lección del Fogonazo publicado: el historial del navegador lleva una entrada por paso, sumada solo al tocar algo, porque Chrome saltea las que una página suma sin que la toquen.
- **Instalada, abre a pantalla completa y en horizontal.** En el navegador, sin instalar, se ve con la barra de Chrome.
- **Una página contenedora y una pantalla por vez.** La sala y cada pantalla de los juegos son páginas aparte que la contenedora (`index.html`) muestra de a una, con un fundido corto; así la música no se corta al pasar de una a otra.

## Sonido

- **Un solo juego de volúmenes para toda la colección**, guardado en un lugar: música, efectos y lluvia. El equipo de audio de la sala y los ajustes de cada juego leen y escriben los mismos valores.
- **La lluvia es del ambiente:** suena en la sala, se apaga al entrar a un juego, para que abstraiga del ambiente, y vuelve al volver a la sala.
- Cómo suena cada juego está en la [guía de estilo](estilo.md#sonido).

## Guardado

- **El avance vive solo en Chrome, en el teléfono**, y cada juego guarda lo suyo por separado.
- **Sin clave ni copia de seguridad.** Con varios juegos, resguardar el avance es un tema propio que se verá más adelante. Cada juego avisa, donde importa, que el avance vive en Chrome; si la sala llega a tener un lugar para lo común, el aviso se muda ahí.
- **Arranca de cero:** el avance del Fogonazo publicado no se conserva ni se migra.
- **El sitio es el mismo de Kasa** (`efevali.github.io`): comparten los datos de Chrome, aunque cada uno guarda lo suyo con sus propias claves. Borrar los datos del sitio desde la configuración de Chrome borra el avance de los dos.

## Publicación

- **En GitHub Pages**, en https://efevali.github.io/fogonazo/, la dirección del Fogonazo publicado. La colección lo **reemplazó directamente** con su 0.1.0, sin publicarse antes en paralelo: es lo que menos trabajo de mantenimiento exige. La app instalada en el teléfono es la colección en desarrollo.
- **Numeración nueva**, desde la 0.1.0 (ver [CHANGELOG](../CHANGELOG.md)). La versión nueva se baja sola y entra al cerrar la app del todo, o al tocar «Actualizar» en los ajustes.
- **Nombre e ícono provisorios:** «Minijuegos» y la ventana con lluvia de la sala, con la lámpara de arco encendida (P-007). Los definitivos, cuando la colección tenga nombre.
- **Ajustes de la colección:** un rack de audio que abre el equipo de audio de la sala (boceto S-14), con un módulo por tema: sonido, sistema (la versión instalada y «Buscar», que pasa a «Actualizar» cuando hay una nueva) y, en Chrome sin instalar, «Instalar». Los ajustes que vengan suman su módulo.
- **Un solo repositorio** para toda la colección. Se renombra cuando tenga nombre; la dirección de GitHub Pages no se redirige, y por eso conviene hacerlo mientras haya pocos jugadores.
- **Público esperado:** Producto, su entorno y quizás unas cien personas de boca en boca, con una experiencia razonablemente sólida. Solo teléfonos, sin varios dispositivos por jugador.

## Lo que sigue

1. **Los menús, y la sala como juego de buscar y encontrar.**
2. **Los nombres** de la colección y de Fogonazo, el ícono definitivo y el nombre del repositorio.
