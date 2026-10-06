# Bocetos

Bocetos aprobados de Fogonazo. Cada uno es el juego real con los cambios propuestos, capturado con `herramientas/boceto.js` a 1080 px de ancho; su código está en la rama de la versión, en un commit «B-xx: …». Las reglas están en [CONTRIBUTING.md](../../CONTRIBUTING.md#bocetos).

| Boceto | Pantalla | Imágenes | Issues | Aprobado | Estado |
|---|---|---|---|---|---|
| B-01 | Mapa, ventana de instalación y Ajustes | [a · mapa, 8 bits](B-01a-mapa-8bits.png), [b · mapa con avance, 16 bits](B-01b-mapa-16bits.png), [c · instalar, 8 bits](B-01c-instalar-8bits.png), [d · instalar, 16 bits](B-01d-instalar-16bits.png), [e · Samsung Internet, 8 bits](B-01e-samsung-8bits.png), [f · Ajustes al día, 8 bits](B-01f-ajustes-8bits.png), [g · versión nueva, 16 bits](B-01g-ajustes-version-nueva-16bits.png), [h · ya instalado, 16 bits](B-01h-instalado-16bits.png) | #2, #3 | 4/10/2026 | Vigente (0.1.0) |
| B-02 | Tablero, componentes de 8 bits | [a · nivel 26](B-02a-componentes-8bits.png), [b · antes y después](B-02b-antes-y-despues-8bits.png) | #9 | 4/10/2026 | Vigente (0.2.0) |
| B-03 | Tablero y manual: la antena | [a · tablero, 8 bits](B-03a-antena-8bits.png), [b · tablero, 16 bits](B-03b-antena-16bits.png), [c · manual, 8 bits](B-03c-manual-8bits.png), [d · manual, 16 bits](B-03d-manual-16bits.png) | #12, #13 | 4/10/2026 | Vigente (0.2.0) |
| B-04 | Ajustes: aviso de dónde vive el avance | [a · 8 bits](B-04a-ajustes-8bits.png), [b · 16 bits](B-04b-ajustes-16bits.png) | #8 | 4/10/2026 | Vigente (0.2.0) |
| B-05 | Mapa, Ajustes y Récords: modos de dificultad | [a · mapa, 8 bits](B-05a-mapa-8bits.png), [b · mapa, 16 bits](B-05b-mapa-16bits.png), [c · Ajustes, 8 bits](B-05c-ajustes-8bits.png), [d · Ajustes, 16 bits](B-05d-ajustes-16bits.png), [e · Récords, 8 bits](B-05e-records-8bits.png), [f · Récords, 16 bits](B-05f-records-16bits.png) | #15 | 5/10/2026 | Vigente (0.3.0) |
| B-06 | Mapa: lugar de la tarjeta «Instalar» | [a · 8 bits](B-06a-instalar-8bits.png), [b · 16 bits](B-06b-instalar-16bits.png) | #18 | 5/10/2026 | Vigente (0.3.0) |
| B-07 | Mapa y partida: modo zen | [a · mapa, 8 bits](B-07a-mapa-zen-8bits.png), [b · mapa, 16 bits](B-07b-mapa-zen-16bits.png), [c · partida, 8 bits](B-07c-partida-zen-8bits.png), [d · partida, 16 bits](B-07d-partida-zen-16bits.png) | #19 | 5/10/2026 | Vigente (0.4.0) |
| B-08 | Música del modo zen | [página de prueba](B-08-musica-zen.html): tres opciones en 8 y 16 bits, y «Placa» para comparar | #19 | 5/10/2026 | Vigente (0.4.0): la A, «Siesta» |

Cómo se capturó cada imagen de B-01 (`node herramientas/boceto.js docs/bocetos/<imagen> …`):

| Imagen | Opciones |
|---|---|
| a | sin opciones (de cero, 8 bits) |
| b | `--16 --avance "1-7:3,8:1"` |
| c | `--accion "F.abrirPasos()"` |
| d | `--16 --accion "F.abrirPasos()"` |
| e | `--accion "F.abrirSamsung()"` |
| f | `--avance "1-7:3,8:1" --accion "F.UI.settings()"` |
| g | `--16 --avance "1-7:3,8:1" --accion "F.APPV.nueva = true; F.pintarVersion(); F.UI.settings()"` |
| h | `--16 --accion "F.marcarInstalado(); F.APPV.nueva = true; F.pintarVersion()" --accion "scrollTo(0, 0)"` |

Lo que fija B-01: los textos, la disposición y los colores de la tarjeta, la ventana, la fila de versión, el LED del engranaje y los avisos, en los dos estilos. Es solo ejemplo: el avance simulado, el número y la fecha de la versión, y en h, la combinación de juego instalado con versión nueva, que se muestra junta para ver los dos estados en una imagen.

B-02 se capturó antes de abrir la rama de la versión; su código entró después en `tanda/0.2.0` y da la misma imagen. El tablero es el mismo en las dos imágenes porque se fijó la semilla del azar: `node herramientas/boceto.js docs/bocetos/B-02a-componentes-8bits.png --avance "1-29:3" --accion "let s=4242; Math.random=()=>((s=(s*1103515245+12345)%2147483648)/2147483648)" --accion "F.Game.open(26)" --accion "document.querySelector('#mGo').click()"`. B-02b junta el tablero de esa captura con el de antes.

Lo que fija B-02: las proporciones y las formas de los siete componentes en 8 bits. Es solo ejemplo el tablero. *Descartada:* la alternativa B, los mismos dibujos al 80 % del casillero.

Cómo se capturaron B-03 y B-04 (`node herramientas/boceto.js docs/bocetos/<imagen> …`). En B-03a y b, la semilla es la de B-02 y las antenas se ponen a mano en el tablero, porque el motor todavía no las arma:

| Imagen | Opciones |
|---|---|
| B-03a | `--avance "1-29:3" --accion "<semilla>" --accion "F.Game.open(26)" --accion "document.querySelector('#mGo').click()" --accion "const g=F.Game.g, seen=new Set(); for (const i of [9,13,19,26,34,42,50,53]) { const p=g.p[i]; if (p && p.k===0 && !seen.has(p.c) && seen.size<4) { seen.add(p.c); p.k=7; } } F.View.reset(g)"` |
| B-03b | las mismas, con `--16` |
| B-03c | `--avance "1-29:3" --accion "F.UI.help()" --accion "[...document.querySelectorAll('.legend h3')].find(h=>h.textContent==='Especiales').scrollIntoView({block:'start'})"` |
| B-03d | las mismas, con `--16` |
| B-04a | `--avance "1-7:3,8:1" --accion "F.UI.settings()"` |
| B-04b | las mismas, con `--16` |

Lo que fija B-03: la marca de la antena (ondas que salen de los dos costados de la pieza, animadas) y los textos del manual sobre la antena y el toque. Es solo ejemplo dónde están las antenas, que ahí no se forman jugando. Lo que fija B-04: el texto del aviso, su lugar entre «Borrar progreso» y la versión, y su tamaño. Los nombres de las opciones de Chrome se confirman en el teléfono.

Cómo se capturó B-05 (`node herramientas/boceto.js docs/bocetos/<imagen> [--16] --accion "<avance> " --accion "<pantalla>"`). El avance por modo se carga a mano: `const D={1:1,2:1,3:1,4:1,5:2,6:1,7:2,8:1,9:1,10:1,11:1,12:1,13:1,14:1}, N={1:3,2:2,3:3,4:2,5:2,6:1,7:3,8:2}, Fa={1:3,2:3}; const S=F.Save; S.settings.mode='normal'; S.data.modes={dificil:{stars:D,best:{}},normal:{stars:N,best:{}},facil:{stars:Fa,best:{}}}; const t={}; for(const m of [D,N,Fa]) for(const k in m) t[k]=Math.max(t[k]||0,m[k]); S.data.stars=t; F.UI.renderMap()`. Pantalla: a y b, `document.querySelector('#scr-map').scrollTo(0,0)`; c y d, `F.UI.settings()`; e y f, `F.UI.records()`.

Lo que fija B-05: el selector de tres posiciones arriba de todo en Ajustes; la fila «Modo …» bajo el total, con las estrellas de ese modo; que el mapa muestre las estrellas del modo elegido; la ventana «Récords» que se abre tocando el total, y sus textos. Es solo ejemplo el avance simulado.

B-06 se capturó con el mismo avance que B-05 (pantalla a y b). Fija que la tarjeta «Instalar» va siempre antes de U1; supera a B-01 solo en ese punto.

Cómo se capturó B-07 (`node herramientas/boceto.js docs/bocetos/<imagen> [--16] --avance "1-7:3,8:1" --accion "…"`), con el código del commit «B-07», que solo armaba la pantalla de la partida: a y b, `F.Save.data.zen={best:12480,time:1112}; F.UI.renderMap(); document.querySelector('#scr-map').scrollTo(0,0)`; c y d, la semilla de B-02 y después `F.Save.data.zen={best:12480,time:1112}; F.Game.openZen(); F.Seg.set(document.querySelector('#segMoves'),'1247'); F.HUD.target=F.HUD.shown=7350; F.Seg.set(document.querySelector('#segScore'),7350); F.HUD.renderVU(7350); F.HUD.setGoals([9])`.

Lo que fija B-07: el lugar, el aspecto y los textos de la tarjeta del modo zen (que reemplaza el texto de presentación); en la partida, el reloj que cuenta hacia arriba, el vúmetro hacia el récord con su estrella verde agua y el encargo con borde punteado, «Encargo» y «+500». Es solo ejemplo: los récords, el tiempo, los puntos, el componente y la cantidad del encargo.

B-08 es una página para escuchar, no una captura: se abre en Chrome y tiene adentro una copia de `codigo/audio.js` de la rama de la versión. Las tres opciones tienen el tempo de «Placa» (104 ppm), tonalidad mayor e instrumentos suaves, y van unos 2 dB por debajo de «Placa». Fija los instrumentos suaves y el tempo. Se eligió la A, «Siesta»; la B y la C quedan descartadas y solo viven en esta página.
