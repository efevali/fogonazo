# Registro de decisiones

Las decisiones de diseño y de producto de Fogonazo, agrupadas por tema, con su fecha, su motivo y lo que se descartó. Sirve para no volver a discutir lo resuelto y para entender por qué el juego es como es.

- Las **reglas vigentes** de interfaz, dibujos, sonido y música están en la guía de estilo, al principio del CSS de `codigo/page.html`. Las del juego, en el [manifiesto](manifiesto.md). Acá figura por qué se decidieron y qué se descartó, sin repetir cada regla.
- Una decisión nueva se suma en su tema con la fecha. Si reemplaza a otra, la anterior se tacha o se aclara «reemplazada el …», no se borra.

Las fechas son de 2026. Hasta el 3/10 el proyecto vivió en claude.ai, en la bitácora «Fogonazo — bitácora del proyecto», con la hora de cada decisión; acá se conserva el día.

## Producto y método

- **Juego de juntar tres para el celular** (3/10). Modo mixto (niveles por movimientos y contrarreloj), componentes electrónicos en pixel art, dificultad en oleadas, nivel 30 alcanzable en algunos intentos y sonido con ajustes.
- **Primero boceto, siempre** (3/10). Antes de cambiar diseño, interfaz o sonido, un boceto para aprobar: capturas o una página para probar. Los arreglos de errores y los ajustes ya acordados se aplican directo. Producto puede pedir implementar sin boceto, como en la caída nueva (3/10).
- **Textos** (3/10). Amenos, en voseo rioplatense, sin errores ni redundancias y técnicamente correctos. Se revisaron todos los textos del juego y de los 30 niveles.
- **GitHub como única fuente de verdad** (4/10). El código, el método, las decisiones y lo pendiente viven en este repositorio, con el mismo método que Kasa. Reemplazó a la bitácora de claude.ai y a la carpeta `fuente/` del artefacto «Fogonazo», que queda como vista previa. Repositorio público.
- **Lo pendiente de la bitácora no pasa al repositorio** (4/10). Evaluar el nivel 29, los niveles de válvulas con 5 colores y la dificultad de los niveles sin pedido de piezas queda para cuando se juegue; si algo aparece, entra como issue.
- **Sin duplicados** (4/10). Se borró el artefacto «Fogonazo en 16 bits» de claude.ai: su contenido es el [muestrario](muestrario.html).
- **Sin llave de prueba** (4/10). Los niveles se juegan en orden, también para probarlos. *Descartado:* una llave que destrabe todos los niveles, como la de Kasa.
- **Versionado desde 0.1.0** (4/10). Las siete publicaciones del artefacto no se numeran; la primera versión del repositorio es la instalable.
- **Licencia: pendiente** (#5).
- **Después de la 0.1.0, una tanda grande** (4/10). Los cambios siguientes (#8, #9, #10 y los que surjan jugando la versión instalada) se juntan antes de implementar, para diseñar y calibrar una sola vez. Hoy el repositorio no tiene licencia (rigen los derechos de autor por defecto).

## Nombre

- **Fogonazo** (3/10). El juego empezó como «Chispazo». El guardado conserva la clave `chispazo.v1` para no perder el avance.

## Reglas del juego

- **Rayo perpendicular a su línea** (4/10, #11). Antes salía en la misma dirección que la línea, y con tres en vertical y la cuarta de costado barría la columna recién hecha. Depende de la línea, no del dedo, para que valga igual en las cascadas.
- **Activar los especiales con un toque** (4/10, #12). Sin nada seleccionado, tocar un especial lo activa y gasta un movimiento, sin confirmación. La batería tocada elige el tipo que más hay. El intercambio por toques sigue: con una pieza seleccionada, tocar un especial vecino los intercambia. *Descartado:* doble toque y que el toque no gaste movimiento.
- **Antena** (4/10, #13, boceto B-03). Especial nuevo que se arma con un cuadrado de 2 × 2: rompe sus 4 vecinas y transmite a un blanco que elige sola según lo que pide el nivel. Rango: batería > sobrecarga > rayo > antena. Con otros especiales hace la combinación «rica» (lleva el rayo o la sobrecarga al blanco; dos antenas, tres transmisiones). Sin cartel en los niveles: se descubre jugando y está en el manual. *Descartados:* que el jugador elija el blanco (más complejo y choca con el toque), que solo transmita sin romper vecinas y que en las combinaciones cada especial se active donde está.
- **Ayuda de piezas del pedido** (3/10). Los niveles 9 y 10 se sentían demasiado difíciles: el juego «retenía» las piezas pedidas. Es una regla del motor para todos los niveles de pedido de piezas, proporcional a los tipos que faltan, sin quitar movimientos. *Descartado:* ajustar solo los niveles 9 y 10, que fue la primera propuesta.
- **Quemados y cinta frenan lo que cae** (3/10). Antes, las piezas de arriba pasaban por detrás de las piezas inmovilizadas. Ahora los lugares tapados se llenan en diagonal, a 45°, desde las columnas vecinas, y un lugar sin camino desde arriba queda vacío hasta que se rompe lo que lo tapa. Los huecos de la placa se siguen atravesando: no hay nada que tape.
- **Válvulas sin bajada libre** (3/10). Podían bajar solas de a un lugar, sin sentido físico; esa regla se había agregado porque tardaban demasiado en bajar. Ahora bajan solo cuando desaparecen las piezas de abajo, siempre derecho, y aparecen en columnas sin obstáculos fijos. Se intercambian como cualquier pieza, solo si el cambio forma una línea. *Descartado:* que nunca se muevan a mano, y tener que combinar de costado para que una válvula esquive un obstáculo.
- **Válvulas por jugada, no por relevo** (8/10, #25). Jugando se vio que salían de a una y siempre por la misma columna: cuando una llegaba al zócalo, el motor forzaba otra en esa misma caída, y la única columna que se rellenaba era la de la que había salido. Ahora la aparición se decide en cada jugada: nunca dos juntas (tampoco al empezar), al menos 3 jugadas entre una y otra, 35 % por jugada después de eso (segura si no queda ninguna) y tope de dos en la placa en todos los niveles. Cae desde arriba por una de las columnas que se rellenan, de preferencia otra que la anterior. *Descartado:* que aparezcan transformando una pieza en cualquier lugar de la placa.

## Modo zen

- **Modo zen** (5/10, #19, boceto B-07). Todo en el juego empujaba hacia la presión; faltaba una forma de jugar con el motor sin poder perder. Placa libre de 8 × 10 con seis componentes, sin límite de movimientos: el reloj cuenta hacia arriba y el puntaje sube hasta que el jugador termina desde la pausa. Récords de puntos (la mejor partida) y de tiempo (la más larga), que se anotan mientras se juega. No da estrellas, no cuenta para el total y es igual en los tres modos de dificultad. *Descartados:* un modo sin ningún número y metas obligatorias.
- **La tarjeta del modo zen, arriba del mapa y desde el principio** (5/10, B-07). Reemplaza el texto de presentación. Ordenar las formas de jugar (una pantalla de inicio u otra organización del mapa) queda para el #20.
- **Encargo optativo** (5/10, #19). Un pedido de un componente, de 12 a 20 piezas, que suma 500 puntos y se renueva con otro componente. Con el bot, los encargos son cerca del 12 % del puntaje: ayudan, pero ignorarlos no impide un récord. Al cumplirlo aparece «Encargo +500» sobre la placa, sin cartel, para no cortar el juego. *Descartado:* el cartel en el centro de la placa, que se probó y tapaba el tablero cada pocas jugadas.
- **La línea de abajo de la placa, sin número** (5/10, #22): «El encargo es optativo: si no lo hacés, no pasa nada». Antes decía «si lo completás, suma 500 puntos», y en 8 bits el 5 de Pixelify Sans se leía como un 8. Lo que suma ya está en el encargo.
- **El vúmetro mide la distancia al récord de puntos** (5/10, B-07), con una estrella verde agua en el récord. Al superarlo aparece una sola vez «¡Nuevo récord!». Sin récord todavía, llega al tope a los 50.000 puntos.

## Niveles y dificultad

- **Tablero de 8 × 10, en vertical** (4/10, #10). El de 8 × 8 lo limita el ancho y debajo sobraban unos 240 px. Las dos filas nuevas van arriba para conservar los diseños, que están pensados contra el borde inferior. Obliga a recalibrar los 30 niveles. *Descartado:* pasar a horizontal (#4).
- **Pedidos más grandes con la placa de 8 × 10** (4/10). Con la placa más grande, la antena y el toque, la recalibración bajó mucho los movimientos (hasta 10 en algunos niveles). En 20 niveles se agrandó el pedido a ojo para volver a partidas de largo parecido a las de antes: más piezas a juntar (3, 4, 6, 7, 9, 10, 23 y 26), más válvulas (21, 22, 23, 25, 29 y 30) y diseños más altos con más pads, cinta o quemados (12, 13, 14, 15, 17, 19 y 27). Después se recalibraron. *Descartado:* aceptar niveles de 10 a 13 movimientos.
- **Calibración con un bot imperfecto** (3/10): 62 % la mejor jugada, 20 % la segunda, 18 % cualquiera; 400 partidas por nivel.
- **Pads fuera del borde inferior y de las esquinas** (3/10). Ahí las líneas se forman entre 3 y 5 veces menos, y los últimos pads tardaban demasiado.
- **Nivel 19 con dos pasos por fila de quemados** (3/10): `bb.bb.bb`. Con la caída nueva, las filas enteras encerraban 24 lugares que quedaban vacíos, y en contrarreloj eso frustra más de lo que desafía. *Descartado:* dejarlo como un nivel de abrir paso.
- **Nivel 29 sin cambios** (3/10). No tiene ninguna columna libre de obstáculos: las válvulas aparecen en cualquiera y esperan sobre el obstáculo hasta que se rompe; romperlo ya es parte del pedido. *Descartado:* rediseñarlo con columnas libres. La dificultad se evalúa jugando.
- **Niveles de válvulas con 5 colores** (3/10): 22, 23, 25, 29 y 30, propuesta de Claude, a evaluar jugando. Sin la bajada libre, con 6 colores una válvula tardaba una mediana de 25 movimientos en llegar al zócalo (con 5, 8), y esos niveles pedían entre 36 y 70 movimientos. El costo es que ahí no aparecen el capacitor cerámico ni el cristal. *Alternativa, si se extrañan:* 6 colores con menos válvulas.

- **Recalibración de los niveles de válvulas** (8/10, #25). Con la regla nueva cambió el ritmo: los de tope uno (21, 29 y 30) se volvieron más fáciles, porque puede haber dos válvulas a la vez, y los de tope dos (22, 23 y 25), más difíciles, porque ya no arrancan con dos ni se reponen al instante. Movimientos en Difícil: 21 Tríodo 18 → 15, 22 Radio a válvulas 22 → 25, 23 Amplificador valvular 16 → 17, 25 Transmisor AM 17 → 19, 29 Osciloscopio 13 → 12 y 30 Computadora de 8 bits 15 → 13.
- **Tasa de victoria buscada de los niveles 9 y 10** (4/10). `codigo/levels.js` pedía 70 % y 62 %, pero se calibraron con 82 % y 74 %. Se igualan con lo calibrado, para que una recalibración completa no los vuelva más difíciles. No cambia el juego.
- **Tres modos de dificultad** (5/10, #15, boceto B-05). Jugando la 0.2.0, sacar dos estrellas costaba mucho. En vez de bajar la dificultad para todos, cada uno elige en Ajustes: Fácil, Normal (por defecto, un poco más suave que la 0.2.0) y Difícil (la 0.2.0). Se tocan solo los movimientos o el tiempo y los umbrales de estrellas, no los pedidos: cambiar los pedidos es rediseñar cada nivel. Los factores salieron del bot (ver el [manifiesto](manifiesto.md#dificultad)).
- **Una estrella vale lo mismo en cualquier modo, con récords por modo** (5/10, #15). El total del mapa suma lo mejor de cada nivel; el mapa muestra las estrellas del modo elegido, para que completar cada modo sea una meta; tocando el total se ven las de cada modo. Es un récord personal: sin cuentas no hay comparación con otros. *Descartados:* que Fácil tenga un tope de dos estrellas, y tres contadores separados sin total común.
- **El avance anterior a los modos pasa a Difícil** (5/10): se jugó con la dificultad de la 0.2.0. En Normal el mapa arranca sin estrellas, con los niveles abiertos. *Descartado:* pasarlo a Normal, que lo anotaría en un modo más fácil que el jugado.

## Estilo visual

- **Banco de trabajo de electrónica** (3/10). Tapete antiestático, la placa en el centro e instrumentos en el tablero: display de 7 segmentos para los movimientos, display fluorescente para los puntos y un vúmetro de LEDs para las estrellas. Tema oscuro único, a propósito.
- **16 bits como alternativa, no como reemplazo** (3/10). 8 bits es el estilo por defecto y no se saca. El selector «Gráficos» está en los Ajustes del mapa y en la pausa.
- **El estilo cambia la consola completa** (3/10): dibujos, interfaz, tipografía, música y efectos. Se tomó como modelo la diferencia entre la NES y la Sega Genesis.
- **Tipografía de 16 bits: la opción A** (3/10), Jersey 25 para títulos y Jersey 15 para textos y botones. *Descartadas:* B (Jersey 25 + DotGothic16, la letra fina de los juegos de rol de Super Nintendo) y C (Workbench + VT323, al estilo Amiga). Las tres se ven en el [muestrario](muestrario.html).
- **Componentes de 8 bits más finos** (4/10, #9, boceto B-02). Se veían «gordos»: ocupaban casi todo el casillero con cuerpos anchos. Se afinaron las proporciones, con cuerpos más angostos y patas más largas, sin cambiar paleta ni tamaño. *Descartado:* achicar los mismos dibujos al 80 % del casillero, que los achica sin quitarles lo ancho.
- **Contador de estrellas en una fila propia** (3/10), bajo el título: en pantallas angostas lo tapaba.
- **Sin ligaduras tipográficas** (3/10): Pixelify Sans unía «fi» y «fl» en un signo que parecía una «A».
- **Cartel de fin de nivel en 16 bits con panel de fondo** (3/10): sin él, el texto metálico no se leía.

## Sonido y música

- **Tres temas por estilo** (3/10): uno para el mapa, uno para los niveles por movimientos y uno para el contrarreloj. Se elige el estilo, no un tema por nivel.
- **El tema de 8 bits es el original, sin cambios** (3/10). El del mapa y el del contrarreloj se compusieron a partir de él. Los de 16 bits son arreglos FM de las mismas notas, «ensuciados» porque la primera versión sonaba demasiado suave y definida.
- **Sonido de línea** (3/10): el original en 8 bits y la opción B «Bip» en 16. El de 16 bits anterior sonaba a campana, molestaba y salía 2,5 veces más fuerte que el resto. *Descartadas:* A «Chispa» y C «Descarga», que también se escuchan en el [muestrario](muestrario.html).
- **Efectos de 16 bits nivelados con los de 8** (3/10): salían entre 3 y 8 veces más fuertes. La música de 16 bits va al 60 % para no tapar los efectos.
- **Tema propio para el modo zen** (5/10, #19, boceto B-08). Más tranquilo y menos serio que los de los niveles, con el mismo tempo que «Placa» (104 ppm): tonalidad mayor, acordes con séptima, bajo largo, sin hi-hats seguidos e instrumentos suaves en los dos estilos. Se mezcló unos 2 dB por debajo de «Placa». Se eligió escuchando la A, «Siesta» (fa mayor, Fmaj7 Em7 Dm7 C), la más equilibrada. *Descartadas:* B «Pecera» (sol mayor, la más juguetona, con bajo que rebota y shaker) y C «Atardecer» (re mayor, la más calma, sin percusión); las tres se escuchan en la [página de B-08](bocetos/B-08-musica-zen.html).
- **Volumen general 15 % más alto** (5/10): en el teléfono todo sonaba un poco bajo. Se revisó la cadena de sonido y no había nada raro (el compresor final evita que sature), así que se subió la ganancia general de 0,9 a 1,035. Los niveles de efectos y música de Ajustes no cambian.

## Versión instalable

- **Instalable desde Chrome, sin APK** (4/10), como Kasa. *Descartado:* un APK hecho con PWABuilder.
- **La tarjeta «Instalar» va siempre antes del primer bloque** (5/10, #18, boceto B-06), sin depender del avance. *Antes:* arriba del bloque del nivel actual (B-01).
- **Para Android** (3/10): es el teléfono en el que se juega.
- **GitHub Pages, en `efevali.github.io/fogonazo`** (4/10). El repositorio se renombró a minúscula antes de publicar: la dirección no se puede cambiar después de instalar sin perder las versiones nuevas y el avance (lo que le pasó a Kasa). *Descartado:* Netlify, que sin cuenta publica por una hora.
- **El avance empieza de cero** (4/10). El de claude.ai no pasa a la versión instalable. *Descartado:* un código para copiar el avance de una a otra.
- ~~**Orientación horizontal: a evaluar**~~ (#4). Descartada el 4/10: el juego sigue en vertical. En horizontal, el tablero cuadrado queda más chico, porque lo limita el alto.
- ~~**La 0.1.0 espera a decidir dónde vive Fogonazo**~~ (4/10, #7). Resuelto el mismo día: sigue en `efevali.github.io`.
- **Fogonazo sigue en `efevali.github.io/fogonazo`, junto a Kasa** (4/10, #7). El riesgo más probable es borrar los datos de navegación de Chrome con «Cookies y datos de sitios» marcado (viene así por defecto), y eso borra todos los sitios a la vez: separar los juegos no lo evita. *Descartados:* una organización de GitHub por producto (solo protege en casos poco frecuentes) y un dominio propio (tiene costo).
- **Sin copia de seguridad del avance, por ahora** (4/10, #7). *Descartados:* exportar e importar (el navegador no deja guardar una copia fuera del sitio sin que el usuario la maneje), Google Drive del jugador (trámite con Google y ventana para renovar el permiso), un servicio de cuentas (responsabilidad sobre datos de terceros) y guardar en Git (la credencial quedaría expuesta en el juego). El análisis está en el #7. La evolución del guardado queda para más adelante.
- **Clave de producto para resguardar el avance** (6/10, #23, boceto B-09). Supera a «Sin copia de seguridad del avance, por ahora». Un serial con el formato de las claves de Windows XP, como los códigos de los juegos de NES: empieza con FCKGW (homenaje a la clave más famosa), usa el alfabeto de XP (24 caracteres, sin vocales ni 0, 1 y 5) y ocupa tres renglones de cinco grupos. Guarda las estrellas de cada nivel en cada modo y los récords zen; el control de errores hace que un carácter mal copiado dé clave inválida. «Copiar clave» copia los tres renglones juntos y «Cargar una clave» acepta el bloque pegado tal cual. Vive en una pantalla «Progreso», dentro de Ajustes, junto con «Borrar progreso» y el aviso de Chrome. *Descartados:* un solo renglón (237 bits no entran en 20 caracteres de ningún alfabeto que se pueda tipear o copiar sin que se rompa), dos renglones con minúsculas o signos (deja de parecer una clave de XP, y WhatsApp y las notas cambian `*`, `_`, `~` y las comillas), guardar el récord de puntos de cada nivel (serían unos 230 caracteres más: al cargar una clave arrancan de cero) y guardar los ajustes (son del teléfono, no del avance).
- **Aviso en Ajustes de dónde vive el avance** (4/10, #8, boceto B-04): una línea en letra chica entre «Borrar progreso» y la versión, que explica cómo no borrarlo desde Chrome. Se informó la misma propuesta en Kasa (efevali/kasa#30).
