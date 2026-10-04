# Fogonazo

Juego de juntar tres con componentes electrónicos para el celular: 30 circuitos para armar sobre una placa de 8 × 8, en 8 o 16 bits.

- **Juego:** https://efevali.github.io/fogonazo/ (se abre en Chrome y se instala con el botón «Instalar» del mapa, o desde el menú ⋮ → «Instalar app»). Funciona sin conexión.
- **Vista previa:** el artefacto «Fogonazo» en claude.ai, donde se prueba cada cambio antes de publicarlo acá.
- **Cómo se trabaja:** issues, milestones, bocetos y pull requests, en [CONTRIBUTING.md](CONTRIBUTING.md). Lo publicado, en [CHANGELOG.md](CHANGELOG.md). Qué es el juego y por qué es como es, en [`docs/`](docs/README.md).

## Qué hay en cada archivo

| Archivo o carpeta | Qué es |
|---|---|
| `index.html` | El juego entero, en un solo archivo. **No se edita a mano:** lo arma `herramientas/armar.js` a partir de `codigo/`. Es lo que publica GitHub Pages. |
| `manifest.webmanifest` | La ficha que Android lee para instalarlo: nombre, ícono, colores, que abra sin barra del navegador y en vertical. |
| `sw.js` | El *service worker*: guarda el juego en el teléfono para que funcione sin conexión y maneja las versiones nuevas. |
| `fuentes/` | Silkscreen, Pixelify Sans, Jersey 15 y Jersey 25, con sus licencias (SIL OFL 1.1). |
| `iconos/` | El ícono (el LED de 16 bits con su destello, sobre la placa) en los tamaños que pide Android. |
| `codigo/` | El código del juego, sin dependencias (ver abajo). |
| `herramientas/` | Armado, pruebas, calibración de la dificultad, versión, vista previa, íconos, tipografías y bocetos (ver abajo). |
| `docs/` | El manifiesto del juego, el registro de decisiones, los bocetos aprobados y el muestrario de pantallas y sonidos (ver su [índice](docs/README.md)). |
| `CONTRIBUTING.md` | El método de trabajo: issues, etiquetas, bocetos, ramas y commits. |
| `CHANGELOG.md` | El registro de las versiones publicadas. |
| `.github/` | Las plantillas de issue y de pull request. |
| `package.json` | Los comandos y las dependencias de las herramientas (tipografías y Playwright). El juego no tiene dependencias. |
| `.nojekyll` | Le indica a GitHub Pages que publique los archivos tal cual, sin procesarlos. |

### El código

| Archivo | Qué es |
|---|---|
| `codigo/engine.js` | El motor, sin pantalla: tablero, líneas, especiales, obstáculos, caída, válvulas, bonus, ayuda de piezas del pedido, el bot y la duración de cada animación. Corre igual en el navegador y en Node. |
| `codigo/levels.js` | Los 30 niveles (nombre, componentes, pedido, diseño de la placa, texto y tasa de victoria buscada) y los 6 bloques. |
| `codigo/calibrated.json` | El resultado de la calibración: movimientos o tiempo, meta de puntos y umbrales de estrellas de cada nivel. Lo escribe `herramientas/calibrar.js`. |
| `codigo/page.html` | Estilos (8 y 16 bits) y estructura de la página. |
| `codigo/sprites.js`, `codigo/sprites16.js` | Los dibujos en 8 bits (16 × 16) y en 16 bits (32 × 32). |
| `codigo/audio.js` | La música y los efectos, sintetizados en el navegador: 8 bits tipo NES y 16 bits FM tipo Genesis. |
| `codigo/game.js` | Tablero, animaciones, instrumentos del tablero, menús, guardado y flujo del juego. |

## Cómo se arma

Hace falta Node 18 o más nuevo.

```
node herramientas/armar.js
```

escribe `index.html` en la raíz. Para las herramientas que copian tipografías o sacan capturas, primero `npm install` y, la primera vez, `npx playwright install chromium`. Para probarlo: `python3 -m http.server` en la carpeta del repositorio y abrir `http://localhost:8000` en Chrome, con la vista de teléfono de las herramientas de desarrollo.

## Cómo se publica una versión nueva

