# Bocetos

Bocetos aprobados de Fogonazo. Cada uno es el juego real con los cambios propuestos, capturado con `herramientas/boceto.js` a 1080 px de ancho; su código está en la rama de la versión, en un commit «B-xx: …». Las reglas están en [CONTRIBUTING.md](../../CONTRIBUTING.md#bocetos).

| Boceto | Pantalla | Imágenes | Issues | Aprobado | Estado |
|---|---|---|---|---|---|
| B-01 | Mapa, ventana de instalación y Ajustes | [a · mapa, 8 bits](B-01a-mapa-8bits.png), [b · mapa con avance, 16 bits](B-01b-mapa-16bits.png), [c · instalar, 8 bits](B-01c-instalar-8bits.png), [d · instalar, 16 bits](B-01d-instalar-16bits.png), [e · Samsung Internet, 8 bits](B-01e-samsung-8bits.png), [f · Ajustes al día, 8 bits](B-01f-ajustes-8bits.png), [g · versión nueva, 16 bits](B-01g-ajustes-version-nueva-16bits.png), [h · ya instalado, 16 bits](B-01h-instalado-16bits.png) | #2, #3 | 4/10/2026 | Vigente (0.1.0) |
| B-02 | Tablero, componentes de 8 bits | [a · nivel 26](B-02a-componentes-8bits.png), [b · antes y después](B-02b-antes-y-despues-8bits.png) | #9 | 4/10/2026 | Aprobado, sin implementar |

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

B-02 se capturó antes de abrir la rama de la versión: las filas de los sprites están en el #9 y se agregaron a `codigo/sprites.js` solo para la captura. El tablero es el mismo en las dos imágenes porque se fijó la semilla del azar: `node herramientas/boceto.js docs/bocetos/B-02a-componentes-8bits.png --avance "1-29:3" --accion "let s=4242; Math.random=()=>((s=(s*1103515245+12345)%2147483648)/2147483648)" --accion "F.Game.open(26)" --accion "document.querySelector('#mGo').click()"`. B-02b junta el tablero de esa captura con el de antes.

Lo que fija B-02: las proporciones y las formas de los siete componentes en 8 bits. Es solo ejemplo el tablero. *Descartada:* la alternativa B, los mismos dibujos al 80 % del casillero.
