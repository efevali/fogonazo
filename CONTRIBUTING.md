# Cómo se trabaja en la colección

La colección se desarrolla con el flujo habitual de GitHub, el mismo de [Kasa](https://github.com/efevali/kasa): **issues** para lo que hay que cambiar, **milestones** para agrupar cada versión, **pull requests** para el código y un **registro de cambios** para lo publicado. Este repositorio es la única fuente de verdad: lo que no está acá no está acordado.

Qué hay en cada carpeta está en el [README](README.md); qué es la colección, en [`docs/coleccion.md`](docs/coleccion.md).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Lo que falta cambiar (errores, mejoras, contenido, dificultad, ideas) | [Issues](https://github.com/efevali/fogonazo/issues) |
| Qué entra en cada versión | [Milestones](https://github.com/efevali/fogonazo/milestones), uno por versión |
| Lo que todavía no tiene versión asignada | Issues abiertos sin milestone |
| El código de la versión en preparación | El [pull request](https://github.com/efevali/fogonazo/pulls) en borrador de su rama |
| Lo común a todos los juegos y lo que sigue | [`docs/coleccion.md`](docs/coleccion.md) |
| Reglas de dibujo, interfaz, letras y sonido | [`docs/estilo.md`](docs/estilo.md) |
| Cómo se piden las imágenes a una IA | [`docs/imagenes.md`](docs/imagenes.md) |
| Por qué se decidió cada cosa y qué se descartó | [`docs/decisiones.md`](docs/decisiones.md) |
| Cada parte: estado, reglas, bocetos y arte | [`docs/sala/`](docs/sala/README.md), [`docs/fogonazo/`](docs/fogonazo/README.md), [`docs/mahjong/`](docs/mahjong/README.md) |
| Qué salió en cada versión | [`CHANGELOG.md`](CHANGELOG.md) |

## Roles

- **Producto** (la cuenta efevali): decide qué se cambia, juega en el teléfono (Android, con Chrome) y aprueba bocetos, pedidos de imágenes y versiones. Revisa sobre el juego, no sobre el código. Hace los pedidos a la IA de imágenes y trae las entregas.
- **Desarrollo**: propone, revisa cada pantalla por su cuenta además de las observaciones que recibe, prepara los bocetos, arma la lámina y el texto de cada pedido de imágenes, revisa las entregas e implementa. Las inconsistencias de código las corrige directamente; consulta si implican un cambio grande de estructura. Ante cualquier duda de producto, pregunta.
- **La IA de imágenes** (Gemini o ChatGPT, la que tenga cupo) es una herramienta: dibuja lo que se le pide, sin rol en las decisiones. Ver [`docs/imagenes.md`](docs/imagenes.md).

Criterios que valen siempre:

- **Primero se conversa y se acuerda, después se implementa.** Nada se cambia en el código en el momento de la revisión.
- **Primero boceto, siempre.** Antes de cambiar diseño, interfaz o sonido se muestra un boceto para aprobar. Los arreglos de errores y los ajustes ya acordados se aplican directo, y también lo que Producto pida implementar sin boceto.
- **De lo general a lo particular.** La estructura se define antes que las pantallas, y las pantallas antes que los detalles.
- **Lo visual se aprueba viéndolo, al tamaño del teléfono; el sonido, escuchándolo**, en una página de prueba con las opciones.
- **Implementación integral**: no se publica nada aislado ni se dejan cabos sueltos.
- **Sin duplicados**: lo que está en el juego o en este repositorio no se guarda aparte. Lo superado se borra, con la aprobación de Producto: queda en el historial de Git.

## Qué va directo a `main`

La documentación, los bocetos, los pedidos de imágenes y el arte aprobado van con commits directos a `main`: no tocan la app. Los cambios grandes de documentación, en una rama con su pull request, para revisarlos juntos. El código de la app va siempre en la rama de su versión.

## El ciclo

1. **Revisión.** Se juega en el teléfono, pantalla por pantalla. Cada observación (una captura con un comentario) se discute antes de registrarla.
2. **Issue.** Lo acordado se carga como issue con la plantilla «Observación», redactado para que alguien pueda implementarlo sin haber visto la conversación ni la captura.
3. **Boceto.** Si el cambio es visual o de sonido, se aprueba sobre un boceto (ver «Bocetos»).
4. **Tanda.** Los issues acordados se agrupan en el milestone de la versión en preparación, para probar pocos cambios por vez.
5. **Implementación.** Lo que los bocetos no cubren se hace según el texto de cada issue. Si cambian las reglas o los niveles de un juego, se corren sus pruebas y se recalibra (ver la documentación de cada juego).
6. **Publicación.** Con el ok, se sube la versión, se une el pull request a `main`, se borra la rama y se suma la versión a `CHANGELOG.md`. Los issues de la tanda se cierran solos.

**Excepción:** lo que traba un juego (algo que no se puede terminar, un error que lo cuelga o que borra el avance) no espera la tanda: se arregla en una rama propia y se publica enseguida como parche.

## Issues

Cada issue lleva título (el cambio, en una línea), **dónde** (la sala, el juego y la pantalla), qué se observó, el cambio acordado, cómo se verifica y, si tiene, el boceto: qué fija y qué es solo ejemplo.

| Etiqueta | Cuándo |
|---|---|
| `tipo: error` | Algo no funciona como debe |
| `tipo: mejora` | Funciona, pero puede ser mejor |
| `tipo: contenido` | Textos y niveles |
| `tipo: dificultad` | Calibración: movimientos, tiempos, metas y estrellas |
| `tipo: idea` | Algo nuevo, todavía sin forma |
| `prioridad: alta` | Traba o arruina un juego |
| `prioridad: media` | Conviene resolverlo en la tanda |
| `prioridad: baja` | Detalle |
| `por discutir` | Falta acordar el cambio |
| `boceto` | Tiene boceto aprobado |

| Estado del issue | Significa |
|---|---|
| Abierto, con `por discutir` | Registrado, falta acordar |
| Abierto, sin `por discutir` | Acordado; si tiene milestone, va en esa versión |
| Cerrado como completado | Publicado: la versión es la de su milestone |
| Cerrado como *not planned* | Descartado. El motivo queda en un comentario, para no volver a discutirlo |

## Bocetos

- **Qué se boceta:** todo cambio visual (disposición, tamaños, dibujos, lo que aparece o desaparece) o de sonido. Si es solo texto o comportamiento, alcanza con el issue.
- **Cómo:** capturas de tamaño real del teléfono en horizontal (915 × 412 a densidad 2,625, unos 2400 × 1080 píxeles), dibujadas con código o montadas sobre las imágenes vigentes; el sonido, en una página de prueba.
- **Numeración única para toda la colección:** S-01, S-02… para los bocetos, con una letra por imagen (S-10a, S-10b…), y P-001, P-002… para los pedidos de imágenes. Cada boceto va en la carpeta `bocetos/` de su parte (`docs/sala/`, `docs/fogonazo/`, `docs/mahjong/`) y se lista en el README de esa parte, con su estado.
- Cada boceto dice **qué fija** y **qué es solo ejemplo**. Si el texto acordado y el boceto no coinciden, manda el texto.
- Cuando un boceto queda superado o descartado, se borra; su motivo, si importa, queda en el registro de decisiones.

## Ramas, commits y pull requests

- **`main`** es lo publicado: GitHub Pages publica lo que está ahí.
- **Una rama por versión**, que nace de `main` al día: `tanda/0.x.y` para una tanda y `parche/0.x.y` para un arreglo urgente; los cambios grandes de documentación, en `docs/…`. Guarda en GitHub lo que todavía no se publica (la sesión de Desarrollo corre en una máquina que se puede borrar).
- **Cada rama, su pull request**, con lo que trae la versión y «Closes #n» por cada issue que resuelve. Es la página donde se ve lo que está en curso.
- **Se une a `main` con el OK de Producto para publicar**, en un solo commit cuyo título empieza con el número («0.4.0: …»): los issues se cierran solos y la versión queda en el historial, lista para volver a ella. La rama se borra sola al unirse (opción del repositorio). *Antes* (27/10 a la 0.13.0): una sola rama `trabajo`, sin pull requests; se dejó porque había que realinearla después de cada versión y no mostraba qué estaba en curso.
- **Commits** en español: «S-10: …» para un boceto, «P-005: …» para un pedido de imágenes, «#12: …» para lo que implementa un issue y «0.2.0: …» para la versión.
- **Para volver atrás:** se publica como versión nueva el contenido de la versión a la que se quiere volver; el historial conserva todo.

## Pruebas

- Antes de publicar, `node herramientas/capturas.js` recorre la app, verifica el «atrás» y el funcionamiento sin conexión, y deja una captura de cada pantalla para compararla con los bocetos. Desarrollo le pasa las capturas a Producto con el pedido de publicar.
- En la computadora, con un servidor local (ver el [README](README.md#herramientas)). En el teléfono, después de publicar: si algo falla, se arregla con un parche.
- Lo que cambia se juega completo antes de publicar.

## Idioma

Los juegos, los issues, los commits y la documentación van en español rioplatense, con voseo. Los textos de los juegos son amenos, sin errores ni redundancias.
