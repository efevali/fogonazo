# Imágenes hechas con IA

Cómo se piden, se revisan y se montan las imágenes de la colección. Las reglas de cómo tienen que verse están en la [guía de estilo](estilo.md).

## Quién hace qué

- **La IA de imágenes pinta:** fondos, escenas y piezas. Se usa la que tenga cupo: Gemini (que Producto paga) o ChatGPT (gratuito, con cupo limitado; conviene guardarlo para las imágenes grandes, con el pedido bien armado desde el boceto).
- **Desarrollo hace todo lo demás:** el boceto de composición, la lámina de referencia, el texto del pedido, la revisión de la entrega, los recortes, las zonas táctiles, los brillos, las animaciones y el código.
- **Producto** aprueba el pedido, lo hace en la IA y trae la entrega.

## Cómo se pide

- **En una conversación común con la IA**, sin herramientas intermedias (ni Gems ni documentos compartidos).
- **Dos imágenes, en este orden:** primero el resultado esperado (por ejemplo, una entrega ya aprobada sobre magenta, para que copie la terminación), después el boceto o la lámina de Desarrollo. ChatGPT acepta solo dos imágenes por pedido.
- **El texto, autocontenido:** todo lo que la IA necesita para el trabajo, y nada que no pueda ver ni usar (rutas, historial, enlaces de este repositorio).
- **Cambios puntuales sobre la misma base.** Para corregir algo, se le pide que cambie una sola cosa y deje todo lo demás «exactamente igual». Funciona: al corregir el mahjong de la sala cambió alrededor del 1 % de la imagen y el resto quedó idéntico píxel por píxel. Importa porque las zonas táctiles y las animaciones se miden sobre la imagen: si algo se mueve, hay que volver a medir.
- **Se numeran** P-001, P-002…, una numeración única para toda la colección.

## Piezas sueltas

- **Sobre fondo magenta**, parejo, sin sombras ni halos, para recortarlas. No verde croma, porque la bobina de Fogonazo es verde.
- **En una grilla** (por ejemplo, de 4 × 2), en el orden de la lámina, con la misma luz y terminación entre sí.
- **Se recortan con código:** `herramientas/biblioteca/recortar.py` (las de Biblioteca: objetos, llaves, libros, puertas y fondos, en WebP), `herramientas/sala/piezas.py` (piezas con patas, que acorta, y sombra suave) y `herramientas/sala/obstaculos.py` (objetos que ocupan la casilla entera o van debajo de una pieza), que exportan PNG de 256 × 256 a `fogonazo/piezas/`. Las que deben reemplazarse una por otra (los tres pads de Fogonazo) tienen que salir del mismo tamaño.

## La entrega

- **En PNG si se puede, bajada con la opción de descarga de la IA.** Desde el P-010, Gemini solo entrega JPG (2576 × 1438): sirve igual, también para las láminas sobre magenta. Copiarla, compartirla o capturarla da una vista previa de baja resolución; de Gemini, la descarga dio 2752 × 1536. Que la IA la suba a otro lado también la achica.
- **Se revisa antes de aprobar:** que respete la composición, el orden y los colores pedidos; la lógica de los objetos; que lo importante quede en la franja central; y, en las piezas, que el fondo sea parejo y el recorte salga limpio.
- **Lo aprobado se guarda en la carpeta `arte/` de su parte**, y se cuenta en su README. Lo que reemplaza a otra imagen la reemplaza en el repositorio: la anterior queda en el historial de Git.

## Pedidos cerrados

