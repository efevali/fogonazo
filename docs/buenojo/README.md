# Buen ojo

El tercer juego de la colección: se ve un color unos segundos y se lo arma de memoria con tres pomos de pintura, uno para el tono, otro para la saturación y otro para el brillo. Es la mesa de un pintor vista desde arriba, como Fogonazo es el banco y el mahjong la mesa ratona. Se entra por el cuadro del arcoíris de la sala. Cómo se ve está en la [guía de estilo](../estilo.md#buen-ojo); por qué es así, en el [registro de decisiones](../decisiones.md#buen-ojo).

- **En la app desde la 0.14.0.** Desde la 0.14.1, con la mesa pintada (P-008) y, en el block y el total, el block pintado sobre ella (P-009).
- La mecánica es la de juegos como Dialed: la idea no tiene dueño; el nombre, el aspecto, los textos y el código son propios.

## Cómo es

```
la sala ── el cuadro ──► el block (S-29b) ── Partida ──► la partida (S-29c a g) ── 5 colores ──► el total
                          ◀ Volver: la sala ── Práctica ──► la práctica (S-29h)
                                               ◀ Volver: el block
```

- **El block** (`index.html`): un block de dibujo abierto sobre la mesa. Tres muestras de pintura eligen la dificultad, que es cuánto se ve el color: **Fácil, 5 s; Normal, 3 s; Difícil, 1,5 s**. La elegida queda levantada, con borde ámbar, y se recuerda. Debajo de cada una, su récord en birome. Dos cintas: **Partida** (cinco colores) y **Práctica**.
- **La partida** (`partida.html?d=…`), cinco veces:
  1. **Mirar:** primero, una cuenta regresiva en tiza sobre la cartulina (3, 2, 1, un segundo cada uno, con un toque suave), en los cinco colores. Después el color aparece en esa cartulina, gris media y pegada con cinta (gris para que el entorno no engañe a la vista), mientras una línea de tiza se acorta. En la hoja de la derecha, las tres pinceladas todavía vacías.
  2. **Armar:** en la misma cartulina, el color que se va armando. Cada pincelada está pintada con el color del momento (el tono con todos los tonos, la saturación del gris al color vivo, el brillo del negro a la luz) y sobre cada una corre un pomo de aluminio, con la etiqueta del color actual. Agarrar el pomo lo mueve desde donde está; tocar la pincelada lo lleva ahí. Todas las rondas arrancan del mismo lugar (tono 180, saturación y brillo 50). Arriba a la derecha de cada pincelada, chico y gris claro, el valor elegido (S-32); el de la referencia nunca se ve. **Listo** pasa a la revelación.
  3. **Revelación:** la referencia y tu intento lado a lado (así dice la cartulina); el puntaje de 0 a 10 encerrado en birome roja y una frase de su banda. Si la diferencia ya se ve sin esfuerzo (ΔE mayor a 6), debajo, la ayuda: «Te quedó un poco más celeste, más apagado y más claro». Siempre, una tabla informal con el tono, la saturación y el brillo de la referencia y de tu intento (S-32). Si no entra todo, la frase y la ayuda se achican un poco; la tabla no.
- **El total** (S-29g): una hoja del block con las cinco muestras (original y tuyo, con su puntaje), el total de 0 a 50 y, si lo es, el sello «Nuevo récord» con el anterior. **Otra partida** u «◀ Volver».
- **La práctica** (`partida.html?practica`): el color a la vista al lado del tuyo, con los números de cada pomo y los del original, sin puntaje ni récord. **Otro color** sortea uno nuevo.
- **«Atrás»** vuelve de la partida o la práctica al block, y del block a la sala.
- **Guardado** (`estado.js`), en Chrome: el récord de cada dificultad (el mejor total) y la dificultad elegida.

## El puntaje

- **La diferencia se mide como la ve el ojo:** CIEDE2000, sobre los colores pasados a Lab. Medir en tono, saturación y brillo sería injusto: 10° de tono son mucho en un rojo vivo y casi nada en un gris.
- **De la diferencia al puntaje:** hasta ΔE 1 es un 10; después, `10 / (1 + ((ΔE − 1) / 14)^1,6)`. ΔE 3 da 9,6; ΔE 6, 8,4; ΔE 12, 6; ΔE 20, 3,8. Se redondea a un decimal.
- **Los colores:** tono libre, saturación desde 25 y brillo desde 30, para que el tono siempre se distinga. Los cinco de una partida quedan lejos entre sí (ΔE 20 o más).
- **La ayuda** nombra solo lo que se corrió de verdad (tono 6° o más, saturación 6 o más, brillo 5 o más): «un poco» o «mucho» más de cada cosa. El tono se nombra por la familia hacia la que fue (rojizo, anaranjado, amarillento, verdoso, turquesa, celeste, azulado, violeta, rosado); no cuenta si alguno de los dos colores es casi gris o casi negro.

### Las frases de la revelación

Se sortean sin repetir dentro de una partida. «¡Buen ojo!» es fija en su banda: el nombre del juego se gana. Burla fuerte solo abajo.

| Puntaje | Frases |
|---|---|
| 10 | «Calcado.» · «Idéntico. ¿Hiciste trampa?» · «Mejor que la máquina de la pinturería.» |
| 9,5 a 9,9 | «¡Buen ojo!» |
| 8 a 9,4 | «Hay que mirarlos dos veces.» · «Por un pelo de pincel.» · «Esto ya es ojo.» · «La diferencia la ve solo un chapista.» · «Le faltó una gota, nada más.» |
| 6 a 7,9 | «Se nota que lo viste.» · «El ojo está; falta la mano.» · «Encaminado. Sin afinar, pero encaminado.» · «Un pintor diría “bastante bien” y seguiría mezclando.» · «Casi, casi. El “casi” pesa.» |
| 4 a 5,9 | «Se parecen como primos lejanos.» · «De lejos y con poca luz, pasa.» · «Ibas bien hasta que no.» · «Algo de razón tenías. Algo.» |
| 0 a 3,9 | «Estamos seguros de que tenés los ojos abiertos.» · «Con esa vista, que hayas abierto este juego es un milagro.» · «¿Seguro que no lo armaste con los ojos cerrados?» · «Ese color existe, pero no es este.» |

## Por revisar jugando


- La curva del puntaje, los cortes de las bandas y el umbral de la ayuda (ΔE 6): propuestas de Desarrollo, sin probar en el teléfono.
- Los tiempos de cada dificultad.
- **El sonido:** por ahora sin música, solo efectos prestados del mahjong (los pomos, la revelación y el récord). Falta decidir si lleva un tema propio.

## Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| S-29 | Las pantallas, dibujadas con código al tamaño del teléfono: [a · la sala, con el cuadro brillando](bocetos/S-29a-sala.jpg), [b · el block](bocetos/S-29b-block.jpg), [c · mirar](bocetos/S-29c-memorizar.jpg), [d · armar con los pomos](bocetos/S-29d-reconstruir.jpg), [e · la revelación con ayuda](bocetos/S-29e-revelacion-con-ayuda.jpg), [f · sin ayuda](bocetos/S-29f-revelacion-sin-ayuda.jpg), [g · el total](bocetos/S-29g-fin.jpg) y [h · la práctica](bocetos/S-29h-practica.jpg). Los colores y los puntajes son de ejemplo | Aprobado (2/11), con las frases por banda; sin frases para el total |
| S-30 | Ajustes después de probarlo: [a · tres pinceladas](bocetos/S-30a-pinceladas.png) (A, contorno curvo; B, bordes irregulares y punta seca; C, B con vetas) y [b · las pantallas](bocetos/S-30b-pantallas.jpg): Barlow en todo salvo la nota de la revelación, botones de cinta más chicos y con volumen, y más aire en el block | Aprobado (2/11) con la pincelada B y la punta seca más corta y suave; además, más interlineado en la nota |
| S-31 | Los pomos tapaban los rótulos y una cuenta antes del color: [a y b · tres arreglos y dos cuentas](bocetos/S-31ab-pomos-y-cuenta.jpg) (A, rótulo a la izquierda; B, pomo más chico; C, más aire; números o palotes), [c · pinceladas más finas](bocetos/S-31c-pinceladas.jpg) (C1, de 30; C2, de 22) y [d · C1 con el pomo más chico](bocetos/S-31d-pomos.jpg) | Aprobado (3/11): C1, el pomo al 80 % y la cuenta con números más chicos, en los cinco colores |
| S-32 | Los valores a la vista: [c · el armado](bocetos/S-32c-armar.jpg), con el valor de cada pomo arriba a la derecha (11, gris claro), y [f · la revelación](bocetos/S-32f-revelacion.jpg), con «Te quedó…», la tabla Referencia / Tu intento y la cartulina con esos mismos nombres. Antes: a y b (número a 12, renglones «→ el tuyo»), d y e (tabla con la primera columna ancha, números mal centrados por el °) | Aprobado (3/11) |
| S-33 | La música, el estilo general sobre un solo tema: «Taller» (el del block y la práctica), con el original de Fogonazo para comparar. Primera vuelta: A · Renacimiento (laúd, flauta dulce, viola da gamba, tamboril) y B · Barroco (clave, violín, violonchelo, trinos). Segunda: A con la flauta más presente, A3 (ligado y de fondo) y A2, en consort (laúd rasgueado en ritmo de pavana, gamba sostenida, dos flautas en terceras, tamboril y pandereta). Para escucharla en el teléfono, `herramientas/buenojo/prueba-musica.html` | Elegido el A (3/11); descartado el B, los trinos no van con el tono de la colección. A y A2 en revisión; después, A3 (todo ligado, de fondo) |
| P-008 | El pedido del fondo: la mesa del pintor desde arriba. [Composición](bocetos/P-008-composicion.png) (la franja amarilla es lo que ve el teléfono; los recuadros, lo que dibuja el juego) y el texto, abajo. [La entrega](arte/P-008_fondo-mesa.jpg), de 2576 × 1438 | Aprobado (2/11), a la primera con Gemini |
| P-009 | El block de dibujo abierto sobre esa mesa, para el block y el total: [composición](bocetos/P-009-composicion.png) sobre la entrega del P-008 y el texto, abajo. [La entrega](arte/P-009_block-mesa.jpg): la hoja quedó en x 355 a 2180 e y 201 a 1165, donde se pidió; Gemini sacó el pincel, que quedaba debajo | Aprobado (2/11), en el segundo intento: el primero centró el block y el boceto tapaba el trapo |

### El pedido P-008

Imágenes, en este orden: [la referencia](../mahjong/arte/P-006_fondo-mesa.jpg) (el fondo del mahjong, del mismo mundo) y [la composición](bocetos/P-008-composicion.png). Texto:

> Necesito una ilustración para el fondo de un juego de memoria de colores para celular, en horizontal. Es la mesa de trabajo de un pintor aficionado de los años 70, vista exactamente desde arriba. La cartulina con el color y la hoja con las pinceladas las dibuja el juego encima, así que esas dos zonas tienen que quedar solo con madera.
>
> Te mando dos imágenes:
> 1. Referencia de estilo: el fondo de otro juego de la misma colección, una mesa ratona vista desde arriba. La imagen nueva tiene que ser del mismo mundo: el mismo estilo de ilustración pintada, la misma luz cálida de lámpara y la misma vista cenital.
> 2. Boceto de composición: dónde va cada cosa. Respetá las posiciones. El boceto es plano y esquemático; la terminación tiene que ser la de la referencia.
>
> Lo que tiene que tener:
> - Formato horizontal 16:9. El teléfono recorta arriba y abajo: lo importante, dentro de la franja marcada en amarillo.
> - Vista cenital estricta, sin perspectiva. La madera ocupa toda la imagen: sin bordes de la mesa ni piso.
> - Madera de pino clara y gastada, de tablas anchas horizontales, con algunas manchas chicas de pintura seca de colores (azul, rojo, ocre) y algún rastro de lápiz. Luz cálida que entra desde arriba a la izquierda y los bordes un poco más oscuros.
> - Abajo, debajo del recuadro de la izquierda, un pincel de mango de madera acostado, como en el boceto, y en la esquina de abajo a la izquierda un trapo de algodón chico, manchado de pintura, cortado por el borde.
> - En los dos recuadros punteados y entre ellos, solo madera lisa, sin manchas fuertes ni objetos.
> - Sin texto ni letras, sin pomos de pintura, sin hojas ni cartulinas, sin personas ni manos, sin marcos.

### El pedido P-009

Imágenes, en este orden: [la mesa aprobada](arte/P-008_fondo-mesa.jpg) (el P-008, que tiene que quedar igual) y [la composición](bocetos/P-009-composicion.png) (la misma mesa con el block dibujado plano encima). El block va en x 352 a 2182 e y 201 a 1164 de la imagen: más arriba que el centro y sin tapar el trapo. Si llega corrido, el código acomoda lo que va escrito encima. Texto:

> Necesito agregarle un objeto a una ilustración que ya está aprobada, sin cambiar nada más. Es el fondo de un juego para celular: la mesa de trabajo de un pintor de los años 70 vista exactamente desde arriba. Encima de la mesa va un block de dibujo anillado, abierto en una hoja en blanco; lo que se escribe en la hoja lo pone el juego, por eso el lugar del block tiene que ser exacto.
>
> Te mando dos imágenes:
> 1. La ilustración aprobada: la mesa de pino con sus tablas, las manchas de pintura, el pincel y el trapo. Tiene que quedar idéntica: el mismo encuadre, las mismas tablas, la misma luz y los mismos colores. No la redibujes ni la reencuadres.
> 2. Boceto de composición: la misma mesa con el block dibujado plano encima, en el lugar y del tamaño exactos que tiene que tener. El boceto es esquemático; la terminación tiene que ser la de la ilustración aprobada.
>
> Dónde va el block (es lo más importante):
> - NO va centrado en la imagen. Copiá la posición del boceto: la hoja empieza a unos 350 píxeles del borde izquierdo y termina a unos 395 del derecho; empieza a unos 200 píxeles del borde de arriba y termina a unos 275 del de abajo. Es decir, queda más cerca del borde de arriba que del de abajo.
> - En píxeles de la imagen de 2576 × 1438: la esquina de arriba a la izquierda de la hoja en (352, 201) y la de abajo a la derecha en (2182, 1164).
> - El trapo de la esquina de abajo a la izquierda queda entero a la vista, sin que el block lo toque. El pincel queda en parte debajo del block y asoma por su borde de abajo, como en el boceto.
>
> Cómo es el block:
> - Un block de dibujo de los 70, horizontal, apoyado derecho sobre la mesa (sin girar), con el anillado de espiral de alambre metálico del lado izquierdo, como en el boceto.
> - La hoja, en blanco: papel de dibujo grueso color marfil, con una textura de papel muy suave, sin renglones, sin cuadrícula, sin margen, sin manchas ni dibujos. Pareja en toda la superficie, porque el juego escribe encima.
> - Debajo de la hoja, apenas a la vista por los bordes de abajo y de la derecha, el canto de las otras hojas, y una sombra suave sobre la madera, con la misma luz de la ilustración, que viene de arriba a la izquierda.
> - Sin texto ni letras, sin tapa visible con marcas, sin lápices ni otros objetos nuevos, sin personas ni manos.
> - El mismo tamaño que la ilustración aprobada: 2576 × 1438.

## Notas técnicas

- Vive en [`buenojo/`](../../buenojo/), en la app. `color.js` tiene las cuentas (de HSB a RGB y a Lab, CIEDE2000, el puntaje, las frases, la ayuda y el sorteo); `estado.js`, el guardado; `mesa.css`, lo común a las dos pantallas (la mesa, la cinta, el «Volver»); `fondo.webp` y `fondo-block.webp`, el P-008 y el P-009 para la web, recortados arriba y abajo como el fondo del mahjong. Lo escrito en el block va sobre la hoja pintada: x 126 a 774 e y 22 a 364 del espacio de diseño.
- **El acceso en la sala:** `sala/mask-cuadro.png` es la máscara del cuadro y su lámpara (sin lo que ya es del equipo de audio). La zona táctil del cuadro termina en y = 668 y la del equipo empieza en 670. Con cuatro objetos, el brillo da la vuelta en 6,8 s: uno cada 1,7 s, cada uno los mismos 2,2 s de antes.
- **Las pruebas:** `node herramientas/buenojo/probar.js` verifica CIEDE2000 contra los pares de referencia de Sharma, Wu y Dalal, el puntaje, las frases, la ayuda y el sorteo. Para las herramientas, `window.__buenojo` deja ver el estado, poner un color y saltar a la revelación o al total.
