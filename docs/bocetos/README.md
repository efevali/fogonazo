# Bocetos

Bocetos aprobados de Fogonazo. Cada uno es el juego real con los cambios propuestos, capturado con `herramientas/boceto.js` a 1080 px de ancho; su código está en la rama de la versión, en un commit «B-xx: …». Las reglas están en [CONTRIBUTING.md](../../CONTRIBUTING.md#bocetos).

| Boceto | Pantalla | Imágenes | Issues | Aprobado | Estado |
|---|---|---|---|---|---|
| B-01 | Mapa, ventana de instalación y Ajustes | [a · mapa, 8 bits](B-01a-mapa-8bits.png), [b · mapa con avance, 16 bits](B-01b-mapa-16bits.png), [c · instalar, 8 bits](B-01c-instalar-8bits.png), [d · instalar, 16 bits](B-01d-instalar-16bits.png), [e · Samsung Internet, 8 bits](B-01e-samsung-8bits.png), [f · Ajustes al día, 8 bits](B-01f-ajustes-8bits.png), [g · versión nueva, 16 bits](B-01g-ajustes-version-nueva-16bits.png), [h · ya instalado, 16 bits](B-01h-instalado-16bits.png) | #2, #3 | 4/10/2026 | Vigente (0.1.0) |
| B-02 | Tablero, componentes de 8 bits | [a · nivel 26](B-02a-componentes-8bits.png), [b · antes y después](B-02b-antes-y-despues-8bits.png) | #9 | 4/10/2026 | Vigente (0.2.0) |
| B-03 | Tablero y manual: la antena | [a · tablero, 8 bits](B-03a-antena-8bits.png), [b · tablero, 16 bits](B-03b-antena-16bits.png), [c · manual, 8 bits](B-03c-manual-8bits.png), [d · manual, 16 bits](B-03d-manual-16bits.png) | #12, #13 | 4/10/2026 | Vigente (0.2.0) |
| B-04 | Ajustes: aviso de dónde vive el avance | [a · 8 bits](B-04a-ajustes-8bits.png), [b · 16 bits](B-04b-ajustes-16bits.png) | #8 | 4/10/2026 | Vigente (0.2.0) |

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