| Pedido | Qué | Con qué IA | Vigente |
|---|---|---|---|
| P-001 | Corrección del mahjong de la sala | Gemini | [`sala/arte/sala-v2.png`](sala/arte/sala-v2.png) |
| P-002 y P-003 | Las siete piezas de Fogonazo; el P-003 rehízo la resistencia | Gemini | [`fogonazo/arte/P-003_piezas-fogonazo.jpg`](fogonazo/arte/P-003_piezas-fogonazo.jpg) |
| P-004 | La escena de la pantalla-instrumento de Fogonazo | ChatGPT (con Gemini se apartó del boceto) | [`fogonazo/arte/P-004_escena-instrumento.png`](fogonazo/arte/P-004_escena-instrumento.png) |
| P-005 | Especiales y obstáculos de Fogonazo | Gemini, ya en una conversación común | [`fogonazo/arte/P-005_especiales-obstaculos.jpg`](fogonazo/arte/P-005_especiales-obstaculos.jpg) |
| P-006 | El fondo de la partida del mahjong: la mesa ratona desde arriba | Gemini, a la primera | [`mahjong/arte/P-006_fondo-mesa.jpg`](mahjong/arte/P-006_fondo-mesa.jpg) |
| P-007 | El ícono con la lámpara más arriba | Gemini: subió la lámpara, pero rehízo la imagen con un encuadre más abierto (ver abajo) | [`sala/arte/P-007_icono.jpg`](sala/arte/P-007_icono.jpg) |
| P-008 | El fondo de Buen ojo: la mesa del pintor desde arriba | Gemini, a la primera | [`buenojo/arte/P-008_fondo-mesa.jpg`](buenojo/arte/P-008_fondo-mesa.jpg) |
| P-009 | El block de Buen ojo sobre la mesa del P-008 | Gemini, al segundo intento: el primero lo centró. Con la posición en píxeles y las distancias a los bordes, la respetó | [`buenojo/arte/P-009_block-mesa.jpg`](buenojo/arte/P-009_block-mesa.jpg) |
| P-010 | El fondo de la partida de Biblioteca: la pared y el mueble de 4 × 3 | Gemini; Producto le pidió en la misma charla darle profundidad al mueble, que el boceto tenía plano, y quedó mejor | [`biblioteca/arte/P-010_fondo-partida.jpg`](biblioteca/arte/P-010_fondo-partida.jpg) |
| P-011 | El mismo fondo con el mueble de 3 × 3, para Fácil | Gemini, como cambio puntual sobre el P-010: lo respetó, pero con la columna del medio un 9 % más angosta. Pedirle que la igualara no cambió nada (0,03 % de la imagen); se ensanchó a mano duplicando una tira | [`biblioteca/arte/P-011_fondo-facil.jpg`](biblioteca/arte/P-011_fondo-facil.jpg) |
| P-012 | Los diez libros: los siete del juego y los tres de la dificultad | Gemini, a la primera; los números de las enciclopedias salieron bien | [`biblioteca/arte/P-012_libros.jpg`](biblioteca/arte/P-012_libros.jpg) |
| P-013 | Los nueve adornos | Gemini, a la primera, con más volumen que el P-012; las láminas siguientes lo tomaron de referencia | [`biblioteca/arte/P-013_adornos.jpg`](biblioteca/arte/P-013_adornos.jpg) |
| P-014 | Los seis casetes y las dos llaves | Gemini, a la primera; los huecos de los carretes vinieron en magenta y se rellenan al recortar | [`biblioteca/arte/P-014_casetes-llaves.jpg`](biblioteca/arte/P-014_casetes-llaves.jpg) |
| P-015 | La puerta de vidrio (solo el marco) y la reja | Gemini, casi cuadradas en vez de apaisadas: se llevaron a mano a la proporción del casillero, con la cerradura sin deformar | [`biblioteca/arte/P-015_puertas.jpg`](biblioteca/arte/P-015_puertas.jpg) |
| P-017 | La gata de la sala: calicó, dormida y ovillada, sobre magenta, con la sala adjunta de referencia de estilo y luz | Gemini, a la primera | [`sala/arte/P-017_gata.jpg`](sala/arte/P-017_gata.jpg) |
| P-018 | La gata moviendo la cola (video de 10 s) | Gemini, sobre el primer cuadro de un video anterior. El primero (la gata del P-017 animada) se movía demasiado y no cerraba en el mismo cuadro: se descartó | [`sala/arte/P-018_gata-cola.mp4`](sala/arte/P-018_gata-cola.mp4) |
| P-019 | La gata solo respirando (video de 10 s) | Gemini, a la primera, desde la misma imagen que el P-018; respiraba algo rápido y se pasa al 70 % | [`sala/arte/P-019_gata-respira.mp4`](sala/arte/P-019_gata-respira.mp4) |
| P-020 | La gata estirándose un poco y volviendo a dormir (video de 10 s) | Gemini, a la primera, desde la misma imagen. Quieta 3 s, bosteza, estira las patas delanteras y vuelve a la pose a los 7 s. Al estirarse se sale del recorte de los otros dos: se agrandó el recorte de los tres. Al final la gata queda un poco más blanda que al principio, sin que se note en el empalme; se pasa al 70 % | [`sala/arte/P-020_gata-estira.mp4`](sala/arte/P-020_gata-estira.mp4) |
| P-021 | La gata levanta la cabeza, mira a cámara y vuelve a dormir (video de 10 s) | Gemini, a la primera, desde la misma imagen. Quieta 3 s, abre los ojos y levanta la cabeza (3 a 4,2 s), mira fija (hasta 5,4 s), baja y vuelve a la pose a los 7,3 s. Entra en el recorte (las orejas, a 14 px del borde de arriba) y termina como empieza. Se pasa al 85 % y entra a los 2,9 s (ver la sala) | [`sala/arte/P-021_gata-mira.mp4`](sala/arte/P-021_gata-mira.mp4) |
| P-016 | El fondo de la entrada de Biblioteca | Gemini, a la primera y en su lugar al píxel, con tres referencias juntas en una lámina (la sala, el despertador y la cámara, la madera). El 12/11, Producto le pidió en la misma línea la versión sin el despertador ni la cámara, idéntica en todo lo demás: desde la 0.22.1 esos dos son las piezas del P-013, encima | [`biblioteca/arte/P-016_fondo-entrada.jpg`](biblioteca/arte/P-016_fondo-entrada.jpg) |

