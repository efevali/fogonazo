# Cómo se trabaja en Fogonazo

Fogonazo se desarrolla con el flujo habitual de GitHub: **issues** para lo que hay que cambiar, **milestones** para agrupar cada versión, **pull requests** para el código y un **registro de cambios** para lo publicado. Es el mismo método de [Kasa](https://github.com/efevali/kasa). Este repositorio es la única fuente de verdad del proyecto: lo que no está acá no está acordado.

Este archivo explica el método. Qué es el juego, qué hay en cada archivo y cómo se publica están en el [README](README.md).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Lo que falta cambiar (errores, mejoras, textos, niveles, dificultad, ideas) | [Issues](https://github.com/efevali/fogonazo/issues) |
| Qué entra en cada versión | [Milestones](https://github.com/efevali/fogonazo/milestones): uno por versión |
| Lo que todavía no tiene versión asignada (el *backlog*) | Issues abiertos sin milestone |
| El código de la versión en preparación | El [pull request](https://github.com/efevali/fogonazo/pulls) en borrador de su rama |
| Bocetos aprobados | [`docs/bocetos/`](docs/bocetos/) |
| Qué salió en cada versión | [`CHANGELOG.md`](CHANGELOG.md) |
| Qué es Fogonazo, sus reglas y sus niveles | [`docs/manifiesto.md`](docs/manifiesto.md) |
| Por qué se decidió cada cosa y qué se descartó | [`docs/decisiones.md`](docs/decisiones.md) |
| Reglas de interfaz, dibujos, sonido y música | La **guía de estilo**, al principio del CSS de `codigo/page.html` |

## Roles

- **Producto** (la cuenta efevali): decide qué se cambia, juega en el teléfono (Android, con Chrome) y aprueba los bocetos y la vista previa. Revisa sobre el juego, no sobre el código. Los textos también se revisan en el juego, no en un documento aparte.
- **Desarrollo**: propone, revisa cada pantalla y cada nivel por su cuenta además de las observaciones que recibe, prepara los bocetos e implementa. Las inconsistencias de código que encuentra las corrige directamente, sin informe previo; consulta solo si implican un cambio grande en la estructura del juego. Ante cualquier duda de producto, pregunta.

Criterios que valen siempre:

- **Primero se conversa y se acuerda, después se implementa.** Nada se cambia en el código en el momento de la revisión.
- **Primero boceto, siempre.** Antes de cambiar diseño, interfaz o sonido se muestra un boceto para aprobar. Los arreglos de errores y los ajustes ya acordados se aplican directo, y también lo que Producto pida implementar sin boceto.
- **Lo visual se aprueba viéndolo**: bocetos en PNG de tamaño real, para comparar en la galería del teléfono. **El sonido, escuchándolo**: una página de prueba con las opciones, como el [muestrario](docs/muestrario.html).
- **8 bits es el estilo por defecto y no se saca.** Todo cambio visual o de sonido se resuelve en los dos estilos.
- **Implementación integral**: no se publica nada aislado ni se dejan cabos sueltos.
- **Sin duplicados**: lo que está en el juego o en este repositorio no se guarda aparte.

## El ciclo

1. **Revisión.** Se juega en el teléfono, nivel por nivel y pantalla por pantalla. Cada observación (una captura con un comentario) se discute antes de registrarla.
2. **Issue.** Lo acordado se carga como issue con la plantilla «Observación». Se redacta para que alguien pueda implementarlo sin haber visto la conversación ni la captura.
3. **Boceto.** Si el cambio es visual o de sonido, se aprueba sobre un boceto (ver «Bocetos») y su código entra en la rama de la versión.
4. **Tanda.** Los issues acordados se agrupan en el milestone de la versión en preparación, para probar en el teléfono pocos cambios por vez.
5. **Implementación.** Al cerrar la revisión de la tanda se completa el pull request: lo que los bocetos no cubren se hace según el texto de cada issue. Si cambian las reglas o los niveles, se corre `herramientas/probar.js` y se recalibran los niveles afectados (ver «Dificultad»). Se prueba en la vista previa y se compara con los bocetos.
6. **Publicación.** Con el ok, se sube la versión, se une el pull request a `main`, se borra la rama y se suma la versión a `CHANGELOG.md`. Los issues de la tanda se cierran solos.

**Excepción:** lo que traba el juego (un nivel que no se puede terminar, un error que lo cuelga o que borra el avance) no espera la tanda. Se arregla en una rama propia y se publica enseguida como parche (0.x.**y**); después, la rama de la tanda se actualiza sobre `main`.

## Issues

Cada issue lleva:

- **Título:** el cambio, en una línea.
- **Dónde:** nivel, pantalla y estilo (8 bits, 16 bits o los dos).
- **Qué se observó.**
- **Cambio acordado:** concreto, sin depender de la conversación.
- **Cómo se verifica:** qué mirar en la vista previa para darlo por bueno.
- **Boceto**, si tiene: la imagen, qué fija y qué es solo un ejemplo.

### Etiquetas

| Etiqueta | Cuándo |
|---|---|
| `tipo: error` | Algo no funciona como debe |
| `tipo: mejora` | Funciona, pero puede ser mejor |
| `tipo: contenido` | Textos y niveles |
| `tipo: dificultad` | Calibración: movimientos, tiempos, metas y estrellas |
| `tipo: idea` | Algo nuevo, todavía sin forma |
| `prioridad: alta` | Traba o arruina el juego |
| `prioridad: media` | Conviene resolverlo en la tanda |
| `prioridad: baja` | Detalle |
| `por discutir` | Falta acordar el cambio |
| `boceto` | Tiene boceto aprobado |

### Estados

| Estado del issue | Significa |
|---|---|
| Abierto, con `por discutir` | Registrado, falta acordar |
| Abierto, sin `por discutir` | Acordado; si tiene milestone, va en esa versión |
| Cerrado como completado | Publicado: la versión es la de su milestone |
| Cerrado como *not planned* | Descartado. El motivo queda en un comentario, para no volver a discutirlo |

## Bocetos

Un boceto no se dibuja: es el juego real con los cambios propuestos, capturado a 360 × 780 px con escala 3 (1080 px de ancho, como el teléfono de referencia) con `herramientas/boceto.js`. Lo que muestra es lo que va a quedar.

- Hay boceto cuando el cambio es visual (disposición, tamaños, dibujos, elementos que aparecen o desaparecen) o de sonido. Si es solo texto o comportamiento, alcanza con el issue.
- Se numeran B-01, B-02… Un boceto puede tener varias imágenes (B-01a, B-01b…), una por estado de la pantalla o por estilo. Van en `docs/bocetos/` y se listan en su [índice](docs/bocetos/README.md), con los issues que cubren.
- Si el cambio se ve distinto en 8 y en 16 bits, el boceto muestra los dos.
- En el issue, cada boceto dice **qué fija** y **qué es solo ejemplo** (el avance simulado, el nivel elegido, una cantidad).
- Su código entra en la rama de la versión como un commit propio, «B-01: …». Cada boceto se hace sobre los anteriores de la misma tanda, para que los cambios se sumen en orden.
- Si el texto del issue y el boceto no coinciden, manda el texto. Si un cambio posterior toca una pantalla con boceto, se hace uno nuevo y el anterior se marca como superado en el índice.

## Dificultad

La dificultad se calibra con un bot que juega imperfecto (ver el [manifiesto](docs/manifiesto.md#dificultad)). Cuando una regla del motor o el diseño de un nivel cambian:

1. `node herramientas/probar.js` tiene que terminar sin errores.
2. `node herramientas/medir.js <niveles>` muestra cuánto cambió la tasa de victoria con los valores actuales.
3. Si se apartó de lo buscado, `node herramientas/calibrar.js 400 0.62 <niveles>` recalibra esos niveles y actualiza `codigo/calibrated.json`.
4. Los cambios de movimientos, tiempos o colores que salgan de ahí se cuentan en el pull request y se anotan en el [registro de decisiones](docs/decisiones.md).

La tasa del bot es una guía, no la última palabra: manda cómo se siente el nivel en el teléfono.

## Ramas, commits y pull requests

- **`main`** es lo publicado: GitHub Pages publica lo que está ahí. Solo recibe cambios de documentación y versiones terminadas.
- **Una rama por versión**, `tanda/0.2.0`, con su pull request en borrador desde el primer boceto. Vive mientras dura la tanda y se borra al unirse a `main`.
- **`index.html` se arma**, no se edita: cada commit que toca `codigo/` lleva también el `index.html` armado con `herramientas/armar.js`.
- **Commits**, en español: «B-01: …» para el código de un boceto, «#12: …» para lo que implementa un issue y «0.2.0: …» para el que sube la versión.
- **Al unir**, el pull request se aplasta en un solo commit (*squash*) cuyo título empieza con el número de versión, como pide el [README](README.md#cómo-se-publica-una-versión-nueva). Su descripción lleva «Closes #n» por cada issue, para que se cierren solos.

## Vista previa y pruebas

- La vista previa de cada cambio es el artefacto «Fogonazo» en claude.ai, armado con `node herramientas/vista_previa.js` y abierto en el teléfono.
- Sin claude.ai, sirve cualquier servidor local: `python3 -m http.server` en la carpeta del repositorio y abrir `http://localhost:8000` en Chrome con la vista de teléfono de las herramientas de desarrollo.
- Cada nivel que cambia se juega completo antes de publicar, en los dos estilos si el cambio es visual.

## Idioma

El juego, los issues, los commits y la documentación van en español rioplatense, con voseo, como en el juego. Los textos del juego son amenos, sin errores ni redundancias, y técnicamente correctos: hablan de electrónica de verdad.
