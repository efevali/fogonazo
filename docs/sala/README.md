# La sala

La pantalla de inicio de la colección: un living de los 70 ilustrado donde algunos objetos, los objetos activos, llevan a los juegos. Cómo se ve está en la [guía de estilo](../estilo.md#la-sala); por qué es así, en el [registro de decisiones](../decisiones.md#la-sala).

## Estado

- **Arte vigente:** el ícono, [`arte/P-007_icono.jpg`](arte/P-007_icono.jpg). **Imagen base:** [`arte/sala-v2.png`](arte/sala-v2.png), de 2752 × 1536, generada con Gemini. Vista frontal, al atardecer con lluvia.
- **En la app** desde la 0.1.0: es la pantalla de inicio, en [`sala/`](../../sala/index.html) (fuera de `docs/`). Producto la probó en el teléfono como prototipo: los objetos activos se ven bien, y «tiene aspecto de juego profesional».

## Qué hace la sala

- **Cinco objetos activos**, que brillan apenas por turno:
  - **El banco de electrónica** lleva a Fogonazo, a la pantalla-instrumento, que vuelve con «◀ Volver».
  - **La mesa ratona con el mahjong** lleva al mahjong, al estuche abierto, que vuelve con «◀ Volver».
  - **El cuadro del arcoíris**, sobre el equipo de audio, lleva a Buen ojo, al block, que vuelve con «◀ Volver».
  - **La biblioteca baja con la lámpara hongo**, a la derecha, lleva a Biblioteca, a la entrada, que vuelve con «◀ Volver» (desde la 0.18.0, S-37a).
  - **El equipo de audio** abre los ajustes de la colección (S-14), un rack de audio: sonido (música, efectos y lluvia, de 0 a 10, en medidores de LEDs), sistema (la versión y un botón que busca la nueva y, si la hay, pasa a «Actualizar») y, en el navegador sin instalar, «Instalar»; en Samsung Internet, que no deja instalarla, ofrece «Abrir en Chrome».
- **El ambiente animado** de la [guía de estilo](../estilo.md#la-sala).
- **La gata** (desde la 0.23.0, S-44): una gata calicó duerme ovillada en una punta del sillón, delante del almohadón chico. Respira, de vez en cuando mueve la cola y, cada tanto, se estira (desde la 0.24.0). Son videos de Gemini (P-018 a P-020) que se encadenan tal cual: la respiración (al 70 % de su velocidad) de dos a cuatro veces, al azar, y después un gesto: la cola (al 85 %) o, después de dos o tres colas (al azar), el estiramiento (al 70 %) en su lugar, para que sea esporádico: uno cada dos a tres minutos y medio. Los tres videos comparten un recorte más amplio que la gata ovillada, para que entren las patas y las orejas al estirarse; el lugar de la gata en el sillón no cambió. En la punta derecha, al estirarse, las puntas de las patas llegan a la tapa abierta de la caja del mahjong: la caja se vuelve a dibujar encima de la gata (con su brillo), así que las patas pasan por detrás de la tapa (desde la 0.24.1). Los videos que esperan su turno quedan casi transparentes, no ocultos: Chrome en Android deja de pintar un video oculto y, al mostrarlo, la gata desaparecía un cuadro. Duerme en una punta o en la otra: al azar al abrir la app, y una de cada tres veces cambió de punta al volver a la sala (de un juego o al cerrar los ajustes, que tapan el sillón); nunca se la ve moverse de lugar. Se queda quieta cuando la app no está a la vista y con «reducir movimiento» del sistema. **Al tocarla, ronronea** (desde la 0.25.0, S-45): un ronroneo largo, de unos 8 o 12 s al azar, que se apaga de a poco; mientras ronronea y 3 s después, los toques no hacen nada. Se calla, con un fundido corto, cuando un panel tapa el sillón, al entrar a un juego y cuando la app no está a la vista. Suena con el volumen de los efectos. La zona para tocarla es la gata ovillada, en la punta donde duerme. La charla, para intercalar con el ronroneo, viene después.
- **«Salir ▶»**, abajo a la derecha, cierra la app. Si Chrome no la deja cerrarse sola, avisa cómo salir con el gesto del teléfono.
- **La lluvia** suena mientras se está en la sala, con el volumen de los ajustes, y se apaga al entrar a un juego.
- **Para revisar las zonas táctiles,** `sala/?zonas` las muestra. En vertical se ve la sala entera, achicada.

## Archivos

| Carpeta | Qué hay |
|---|---|
| [`arte/`](arte/) | La imagen base vigente, en la resolución original, y las entregas de la gata: la imagen (P-017) y los videos originales de Gemini (P-018 y P-019). |
| [`bocetos/`](bocetos/) | Los bocetos de la sala y de lo común de la colección (ver abajo). |
| [`sala/`](../../sala/) (en la app) | La página, la imagen base para la web, una copia aclarada para el brillo de los objetos activos y las máscaras de cada objeto activo (el cuadro, `mask-cuadro.png`, desde la 0.14.0; la biblioteca baja, `mask-biblioteca.png`, desde la 0.18.0) y de la ventana; los videos de la gata (`gata-respira.webm` y `gata-cola.webm`), que arma `herramientas/sala/gata.py` desde los originales. |

### Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| [S-05](bocetos/S-05-composicion-sala.jpg) | La composición de la sala completa que se le pasó a la IA | Vigente como guía para futuras ediciones de la imagen |
| S-11 | [Los pasos para instalar](bocetos/S-11-instalar-pasos.jpg), cuando Chrome no ofrece su cuadro. Los ajustes de ese boceto quedaron superados por S-14 | Aprobado (27/10) |
| S-14 | Los ajustes como rack de audio, para la 0.5.0: [al día](bocetos/S-14a-ajustes-al-dia.jpg) y [con versión nueva](bocetos/S-14b-ajustes-version-nueva.jpg) (el número es de ejemplo). Capturas de la app | Aprobado (29/10), sin los tornillos del boceto |
| P-007 | El ícono con la lámpara más arriba: [el ícono anterior](bocetos/P-007-icono-actual.png) y [el boceto](bocetos/P-007-boceto-lampara.png), un retoque a mano que solo vale por la posición; el texto, en [imágenes](../imagenes.md#pedidos-cerrados). [La entrega](arte/P-007_icono.jpg), de 2048 × 2048, va entera en los íconos (`herramientas/iconos.py`) | Aprobado (29/10), con el encuadre más abierto que dio Gemini |
| S-44 | La gata en el sillón: [en la punta derecha](bocetos/S-44a-gata-derecha.jpg) y [en la izquierda](bocetos/S-44b-gata-izquierda.jpg), espejada. Capturas de la app. Se probó en una página aparte: la ubicación (más atrás en el asiento, para que no cuelgue), la sombra que la apoya sobre el almohadón, y los videos encadenados sin intervenir. El estiramiento (P-020) se probó igual, con el recorte nuevo y las tres velocidades: al 70 %; después, sobre el sillón en su lugar real, las patas por detrás de la caja del mahjong | Aprobado (12/11; el estiramiento, 13/11) |
| S-45 | El ronroneo al tocar la gata, probado en la misma página de prueba de S-44 (que se conserva para las pruebas de la gata). Se probaron ronroneos cortos y largos, trinos, maullidos y ruiditos sintetizados, y luego imitaciones de dos grabaciones reales: quedó solo el ronroneo largo imitado, sin sonidos antes y con el final que se apaga | Aprobado (13/11) |
| S-12 | Los botones de volver, abajo a la derecha, en toda la colección: en la sala, [«Salir ▶»](bocetos/S-12a-sala-salir.jpg), con la flecha hacia afuera, como a una puerta; en Fogonazo, «◀ Volver» (ver [sus bocetos](../fogonazo/README.md#bocetos)). Capturas de la app con los cambios | Aprobado (27/10), con la flecha de «Salir» pasada a la derecha |

Las referencias de estilo de terceros (ilustraciones isométricas, fotos de livings de época, el recorte de revista) no se guardan en este repositorio, que es público.

## Notas técnicas

- **Coordenadas:** en `sala/index.html`, las zonas táctiles y las animaciones están en el sistema de 2576 × 1438 de la primera descarga de la imagen; la imagen en alta se dibuja escalada en ese mismo recuadro y coincide sin corrimientos (se verificó).
- **Si la imagen cambia,** se pide un cambio puntual sobre ella (ver [imágenes](../imagenes.md#cómo-se-pide)), para no tener que volver a medir.
- **El brillo de cada objeto activo** va en una capa propia, separada del destello del toque, para que el ciclo de aviso no se interrumpa.

- **La gata:** cada video se prepara con `python3 herramientas/sala/gata.py original.mp4 sala/gata-….webm`: quita el magenta, la entona a la luz de la sala y le hornea la sombra en cada cuadro, sin cortarlo ni cambiarle el tiempo; las velocidades se dan al reproducir. Todos los videos usan el mismo recorte, porque Gemini deja a la gata en el mismo lugar: así se encadenan sin salto. Va en un `foreignObject` del SVG, en las coordenadas de la sala, debajo de las zonas táctiles (no tapa el toque del mahjong). El que sigue arranca debajo del que se ve y lo reemplaza cuando pintó su primer cuadro. El service worker responde los pedidos por partes (`Range`) con lo guardado, para que los videos anden sin conexión.

## Por definir

- La gata: la charla al tocarla, intercalada con el ronroneo, para que no responda siempre a cada toque («te presta atención cuando tiene ganas»), y quizás más gestos (la oreja).
- La transición de la sala a cada juego. Para la 0.1.0, un fundido corto, provisorio.
