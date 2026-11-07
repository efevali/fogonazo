# Colección de minijuegos

Una colección de minijuegos para el celular, en horizontal, que se instala desde Chrome como una sola app, por ahora con el nombre provisorio «Minijuegos». Se entra por la sala, un living de los 70 ilustrado, y algunos de sus objetos llevan a los juegos. Todavía no tiene nombre: el repositorio conserva el de `fogonazo` hasta que lo tenga (ver [decisiones](docs/decisiones.md#la-colección)).

| Juego | Qué es | Estado |
|---|---|---|
| [Fogonazo](docs/fogonazo/README.md) | Juntar tres con componentes electrónicos sobre una protoboard, en el banco de la sala | Jugable dentro de la app: los 30 primeros niveles y el zen |
| [Mahjong](docs/mahjong/README.md) | Mahjong solitario, en modo zen, sobre la mesa ratona | En la app desde la 0.7.0 |
| [Buen ojo](docs/buenojo/README.md) | Ver un color unos segundos y armarlo de memoria con pomos de pintura, en la mesa de un pintor | En la app desde la 0.14.0 |

## Estado

- **Publicada** en https://efevali.github.io/fogonazo/, que se abre en Chrome y se instala desde los ajustes de la sala (el equipo de audio) o desde el menú ⋮ → «Instalar app». Funciona sin conexión. La 0.1.0 reemplazó a Fogonazo como juego único (0.6.1); qué trae cada versión está en el [registro de cambios](CHANGELOG.md).
- **Qué tiene:** la sala con sus objetos activos; Fogonazo jugable (instrumento, mapa, los 30 niveles hechos a mano y los generados sin fin, con sus especiales y obstáculos, y el zen); el mahjong en la mesa ratona (el estuche y seis tableros, en zen); Buen ojo, desde el cuadro del arcoíris (tres dificultades y la práctica); cada juego con su música y sus efectos; los ajustes comunes (sonido, versión e instalación). Nombre e ícono son provisorios.
- **Lo que sigue**, en [la colección](docs/coleccion.md#lo-que-sigue).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Qué es la colección y lo común a todos los juegos | [`docs/coleccion.md`](docs/coleccion.md) |
| Cómo se ve y cómo suena cada parte | [`docs/estilo.md`](docs/estilo.md) |
| Cómo se piden y se montan las imágenes hechas con IA | [`docs/imagenes.md`](docs/imagenes.md) |
| Por qué se decidió cada cosa y qué se descartó | [`docs/decisiones.md`](docs/decisiones.md) |
| Cada parte (la sala, Fogonazo, el mahjong y Buen ojo): estado, reglas, bocetos y arte | [`docs/sala/`](docs/sala/README.md), [`docs/fogonazo/`](docs/fogonazo/README.md), [`docs/mahjong/`](docs/mahjong/README.md), [`docs/buenojo/`](docs/buenojo/README.md) |
| El método de trabajo | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Lo publicado | [`CHANGELOG.md`](CHANGELOG.md) |

## Qué hay en el repositorio

La app no se arma: lo que está en el repositorio es lo que publica GitHub Pages, tal cual.

| Carpeta o archivo | Qué es |
|---|---|
| `index.html` | La página contenedora: muestra una pantalla por vez y resuelve lo común (ver `comun/app.js`). |
| `comun/` | Lo común a toda la colección: `app.js` (pantallas, «atrás» de Android, sonido por pantalla, instalación), `pantalla.js` (lo que cada pantalla usa de la contenedora), `sonido.js` (el sonido sintetizado: voces, efectos y temas de Fogonazo y del mahjong, lluvia y volúmenes) y `fuentes/` (las tipografías, con sus licencias). |
| `sala/` | La sala: la página, la imagen, la copia aclarada para el brillo y las máscaras de los objetos activos. |
| `fogonazo/` | Fogonazo: la pantalla-instrumento, el mapa, la partida, el avance (`estado.js`), las escenas, los fondos de la partida y las piezas recortadas. |
| `mahjong/` | El mahjong: el estuche, la partida, las fichas (`fichas.js`), los tableros (`tableros.js`), el avance (`estado.js`) y el fondo. |
| `buenojo/` | Buen ojo: el block, la partida y la práctica, las cuentas del color (`color.js`), el avance (`estado.js`) y la mesa (`mesa.css`). |
| `codigo/` | El motor de Fogonazo (`engine.js`), los niveles (`levels.js`: los 30 hechos a mano y el generador del 31 en adelante) y la calibración de los hechos a mano (`calibrated.json`), que usa la partida. Corren igual en el navegador y en Node. |
| `manifest.webmanifest`, `sw.js`, `iconos/` | La ficha de instalación (Minijuegos, en horizontal, a pantalla completa), el *service worker* que guarda la app en el teléfono para que ande sin conexión, y los íconos provisorios. |
| `docs/` | La documentación, los bocetos y el arte vigente. Lo que está en `docs/` también se publica, pero no forma parte de la app. |
| `herramientas/` | Pruebas, capturas, versión, íconos, calibración y los dibujos con código de los bocetos (ver abajo). |
| `.github/` | Las plantillas de issue y de pull request. |
| `package.json` | Los comandos y las dependencias de las herramientas (Playwright). La app no tiene dependencias. |
| `.nojekyll` | Le indica a GitHub Pages que publique los archivos tal cual. |

## Herramientas

Hace falta Node 18 o más nuevo; para las capturas, `npm install` y, la primera vez, `npx playwright install chromium`. Para probar en la computadora: `python3 -m http.server` en la carpeta del repositorio y abrir `http://localhost:8000` en Chrome, con la vista de teléfono en horizontal.

- `herramientas/capturas.js`: recorre la app como en el teléfono (sala, ajustes, Fogonazo, mapa, partida, pausa y vuelta), verifica el «atrás» de Android y que abra sin conexión, y saca una captura de cada pantalla en `dist/capturas/`. Se corre antes de publicar.
- `herramientas/version.js`: sube la versión (`parche`, `menor` o `mayor`) en `sw.js`, con la fecha, y rehace la lista de archivos que el *service worker* guarda. Sin argumento, solo rehace la lista: hace falta cada vez que se suma o se quita un archivo de la app.
- `herramientas/mahjong/probar.js`: verifica los tableros del mahjong y juega cada reparto al azar, para dar una idea de la dificultad. `herramientas/mahjong/boceto-mahjong.html` y `composicion-p006.html`: los bocetos S-19 y S-20 y la composición del P-006.
- `herramientas/buenojo/probar.js`: verifica las cuentas de Buen ojo (CIEDE2000 contra los pares de referencia, el puntaje, las frases, la ayuda y el sorteo de colores).
- `herramientas/iconos.py`: los íconos provisorios, desde la imagen del P-007, la ventana con la lámpara (Python con Pillow).
- `herramientas/probar.js`: juega 180 partidas con el bot y 6 partidas zen de 300 jugadas, y verifica que la placa quede siempre consistente. Se corre después de tocar el motor de Fogonazo.
- `herramientas/calibrar.js`: recalibra la dificultad de Fogonazo (`node herramientas/calibrar.js 400 0.62 16,17,18`: 400 partidas por nivel, con un bot que elige la mejor jugada el 62 % de las veces): el límite de Difícil y las estrellas de los tres modos. Sin lista de niveles (o con `todos`), recalibra los 30; con `--estrellas`, deja el límite y rehace solo las estrellas.
- `herramientas/registro.js`: lee uno o más registros de partidas exportados desde la sala, resume lo jugado en cada juego y vuelve a jugar en el motor cada partida de Fogonazo para verificar que dé lo mismo que en el teléfono (ver [`docs/coleccion.md`](docs/coleccion.md#registro-de-partidas)).
- `herramientas/medir.js`, `modos.js`, `bots.js` y `ayuda_piezas.js`: la tasa de victoria con los valores actuales, cómo quedan los modos de dificultad (victorias y estrellas), la comparación entre bots y el efecto de la ayuda de piezas del pedido en cada modo.
- `herramientas/sala/`: los dibujos con código de los bocetos (`escena-banco.html`, `escena-instrumento*.html`, `arte-s10.js`, `catalogo-s10.html`, `referencia-p005.html`) y los recortes de las imágenes sobre magenta (`piezas.py` y `obstaculos.py`, con Python, Pillow, NumPy y SciPy).

## Cómo se publica una versión

1. Los cambios se prueban en la computadora y con `node herramientas/capturas.js`; si se tocó el motor de Fogonazo, también `node herramientas/probar.js`.
2. Se sube el número: `node herramientas/version.js parche|menor|mayor`.
3. Se suma la versión a `CHANGELOG.md`.
4. Se une el pull request de la versión a `main` en un solo commit cuyo título empieza con el número («0.2.0: …»). GitHub Pages la publica en un minuto o dos.

En el teléfono, la versión nueva se baja sola y entra al cerrar la app del todo y volver a abrirla, o al tocar «Actualizar» en los ajustes de la sala, que muestran la versión instalada.

## Versiones

Versionado semántico: MAYOR.MENOR.PARCHE. Un parche arregla sin sumar nada; una menor suma algo sin romper lo anterior; mientras el primer número sea 0, la colección está en desarrollo. Cada versión se encuentra en el historial («Commits») porque el título de su commit empieza con el número, y se registra en [CHANGELOG.md](CHANGELOG.md).

## Licencia

Todos los derechos reservados: el repositorio se puede ver y jugar, pero reutilizar el código, los dibujos o la música pide permiso (ver [LICENSE](LICENSE)). Las tipografías conservan sus propias licencias, en `comun/fuentes/`.
