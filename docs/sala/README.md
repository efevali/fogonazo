# La sala

La pantalla de inicio de la colección: un living de los 70 ilustrado donde algunos objetos, los objetos activos, llevan a los juegos. Cómo se ve está en la [guía de estilo](../estilo.md#la-sala); por qué es así, en el [registro de decisiones](../decisiones.md#la-sala).

## Estado

- **Arte vigente:** el ícono, [`arte/P-007_icono.jpg`](arte/P-007_icono.jpg). **Imagen base:** [`arte/sala-v2.png`](arte/sala-v2.png), de 2752 × 1536, generada con Gemini. Vista frontal, al atardecer con lluvia.
- **En la app** desde la 0.1.0: es la pantalla de inicio, en [`sala/`](../../sala/index.html) (fuera de `docs/`). Producto la probó en el teléfono como prototipo: los objetos activos se ven bien, y «tiene aspecto de juego profesional».

## Qué hace la sala

- **Cuatro objetos activos**, que brillan apenas por turno:
  - **El banco de electrónica** lleva a Fogonazo, a la pantalla-instrumento, que vuelve con «◀ Volver».
  - **La mesa ratona con el mahjong** lleva al mahjong, al estuche abierto, que vuelve con «◀ Volver».
  - **El cuadro del arcoíris**, sobre el equipo de audio, lleva a Buen ojo, al block, que vuelve con «◀ Volver».
  - **El equipo de audio** abre los ajustes de la colección (S-14), un rack de audio: sonido (música, efectos y lluvia, de 0 a 10, en medidores de LEDs), sistema (la versión y un botón que busca la nueva y, si la hay, pasa a «Actualizar») y, en Chrome sin instalar, «Instalar».
- **El ambiente animado** de la [guía de estilo](../estilo.md#la-sala).
- **«Salir ▶»**, abajo a la derecha, cierra la app. Si Chrome no la deja cerrarse sola, avisa cómo salir con el gesto del teléfono.
- **La lluvia** suena mientras se está en la sala, con el volumen de los ajustes, y se apaga al entrar a un juego.
- **Para revisar las zonas táctiles,** `sala/?zonas` las muestra. En vertical se ve la sala entera, achicada.

## Archivos

| Carpeta | Qué hay |
|---|---|
| [`arte/`](arte/) | La imagen base vigente, en la resolución original. |
| [`bocetos/`](bocetos/) | Los bocetos de la sala y de lo común de la colección (ver abajo). |
| [`sala/`](../../sala/) (en la app) | La página, la imagen base para la web, una copia aclarada para el brillo de los objetos activos y las máscaras de cada objeto activo (el cuadro, `mask-cuadro.png`, desde la 0.14.0) y de la ventana. |

### Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| [S-05](bocetos/S-05-composicion-sala.jpg) | La composición de la sala completa que se le pasó a la IA | Vigente como guía para futuras ediciones de la imagen |
| S-11 | [Los pasos para instalar](bocetos/S-11-instalar-pasos.jpg), cuando Chrome no ofrece su cuadro. Los ajustes de ese boceto quedaron superados por S-14 | Aprobado (27/10) |
| S-14 | Los ajustes como rack de audio, para la 0.5.0: [al día](bocetos/S-14a-ajustes-al-dia.jpg) y [con versión nueva](bocetos/S-14b-ajustes-version-nueva.jpg) (el número es de ejemplo). Capturas de la app | Aprobado (29/10), sin los tornillos del boceto |
| P-007 | El ícono con la lámpara más arriba: [el ícono anterior](bocetos/P-007-icono-actual.png) y [el boceto](bocetos/P-007-boceto-lampara.png), un retoque a mano que solo vale por la posición; el texto, en [imágenes](../imagenes.md#pedidos-cerrados). [La entrega](arte/P-007_icono.jpg), de 2048 × 2048, va entera en los íconos (`herramientas/iconos.py`) | Aprobado (29/10), con el encuadre más abierto que dio Gemini |
| S-12 | Los botones de volver, abajo a la derecha, en toda la colección: en la sala, [«Salir ▶»](bocetos/S-12a-sala-salir.jpg), con la flecha hacia afuera, como a una puerta; en Fogonazo, «◀ Volver» (ver [sus bocetos](../fogonazo/README.md#bocetos)). Capturas de la app con los cambios | Aprobado (27/10), con la flecha de «Salir» pasada a la derecha |

Las referencias de estilo de terceros (ilustraciones isométricas, fotos de livings de época, el recorte de revista) no se guardan en este repositorio, que es público.

## Notas técnicas

- **Coordenadas:** en `sala/index.html`, las zonas táctiles y las animaciones están en el sistema de 2576 × 1438 de la primera descarga de la imagen; la imagen en alta se dibuja escalada en ese mismo recuadro y coincide sin corrimientos (se verificó).
- **Si la imagen cambia,** se pide un cambio puntual sobre ella (ver [imágenes](../imagenes.md#cómo-se-pide)), para no tener que volver a medir.
- **El brillo de cada objeto activo** va en una capa propia, separada del destello del toque, para que el ciclo de aviso no se interrumpa.

## Por definir

- La transición de la sala a cada juego. Para la 0.1.0, un fundido corto, provisorio.
- Los menús, y la sala como juego de buscar y encontrar.