1. Los cambios se hacen en `codigo/`, se arma `index.html` y se prueban en la vista previa (el artefacto «Fogonazo», abierto en el teléfono), armada con `node herramientas/vista_previa.js`.
2. Si cambiaron las reglas o los niveles, `node herramientas/probar.js` tiene que pasar y los niveles afectados se recalibran (ver «Dificultad» en [CONTRIBUTING.md](CONTRIBUTING.md#dificultad)).
3. Se sube el número de versión (ver «Versiones»): `node herramientas/version.js parche|menor|mayor`.
4. Se suma la versión a `CHANGELOG.md`.
5. Se une el pull request de la versión a `main` en un solo commit cuyo título empieza con el número de versión («0.2.0: …»); un parche urgente puede ir directo. GitHub Pages la publica en un minuto o dos.

En el teléfono, el juego encuentra la versión nueva al abrirse, al volver a él después de un rato o con «Buscar» en Ajustes. Aparece «Hay una versión nueva» en Ajustes y un LED verde en el engranaje; «Actualizar» lo reabre ya actualizado. Si no se toca, entra sola al cerrar el juego del todo y volver a abrirlo.

## Versiones

Fogonazo usa **versionado semántico**: tres números, MAYOR.MENOR.PARCHE.

- **Parche** (0.1.0 → 0.1.1): arreglos que no suman nada nuevo.
- **Menor** (0.1.1 → 0.2.0): algo nuevo que no rompe lo anterior, como una función, un ajuste de dificultad o niveles nuevos.
- **Mayor** (0.x → 1.0.0): mientras el primer número es 0, el juego está en desarrollo. La **1.0.0** es la versión estable y revisada, sin pendientes ni dudas. Después de la 1.0, el mayor sube solo cuando algo rompe lo anterior (por ejemplo, si el avance guardado dejara de ser compatible).

Cada versión publicada se encuentra en el historial del repositorio («Commits») por su número: el título de su commit empieza con él. El registro está en [CHANGELOG.md](CHANGELOG.md). El teléfono no compara números: toma lo último que se publica. Para volver a una versión anterior se publica su contenido con un número nuevo; el historial conserva todo.

## Herramientas

- `herramientas/armar.js`: arma `index.html`.
- `herramientas/probar.js`: juega 180 partidas con el bot y verifica que el tablero quede siempre consistente. Se corre después de tocar el motor.
- `herramientas/calibrar.js`: recalibra la dificultad (`node herramientas/calibrar.js 400 0.62 16,17,18`: 400 partidas por nivel, con un bot que elige la mejor jugada el 62 % de las veces). Sin lista de niveles, recalibra los 30.
- `herramientas/medir.js`: la tasa de victoria del bot con los valores calibrados actuales, para ver cuánto cambia un nivel después de tocar reglas.
- `herramientas/bots.js`: compara un bot como el de la calibración con uno fuerte y uno perfecto, en los 30 niveles.
- `herramientas/ayuda_piezas.js`: mide los niveles de pedido de piezas con y sin la ayuda de piezas del pedido.
- `herramientas/version.js`: sube la versión (`parche`, `menor` o `mayor`) en el juego y en `sw.js`, pone la fecha de hoy y vuelve a armar. Con `fecha`, solo cambia la fecha.
- `herramientas/vista_previa.js`: arma la vista previa para el artefacto de claude.ai (el mismo `index.html`, con las tipografías adentro del archivo y sin manifiesto) en `dist/vista-previa.html`.
- `herramientas/fuentes.js`: copia las tipografías de los paquetes de npm a `fuentes/`, con sus licencias, y verifica que tengan todos los caracteres de los textos del juego.
- `herramientas/iconos.js`: dibuja los íconos con los dibujos de 16 bits del juego (`herramientas/iconos.html`).
- `herramientas/boceto.js`: captura una pantalla tal como se ve en el teléfono, con el avance y el estilo que se le indiquen, para los bocetos (ver [CONTRIBUTING.md](CONTRIBUTING.md#bocetos)).

## Progreso

Se guarda en el teléfono, dentro de los datos de Chrome para este sitio, con la clave `chispazo.v1` (el nombre anterior del juego). El juego le pide a Android que no lo borre por falta de espacio. Para empezar de cero está «Borrar progreso», en Ajustes, que borra solo el avance de Fogonazo.

El sitio, `efevali.github.io`, es el mismo de Kasa: comparten los datos de Chrome, aunque cada uno guarda lo suyo con su propia clave y su service worker solo toca lo propio. Por eso, borrar los datos del sitio desde la configuración de Chrome borra el avance de los dos.

El avance de la vista previa de claude.ai es aparte: se guarda en la cuenta de claude.ai y no pasa a la versión instalable.
