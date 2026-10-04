# Fogonazo

Juego de juntar tres con componentes electrónicos para el celular: 30 circuitos para armar sobre una placa de 8 × 8, en 8 o 16 bits.

- **Juego:** https://efevali.github.io/fogonazo/ (se abre en Chrome).
- **Vista previa:** el artefacto «Fogonazo» en claude.ai, donde se prueba cada cambio antes de publicarlo acá.

## Qué hay en cada archivo

| Archivo o carpeta | Qué es |
|---|---|
| `index.html` | El juego entero, en un solo archivo. **No se edita a mano:** lo arma `herramientas/armar.js` a partir de `codigo/`. Es lo que publica GitHub Pages. |
| `codigo/` | El código del juego, sin dependencias (ver abajo). |
| `herramientas/` | Armado, pruebas y calibración de la dificultad (ver abajo). |
| `package.json` | Los comandos de npm. |
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

escribe `index.html` en la raíz. Para probarlo: `python3 -m http.server` en la carpeta del repositorio y abrir `http://localhost:8000` en Chrome, con la vista de teléfono de las herramientas de desarrollo.

## Herramientas

- `herramientas/armar.js`: arma `index.html`.
- `herramientas/probar.js`: juega 180 partidas con el bot y verifica que el tablero quede siempre consistente. Se corre después de tocar el motor.
- `herramientas/calibrar.js`: recalibra la dificultad (`node herramientas/calibrar.js 400 0.62 16,17,18`: 400 partidas por nivel, con un bot que elige la mejor jugada el 62 % de las veces). Sin lista de niveles, recalibra los 30.
- `herramientas/medir.js`: la tasa de victoria del bot con los valores calibrados actuales, para ver cuánto cambia un nivel después de tocar reglas.
- `herramientas/bots.js`: compara un bot como el de la calibración con uno fuerte y uno perfecto, en los 30 niveles.
- `herramientas/ayuda_piezas.js`: mide los niveles de pedido de piezas con y sin la ayuda de piezas del pedido.

## Progreso

Se guarda en el teléfono, dentro de los datos de Chrome para este sitio, con la clave `chispazo.v1` (el nombre anterior del juego; se conserva para no perder el avance).
