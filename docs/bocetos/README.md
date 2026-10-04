# Bocetos

Bocetos aprobados de Fogonazo. Cada uno es el juego real con los cambios propuestos, capturado con `herramientas/boceto.js` a 1080 px de ancho; su código está en la rama de la versión, en un commit «B-xx: …». Las reglas están en [CONTRIBUTING.md](../../CONTRIBUTING.md#bocetos).

| Boceto | Pantalla | Imágenes | Issues | Aprobado | Estado |
|---|---|---|---|---|---|
| B-01 | Mapa, ventana de instalación y Ajustes | [a · mapa, 8 bits](B-01a-mapa-8bits.png), [b · mapa con avance, 16 bits](B-01b-mapa-16bits.png), [c · instalar, 8 bits](B-01c-instalar-8bits.png), [d · instalar, 16 bits](B-01d-instalar-16bits.png), [e · Samsung Internet, 8 bits](B-01e-samsung-8bits.png), [f · Ajustes al día, 8 bits](B-01f-ajustes-8bits.png), [g · versión nueva, 16 bits](B-01g-ajustes-version-nueva-16bits.png), [h · ya instalado, 16 bits](B-01h-instalado-16bits.png) | #2, #3 | 4/10/2026 | Vigente (0.1.0) |

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
