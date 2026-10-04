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
- **Licencia: pendiente** (#5). Hoy el repositorio no tiene licencia (rigen los derechos de autor por defecto).

## Nombre

- **Fogonazo** (3/10). El juego empezó como «Chispazo». El guardado conserva la clave `chispazo.v1` para no perder el avance.

## Reglas del juego

- **Ayuda de piezas del pedido** (3/10). Los niveles 9 y 10 se sentían demasiado difíciles: el juego «retenía» las piezas pedidas. Es una regla del motor para todos los niveles de pedido de piezas, proporcional a los tipos que faltan, sin quitar movimientos. *Descartado:* ajustar solo los niveles 9 y 10, que fue la primera propuesta.
- **Quemados y cinta frenan lo que cae** (3/10). Antes, las piezas de arriba pasaban por detrás de las piezas inmovilizadas. Ahora los lugares tapados se llenan en diagonal, a 45°, desde las columnas vecinas, y un lugar sin camino desde arriba queda vacío hasta que se rompe lo que lo tapa. Los huecos de la placa se siguen atravesando: no hay nada que tape.
- **Válvulas sin bajada libre** (3/10). Podían bajar solas de a un lugar, sin sentido físico; esa regla se había agregado porque tardaban demasiado en bajar. Ahora bajan solo cuando desaparecen las piezas de abajo, siempre derecho, y aparecen en columnas sin obstáculos fijos. Se intercambian como cualquier pieza, solo si el cambio forma una línea. *Descartado:* que nunca se muevan a mano, y tener que combinar de costado para que una válvula esquive un obstáculo.

## Niveles y dificultad

- **Calibración con un bot imperfecto** (3/10): 62 % la mejor jugada, 20 % la segunda, 18 % cualquiera; 400 partidas por nivel.
- **Pads fuera del borde inferior y de las esquinas** (3/10). Ahí las líneas se forman entre 3 y 5 veces menos, y los últimos pads tardaban demasiado.
- **Nivel 19 con dos pasos por fila de quemados** (3/10): `bb.bb.bb`. Con la caída nueva, las filas enteras encerraban 24 lugares que quedaban vacíos, y en contrarreloj eso frustra más de lo que desafía. *Descartado:* dejarlo como un nivel de abrir paso.
- **Nivel 29 sin cambios** (3/10). No tiene ninguna columna libre de obstáculos: las válvulas aparecen en cualquiera y esperan sobre el obstáculo hasta que se rompe; romperlo ya es parte del pedido. *Descartado:* rediseñarlo con columnas libres. La dificultad se evalúa jugando.
- **Niveles de válvulas con 5 colores** (3/10): 22, 23, 25, 29 y 30, propuesta de Claude, a evaluar jugando. Sin la bajada libre, con 6 colores una válvula tardaba una mediana de 25 movimientos en llegar al zócalo (con 5, 8), y esos niveles pedían entre 36 y 70 movimientos. El costo es que ahí no aparecen el capacitor cerámico ni el cristal. *Alternativa, si se extrañan:* 6 colores con menos válvulas.

## Estilo visual

- **Banco de trabajo de electrónica** (3/10). Tapete antiestático, la placa en el centro e instrumentos en el tablero: display de 7 segmentos para los movimientos, display fluorescente para los puntos y un vúmetro de LEDs para las estrellas. Tema oscuro único, a propósito.
- **16 bits como alternativa, no como reemplazo** (3/10). 8 bits es el estilo por defecto y no se saca. El selector «Gráficos» está en los Ajustes del mapa y en la pausa.
- **El estilo cambia la consola completa** (3/10): dibujos, interfaz, tipografía, música y efectos. Se tomó como modelo la diferencia entre la NES y la Sega Genesis.
- **Tipografía de 16 bits: la opción A** (3/10), Jersey 25 para títulos y Jersey 15 para textos y botones. *Descartadas:* B (Jersey 25 + DotGothic16, la letra fina de los juegos de rol de Super Nintendo) y C (Workbench + VT323, al estilo Amiga). Las tres se ven en el [muestrario](muestrario.html).
- **Contador de estrellas en una fila propia** (3/10), bajo el título: en pantallas angostas lo tapaba.
- **Sin ligaduras tipográficas** (3/10): Pixelify Sans unía «fi» y «fl» en un signo que parecía una «A».
- **Cartel de fin de nivel en 16 bits con panel de fondo** (3/10): sin él, el texto metálico no se leía.

## Sonido y música

- **Tres temas por estilo** (3/10): uno para el mapa, uno para los niveles por movimientos y uno para el contrarreloj. Se elige el estilo, no un tema por nivel.
- **El tema de 8 bits es el original, sin cambios** (3/10). El del mapa y el del contrarreloj se compusieron a partir de él. Los de 16 bits son arreglos FM de las mismas notas, «ensuciados» porque la primera versión sonaba demasiado suave y definida.
- **Sonido de línea** (3/10): el original en 8 bits y la opción B «Bip» en 16. El de 16 bits anterior sonaba a campana, molestaba y salía 2,5 veces más fuerte que el resto. *Descartadas:* A «Chispa» y C «Descarga», que también se escuchan en el [muestrario](muestrario.html).
- **Efectos de 16 bits nivelados con los de 8** (3/10): salían entre 3 y 8 veces más fuertes. La música de 16 bits va al 60 % para no tapar los efectos.

## Versión instalable

- **Instalable desde Chrome, sin APK** (4/10), como Kasa. *Descartado:* un APK hecho con PWABuilder.
- **Para Android** (3/10): es el teléfono en el que se juega.
- **GitHub Pages, en `efevali.github.io/fogonazo`** (4/10). El repositorio se renombró a minúscula antes de publicar: la dirección no se puede cambiar después de instalar sin perder las versiones nuevas y el avance (lo que le pasó a Kasa). *Descartado:* Netlify, que sin cuenta publica por una hora.
- **El avance empieza de cero** (4/10). El de claude.ai no pasa a la versión instalable. *Descartado:* un código para copiar el avance de una a otra.
- **Orientación horizontal: a evaluar** (#4).
- **La 0.1.0 espera a decidir dónde vive Fogonazo** (4/10, #7). Está lista (pull request #6, con el boceto B-01 aprobado), pero comparte sitio con Kasa: borrar los datos del sitio desde Chrome borraría los dos avances. Antes de publicar, se ordena la estructura de GitHub común a los proyectos.
