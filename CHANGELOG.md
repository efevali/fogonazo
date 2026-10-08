# Registro de cambios

Todas las versiones publicadas de Fogonazo, de la más nueva a la más vieja. Sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado semántico que explica el [README](README.md#versiones). Cada versión se encuentra en el historial por el título de su commit, que empieza con el número.

## 0.6.1 — 8/10/2026

- «Atrás» en un nivel: el segundo «atrás» cerraba la app. Ahora la partida va a la pausa y la pausa, al mapa; en zen, la pausa va a «Partida terminada» y de ahí al mapa. Desde el mapa sale de la app ([#27](https://github.com/efevali/fogonazo/issues/27)).

## 0.6.0 — 8/10/2026

Válvulas y «atrás» ([milestone](https://github.com/efevali/fogonazo/milestone/6)).

- Válvulas: ya no salen de a una ni siempre por la misma columna. La partida arranca con una, y las siguientes aparecen con las jugadas, aunque la anterior todavía esté bajando: nunca dos en la misma jugada, con al menos 3 jugadas entre una y otra y como mucho dos a la vez en la placa. Caen desde arriba por una de las columnas que se rellenan, de preferencia otra que la de la anterior ([#25](https://github.com/efevali/fogonazo/issues/25)).
- Dificultad: con la regla nueva se recalibraron los movimientos de los seis niveles con válvulas. En Difícil: Tríodo 15 (antes 18), Radio a válvulas 25 (22), Amplificador valvular 17 (16), Transmisor AM 19 (17), Osciloscopio 12 (13) y Computadora de 8 bits 13 (15). Normal y Fácil salen de esos valores con los factores de siempre.
- El «atrás» del teléfono navega por el juego: en partida abre la pausa, en la presentación y los resultados vuelve al mapa, Progreso vuelve a Ajustes y las demás ventanas se cierran. Solo desde el mapa sale de la app ([#24](https://github.com/efevali/fogonazo/issues/24)).

## 0.5.0 — 6/10/2026

Clave de producto para resguardar el avance ([milestone](https://github.com/efevali/fogonazo/milestone/5), [#23](https://github.com/efevali/fogonazo/issues/23)).

- Ajustes: botón «Progreso», que abre una pantalla nueva con el resumen de estrellas de cada modo y los récords zen.
- Clave de producto: todo el avance en un serial con el formato de las claves de Windows XP, que empieza con FCKGW. Tres renglones de cinco grupos; «Copiar clave» los copia juntos, para guardarlos en las notas, un chat o un mail. Cambia cada vez que se avanza.
- Cargar una clave: se pega el bloque tal cual (acepta saltos de línea, espacios, guiones y minúsculas). Antes de reemplazar el avance muestra qué trae la clave; si está incompleta o mal copiada, lo avisa y no toca nada. Los récords de puntos de cada nivel no viajan en la clave: arrancan de cero.
- «Borrar progreso» y el aviso de cómo no perder el avance desde Chrome pasaron de Ajustes a Progreso.

## 0.4.1 — 5/10/2026

- Modo zen: la línea de abajo de la placa dice «El encargo es optativo: si no lo hacés, no pasa nada». Antes decía cuánto suma, y en 8 bits el 500 se leía como 800 ([#22](https://github.com/efevali/fogonazo/issues/22)).

## 0.4.0 — 5/10/2026

Modo zen ([milestone](https://github.com/efevali/fogonazo/milestone/4)).

- Modo zen: una placa libre, sin límite de movimientos ni reloj en contra. El reloj cuenta hacia arriba, el puntaje sube sin tope y el vúmetro mide cuánto falta para el récord. Se termina desde la pausa, con un cartel de puntos, tiempo y récords.
- Encargo optativo: un pedido de un componente que, al cumplirse, suma 500 puntos y se renueva con otro.
- Récords de puntos y de tiempo, que se guardan mientras se juega. No da estrellas y es igual en los tres modos de dificultad.
- Mapa: la tarjeta del modo zen va arriba, en lugar del texto de presentación.
- Música: tema nuevo para el modo zen, «Siesta», más tranquilo, con instrumentos suaves en 8 y 16 bits.
- Manual: cómo funciona el modo zen.

## 0.3.0 — 5/10/2026

Modos de dificultad ([milestone](https://github.com/efevali/fogonazo/milestone/3)).

- Ajustes: dificultad Fácil, Normal o Difícil. Normal, el de entrada, es un poco más suave que la 0.2.0; Difícil es la 0.2.0. Cambian los movimientos (o el tiempo) y los puntos de cada estrella.
- Una estrella vale lo mismo en cualquier modo y cada modo guarda sus récords. El mapa muestra las estrellas del modo elegido y, bajo el total, «Modo …» con las de ese modo; tocando el total se abre «Récords», con las de cada modo. El avance de antes queda en Difícil.
- La tarjeta «Instalar» va siempre antes del primer bloque.
- Sonido: volumen general 15 % más alto.
- Manual: cómo funciona la dificultad.

## 0.2.0 — 4/10/2026

Tablero 8 × 10 y antena ([milestone](https://github.com/efevali/fogonazo/milestone/2)).

- Placa de 8 × 10: dos filas más arriba, con casilleros del mismo tamaño. En «Placa dañada», los huecos siguen en las cuatro esquinas.
- Especial nuevo, la antena: se arma con un cuadrado de 2 × 2, rompe sus cuatro vecinas y transmite a la pieza que más sirve para el pedido. Combina con los otros especiales.
- Los especiales se activan también tocándolos; el toque cuenta como un movimiento. La batería tocada elimina el tipo que más hay.
- El rayo sale perpendicular a la línea de 4 que lo arma.
- Componentes de 8 bits más finos.
- Ajustes: aviso de que el avance vive en el teléfono y de cómo no borrarlo desde Chrome.
- Pedidos más grandes en 20 niveles (más piezas a juntar, más válvulas y diseños más altos), para que las partidas no se acorten con la placa más grande, la antena y el toque. Los 30 niveles, recalibrados; los de puntaje piden más puntos.

## 0.1.0 — 4/10/2026

Versión instalable ([milestone](https://github.com/efevali/fogonazo/milestone/1)).

- Fogonazo se instala en Android desde Chrome y funciona sin conexión: manifiesto, service worker, tipografías locales (también las de 16 bits) e íconos del LED.
- Mapa: tarjeta «Instalar» arriba del bloque actual y ventana de instalación guiada; desde Samsung Internet, ofrece seguir en Chrome. Ya instalado, la tarjeta dice «Listo».
- Ajustes: fila «Versión» con «Buscar» y, cuando hay una nueva, «Actualizar»; LED verde en el engranaje mientras haya una versión nueva.
- El avance de la versión instalable empieza de cero.
- Niveles 9 y 10: la tasa de victoria buscada coincide con la calibrada (el juego no cambia).

## Antes del repositorio

El 3 de octubre de 2026, Fogonazo se hizo como artefacto de claude.ai, en siete publicaciones sin número de versión: los 30 niveles, los estilos de 8 y 16 bits, la música y los efectos, la ayuda de piezas del pedido y la caída que frenan los quemados y la cinta. El juego con el que arranca el repositorio es la última de ellas. Qué se decidió en ese tiempo y por qué está en el [registro de decisiones](docs/decisiones.md).
