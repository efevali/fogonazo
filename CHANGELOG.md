# Registro de cambios

Todas las versiones publicadas de Fogonazo, de la más nueva a la más vieja. Sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado semántico que explica el [README](README.md#versiones). Cada versión se encuentra en el historial por el título de su commit, que empieza con el número.

## 0.2.0 — 4/10/2026

Tablero 8 × 10 y antena ([milestone](https://github.com/efevali/fogonazo/milestone/2)).

- Placa de 8 × 10: dos filas más arriba, con casilleros del mismo tamaño. En «Placa dañada», los huecos siguen en las cuatro esquinas.
- Especial nuevo, la antena: se arma con un cuadrado de 2 × 2, rompe sus cuatro vecinas y transmite a la pieza que más sirve para el pedido. Combina con los otros especiales.
- Los especiales se activan también tocándolos; el toque cuenta como un movimiento. La batería tocada elimina el tipo que más hay.
- El rayo sale perpendicular a la línea de 4 que lo arma.
- Componentes de 8 bits más finos.
- Ajustes: aviso de que el avance vive en el teléfono y de cómo no borrarlo desde Chrome.
- Los 30 niveles, recalibrados: con la placa más grande, la antena y el toque, casi todos piden menos movimientos o menos tiempo, y los de puntaje piden más puntos.

## 0.1.0 — 4/10/2026

Versión instalable ([milestone](https://github.com/efevali/fogonazo/milestone/1)).

- Fogonazo se instala en Android desde Chrome y funciona sin conexión: manifiesto, service worker, tipografías locales (también las de 16 bits) e íconos del LED.
- Mapa: tarjeta «Instalar» arriba del bloque actual y ventana de instalación guiada; desde Samsung Internet, ofrece seguir en Chrome. Ya instalado, la tarjeta dice «Listo».
- Ajustes: fila «Versión» con «Buscar» y, cuando hay una nueva, «Actualizar»; LED verde en el engranaje mientras haya una versión nueva.
- El avance de la versión instalable empieza de cero.
- Niveles 9 y 10: la tasa de victoria buscada coincide con la calibrada (el juego no cambia).

## Antes del repositorio

El 3 de octubre de 2026, Fogonazo se hizo como artefacto de claude.ai, en siete publicaciones sin número de versión: los 30 niveles, los estilos de 8 y 16 bits, la música y los efectos, la ayuda de piezas del pedido y la caída que frenan los quemados y la cinta. El juego con el que arranca el repositorio es la última de ellas. Qué se decidió en ese tiempo y por qué está en el [registro de decisiones](docs/decisiones.md).