## Videos

Gemini anima una imagen y entrega un video de 10 s, de 1280 × 720, a 24 cuadros por segundo (desde el P-018, la gata de la sala).

- **Todos desde la misma imagen, la misma pose al empezar y al terminar,** para encadenarlos sin salto. Un movimiento por video. Conviene pedir unos segundos quieta al principio y al final, y que no se desplace ni salga del cuadro (P-020).
- **Se usan tal cual:** sin cortarlos, sin fundidos y sin animación por código encima (una imagen fija con respiración por código, debajo, se notaba). Si se mueve rápido, se reproduce más lento. Desarrollo solo quita el magenta, entona y suma la sombra (`herramientas/sala/gata.py`).
- **El texto del P-019,** como modelo (con la imagen de partida adjunta):

> Animá esta imagen exactamente como está: misma gata, mismas manchas, mismo tamaño y posición, mismo fondo magenta liso.
>
> Movimiento: la gata duerme profundamente y solo respira. El lomo y el costado suben y bajan despacio, con respiraciones lentas y tranquilas, como una gata dormida de verdad. La cabeza, las patas, las orejas y la cola quedan quietas. Nada más se mueve.
>
> Reglas:
> - El video empieza y termina en la imagen adjunta, idéntica: el último cuadro tiene que ser igual al primero, para repetirlo en bucle sin salto.
> - Cámara fija: sin zoom, sin paneo, sin cambio de luz.
> - El fondo queda magenta parejo todo el video.
> - La respiración es suave pero visible.
> - Sin sonido.

## Un pedido que salió a la primera

El P-006, como modelo: Gemini lo resolvió en el primer intento con las dos imágenes y este texto, pegado tal cual. Imágenes, en este orden: [la referencia](mahjong/bocetos/P-006-referencia-mesa.png) (la mesa ratona de la sala) y [la composición](mahjong/bocetos/P-006-composicion.png). Texto:

