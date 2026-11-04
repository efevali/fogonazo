# Mahjong

El segundo juego de la colección: mahjong solitario, en modo zen. Es la mesa ratona de la sala vista de cerca, como Fogonazo es el banco visto de cerca: las fichas de hueso con dorso verde, el estuche con paño rojo y el nogal. Cómo se ve y cómo suena está en la [guía de estilo](../estilo.md#el-mahjong); por qué es así, en el [registro de decisiones](../decisiones.md#el-mahjong).

- **Arte vigente**, en [`arte/`](arte/): el fondo de la mesa ratona de nogal desde arriba, con el anotador, los palitos de puntaje, los dados y la tetera ([P-006](arte/P-006_fondo-mesa.jpg), de 2576 × 1438; en el teléfono se recorta arriba y abajo). Lo usan las dos pantallas.
- **En la app desde la 0.7.0.** El primer prototipo, en vertical y con la estética de Kasa (24/10), quedó en el historial de Git.

## Cómo es

```
la sala ── mesa ratona ──► el estuche (S-20) ── una tarjeta ──► la partida (S-19)
                            ◀ Volver: la sala                   ◀ Volver: el estuche
                                                                pausa y final (S-21)
```

- **El estuche** (`estuche.html`): el estuche abierto sobre la mesa. En el paño de la tapa, una tarjeta por tablero con su silueta, sus fichas y su récord; el último jugado, marcado. Se toca una tarjeta y arranca. Si hay más tableros de los que entran, se desliza de costado. En la bandeja, las fichas guardadas. El anotador dice qué hacer y cuál fue el último tablero.
- **Los tableros** (`tableros.js`): mariposa (92), fortaleza (80), puente (88), pagoda (88) y tortuga (96), pensados para el teléfono en horizontal, con fichas de unos 7,5 × 10 mm; y la tortuga grande, la clásica de 144, con fichas de unos 5,8 × 7,8 mm. Son seis tarjetas: la última asoma en el borde del estuche y se llega deslizando la fila.
- **La partida** (`partida.html`): se juntan pares de fichas iguales que estén libres (sin otra encima y con un costado despejado); flores con flores y estaciones con estaciones. Las fichas libres se ven más claras, las bloqueadas claramente más oscuras y las capas de abajo, a la sombra de las de arriba (S-23). En el anotador, en lápiz: el tablero, el reloj, los pares que quedan, el récord, los puntos y la cadena. Deshacer, Pista y Barajar van grabados en los palitos de puntaje, sin límite.
- **El reloj** arranca con el primer toque. **El puntaje:** 10 por par, con una cadena que multiplica hasta ×5 si el par siguiente llega antes de 5 segundos, y 100 por tablero limpio. Deshacer, Pista y Barajar cortan la cadena.
- **Sin pares libres,** las fichas que quedan se barajan solas, siempre con salida.
- **La pausa** (S-21a): una tarjeta con el tablero, el tiempo y los puntos, y Seguir, Repartir de nuevo u Otro tablero. **El final** (S-21b): «Tablero limpio», el tiempo, los puntos, el récord y el sello «Nuevo récord» si lo es; Otra vez u Otro tablero.
- **«Atrás»,** como en Fogonazo: en la partida abre la pausa; desde la pausa o el final, vuelve al estuche; desde el estuche, a la sala.
- **Sonido:** Taller oriental en el estuche y Siesta oriental en la partida, con los efectos primos de los de Fogonazo y los volúmenes de toda la colección.
- **Guardado** (`estado.js`), en Chrome: el récord de cada tablero (el menor tiempo y los mejores puntos) y el último jugado.

## Por revisar jugando

- El puntaje, una propuesta de Desarrollo que todavía no se revisó.
- El carácter de la música y el balance de volúmenes.

## Lo que sigue

- Más tableros, que se suman en el estuche deslizando de costado.
- Los palitos en blanco de la entrada como accesos, por ejemplo al sonido (#50).
- El nombre del juego, sin decidir.

## Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| S-19 | La mesa ratona vista de cerca, al tamaño del teléfono: [a · la partida con la tortuga de 144](bocetos/S-19a-partida-tortuga.jpg) (prueba de tamaño) y [b · con la pagoda de 88](bocetos/S-19b-partida-pagoda.jpg). El nogal es un dibujo con código. Se genera con [`herramientas/mahjong/boceto-mahjong.html`](../../herramientas/mahjong/boceto-mahjong.html) | Aprobado (29/10) |
| S-20 | [El estuche abierto como pantalla de entrada](bocetos/S-20-estuche-entrada.jpg), sobre el fondo del P-006. `boceto-mahjong.html?v=entrada` | Aprobado (29/10), con el estuche dibujado con código: no hace falta pintarlo |
| S-21 | La pausa y el final, tarjetas de papel sobre la mesa con los botones como palitos de hueso: [a · la pausa](bocetos/S-21a-pausa.jpg) y [b · el tablero limpio](bocetos/S-21b-fin.jpg), con el sello de récord. Capturas de la app | Aprobado (29/10) |
| S-22 | La tortuga de 96 fichas en seis filas, con fichas del tamaño de las de los otros tableros: [a · la partida](bocetos/S-22a-tortuga-96.jpg) y [b · el estuche con seis tarjetas](bocetos/S-22b-estuche-seis.jpg); la segunda palabra del nombre («grande») va escrita en birome en una esquina | Aprobado (29/10): quedan las dos tortugas |
| S-23 | [Los brillos](bocetos/S-23-brillos.jpg): A, como estaba; B, las libres más claras, más distancia entre capas y las bloqueadas más oscuras; C, lo mismo más marcado | Aprobado (29/10) el B |
| S-25 | [El barajado automático](bocetos/S-25-barajado.jpg): A, como está (con el cartel ya centrado), el cartel y el giro casi a la vez; B, primero el cartel y un segundo después el barajado, con el cartel 3 s en pantalla. Capturas de la app | Aprobado (31/10) el B; en la app desde la 0.10.6 |
| S-27 | [Las fichas, lejos de la tetera](bocetos/S-27-tetera.jpg): hoy y la propuesta, con el puente y la tortuga de 96, los dos que se metían en la tetera. La zona de las fichas termina en x = 800 (antes, 838), unas 19 unidades antes de la tetera; los tableros anchos se achican un poco (el puente 6 %, la tortuga de 96 3 %) y los demás solo se corren a la izquierda. Capturas de la app | Aprobado (1/11) |
| P-006 | El pedido del fondo: [referencia](bocetos/P-006-referencia-mesa.png) (la mesa ratona de la sala) y [composición](bocetos/P-006-composicion.png), de [`herramientas/mahjong/composicion-p006.html`](../../herramientas/mahjong/composicion-p006.html) (con `?guias`, la franja del teléfono y las zonas de la app); el texto, en [imágenes](../imagenes.md#un-pedido-que-salió-a-la-primera). [La entrega](arte/P-006_fondo-mesa.jpg), montada con las fichas: [tortuga](bocetos/P-006-montaje-tortuga.jpg) y [pagoda](bocetos/P-006-montaje-pagoda.jpg) (`boceto-mahjong.html?fondo=…`) | Aprobado (29/10), a la primera con Gemini |

## Notas técnicas

- Vive en [`mahjong/`](../../mahjong/), en la app. `fichas.js` dibuja las 42 fichas (las del prototipo, con el cuerpo de hueso y dorso verde de S-19); `tableros.js` tiene los tableros, qué ficha está libre, el reparto y el barajado; `estado.js`, el guardado; `fondo.webp`, el P-006 para la web.
- **Los ideogramas** usan «Mahjong JP», un subconjunto de Noto Serif CJK JP Bold con solo los 27 que hacen falta (`comun/fuentes/noto-serif-jp-mahjong-700.woff2`, 7 KB, con su licencia OFL), así andan sin conexión.
- **Los tableros** se definen por capas en medias fichas. El reparto quita pares libres al azar desde el tablero lleno y les da caras iguales, así que quitándolos en ese orden siempre tiene salida; esa salida queda guardada para las herramientas, que limpian un tablero sin jugarlo.
- **Las pruebas:** `node herramientas/mahjong/probar.js` verifica los tableros (fichas pares, sin encimadas, todas apoyadas, reparto completo) y juega cada reparto al azar para dar una idea de la dificultad. `herramientas/capturas.js` recorre el estuche, la partida, la pausa, el final y la tortuga, también sin conexión. Para las herramientas, `window.__mahjong` deja ver el estado, juntar un par libre y limpiar el tablero.
- **El sonido** vive en `comun/sonido.js`: koto, flauta, bloque de madera, tamborcito y campana, los efectos y los dos temas orientales.
