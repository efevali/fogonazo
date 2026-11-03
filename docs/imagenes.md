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
- **Se recortan con código:** `herramientas/sala/piezas.py` (piezas con patas, que acorta, y sombra suave) y `herramientas/sala/obstaculos.py` (objetos que ocupan la casilla entera o van debajo de una pieza), que exportan PNG de 256 × 256 a `fogonazo/piezas/`. Las que deben reemplazarse una por otra (los tres pads de Fogonazo) tienen que salir del mismo tamaño.

## La entrega

- **En PNG, bajada con la opción de descarga de la IA.** Copiarla, compartirla o capturarla da una vista previa de baja resolución; de Gemini, la descarga dio 2752 × 1536. Que la IA la suba a otro lado también la achica.
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