> Necesito una ilustración para el fondo de un juego de mahjong solitario para celular, en horizontal. Es la tapa de una mesa ratona de nogal de los años 70 vista exactamente desde arriba. Las fichas del mahjong las dibuja el juego encima, así que el centro de la mesa tiene que quedar vacío.
>
> Te mando dos imágenes:
> 1. Referencia de estilo: la mesa ratona del juego, con su juego de mahjong, la tetera y los dados. La imagen nueva tiene que ser del mismo mundo: el mismo estilo de ilustración pintada, la misma madera de nogal, la misma luz cálida de atardecer y los mismos objetos.
> 2. Boceto de composición: dónde va cada cosa y de qué tamaño. Respetá las posiciones y las proporciones. El boceto es plano y esquemático; la terminación tiene que ser la de la referencia.
>
> Lo que tiene que tener:
> - Formato horizontal 16:9. El teléfono recorta un poco arriba y abajo: todo lo importante, dentro de la franja central, como en el boceto.
> - Vista cenital estricta, desde arriba y sin perspectiva. La madera ocupa toda la imagen: sin bordes de la mesa, sin piso, sin alfombra.
> - Nogal lustrado, con la veta horizontal y suave, sin nudos ni manchas fuertes. Luz cálida de lámpara que entra desde arriba a la izquierda, con un brillo suave en esa zona, y los bordes de la imagen un poco más oscuros.
> - Arriba a la izquierda, un anotador de papel color crema, un poco torcido, con un lomo rojo arriba y renglones finos. En blanco: sin nada escrito.
> - Debajo del anotador, tres palitos de puntaje de mahjong, de hueso, horizontales, uno debajo del otro. Cada uno con un puntito de color cerca de cada punta (rojo en el primero y en el tercero, verde en el del medio) y el centro liso, sin marcas.
> - Abajo a la izquierda, dos dados de hueso chicos, como los de la referencia.
> - A la derecha, a media altura, la tetera marrón de cerámica de la referencia, vista desde arriba: la tapa con su perilla y el pico apuntando hacia arriba. Cortada por el borde derecho de la imagen.
> - Todo lo demás, solo madera: nada en el centro, ni en la esquina de arriba a la derecha ni en la de abajo a la derecha.
> - Sin texto ni letras, sin fichas de mahjong, sin personas ni manos, sin marcos.

## Un pedido de cambio puntual que se rehízo

El P-007 pedía cambiar una sola cosa y dejar todo lo demás igual. Gemini subió la lámpara, pero rehízo la imagen: abrió el encuadre (la barra de la cortina, las cortinas, el sillón), redibujó la ciudad y la lluvia, apoyó la pantalla sobre el travesaño y sumó un cono de luz. El resultado se aprobó igual. Para un cambio que de verdad tiene que dejar todo idéntico, conviene pedirlo sobre la imagen grande (como el P-001, sobre la sala) y no sobre un recorte. Imágenes, en este orden: [el ícono actual](sala/bocetos/P-007-icono-actual.png) (el recorte de la ventana de la sala) y [el boceto](sala/bocetos/P-007-boceto-lampara.png), un retoque a mano con la lámpara subida (solo vale por la posición: tiene marcas del retoque). Texto:

> Te mando dos imágenes. La primera es el ícono de mi app: una ventana de noche con lluvia, la ciudad atrás y una lámpara de arco dorada adelante. La segunda es un boceto hecho a mano que muestra dónde quiero la lámpara; el boceto tiene marcas del retoque, así que tomalo solo como guía de posición.
>
> Necesito la primera imagen con un solo cambio: la lámpara de arco (la pantalla dorada y su brazo curvo) subida hasta la altura del boceto, con la pantalla colgando un poco por debajo del travesaño del medio de la ventana.
>
> - Todo lo demás, exactamente igual: la ventana, el marco, el parante del medio, el travesaño, la lluvia, las gotas, los edificios, el cielo, los colores, la luz y el encuadre.
> - Donde antes estaba la pantalla, abajo, tiene que verse la ventana como sigue en el resto: el marco de abajo, el parante del medio y los edificios.
> - El brazo de la lámpara entra por el borde izquierdo y baja en curva hasta la pantalla, como en el boceto; el brazo viejo no tiene que quedar.
> - Que la pantalla tire una luz cálida suave hacia abajo.
> - Imagen cuadrada, sin texto ni marcos.
