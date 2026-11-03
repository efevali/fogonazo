# Buen ojo

El tercer juego de la colección: se ve un color unos segundos y se lo arma de memoria con tres pomos de pintura, uno para el tono, otro para la saturación y otro para el brillo. Es la mesa de un pintor vista desde arriba, como Fogonazo es el banco y el mahjong la mesa ratona. Se entra por el cuadro del arcoíris de la sala. Cómo se ve está en la [guía de estilo](../estilo.md#buen-ojo); por qué es así, en el [registro de decisiones](../decisiones.md#buen-ojo).

- **En la app desde la 0.14.0**, con la mesa dibujada con código hasta que llegue el fondo pintado (P-008).
- La mecánica es la de juegos como Dialed: la idea no tiene dueño; el nombre, el aspecto, los textos y el código son propios.

## Cómo es

```
la sala ── el cuadro ──► el block (S-29b) ── Partida ──► la partida (S-29c a g) ── 5 colores ──► el total
                          ◀ Volver: la sala ── Práctica ──► la práctica (S-29h)
                                               ◀ Volver: el block
```

- **El block** (`index.html`): un block de dibujo abierto sobre la mesa. Tres muestras de pintura eligen la dificultad, que es cuánto se ve el color: **Fácil, 5 s; Normal, 3 s; Difícil, 1,5 s**. La elegida queda levantada, con borde ámbar, y se recuerda. Debajo de cada una, su récord en birome. Dos cintas: **Partida** (cinco colores) y **Práctica**.
- **La partida** (`partida.html?d=…`), cinco veces:
  1. **Mirar:** el color aparece en una cartulina gris media pegada con cinta (gris para que el entorno no engañe a la vista), mientras una línea de tiza se acorta. En la hoja de la derecha, las tres pinceladas todavía vacías.
  2. **Armar:** en la misma cartulina, el color que se va armando. Cada pincelada está pintada con el color del momento (el tono con todos los tonos, la saturación del gris al color vivo, el brillo del negro a la luz) y sobre cada una corre un pomo de aluminio, con la etiqueta del color actual. Agarrar el pomo lo mueve desde donde está; tocar la pincelada lo lleva ahí. Todas las rondas arrancan del mismo lugar (tono 180, saturación y brillo 50). Sin números a la vista. **Listo** pasa a la revelación.
  3. **Revelación:** el original y el tuyo lado a lado; el puntaje de 0 a 10 encerrado en birome roja y una frase de su banda. Si la diferencia ya se ve sin esfuerzo (ΔE mayor a 6), debajo, la ayuda: «El tuyo quedó un poco más celeste, más apagado y más claro», y el desglose en tono, saturación y brillo.
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
- El fondo pintado de la mesa (P-008).

## Bocetos

| Boceto | Qué es | Estado |
|---|---|---|
| S-29 | Las pantallas, dibujadas con código al tamaño del teléfono: [a · la sala, con el cuadro brillando](bocetos/S-29a-sala.jpg), [b · el block](bocetos/S-29b-block.jpg), [c · mirar](bocetos/S-29c-memorizar.jpg), [d · armar con los pomos](bocetos/S-29d-reconstruir.jpg), [e · la revelación con ayuda](bocetos/S-29e-revelacion-con-ayuda.jpg), [f · sin ayuda](bocetos/S-29f-revelacion-sin-ayuda.jpg), [g · el total](bocetos/S-29g-fin.jpg) y [h · la práctica](bocetos/S-29h-practica.jpg). Los colores y los puntajes son de ejemplo | Aprobado (2/11), con las frases por banda; sin frases para el total |
| P-008 | El pedido del fondo: la mesa del pintor desde arriba. [Composición](bocetos/P-008-composicion.png) (la franja amarilla es lo que ve el teléfono; los recuadros, lo que dibuja el juego) y el texto, abajo. [La entrega](arte/P-008_fondo-mesa.jpg), de 2576 × 1438 | Aprobado (2/11), a la primera con Gemini |
| P-009 | El block de dibujo abierto sobre esa mesa, para el block y el total: [composición](bocetos/P-009-composicion.png) sobre la entrega del P-008 y el texto, abajo | Por pedir |

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

Imágenes, en este orden: [la mesa aprobada](arte/P-008_fondo-mesa.jpg) (el P-008, que tiene que quedar igual) y [la composición](bocetos/P-009-composicion.png) (la misma mesa con el block dibujado plano encima). Texto:

> Necesito agregarle un objeto a una ilustración que ya está aprobada, sin cambiar nada más. Es el fondo de un juego para celular: la mesa de trabajo de un pintor de los años 70 vista exactamente desde arriba. Encima de la mesa va un block de dibujo anillado, abierto en una hoja en blanco; lo que se escribe en la hoja lo pone el juego.
>
> Te mando dos imágenes:
> 1. La ilustración aprobada: la mesa de pino con sus tablas, las manchas de pintura, el pincel y el trapo. Tiene que quedar idéntica: el mismo encuadre, las mismas tablas, la misma luz y los mismos colores. No la redibujes ni la reencuadres.
> 2. Boceto de composición: la misma mesa con el block dibujado plano encima, en el lugar y del tamaño exactos que tiene que tener. El boceto es esquemático; la terminación tiene que ser la de la ilustración aprobada.
>
> Lo que tiene que tener el block:
> - Un block de dibujo de los 70, horizontal, apoyado derecho sobre la mesa, con el anillado de espiral de alambre metálico del lado izquierdo, como en el boceto. Ocupa exactamente el rectángulo del boceto: el borde de la hoja coincide con el del dibujo.
> - La hoja, en blanco: papel de dibujo grueso color marfil, con una textura de papel muy suave, sin renglones, sin cuadrícula, sin margen, sin manchas ni dibujos. Pareja en toda la superficie, porque el juego escribe encima.
> - Debajo de la hoja, apenas a la vista por los bordes de abajo y de la derecha, el canto de las otras hojas, y una sombra suave sobre la madera, con la misma luz de la ilustración, que viene de arriba a la izquierda.
> - El block tapa el pincel; el trapo de la esquina de abajo a la izquierda asoma por debajo, como en el boceto.
> - Sin texto ni letras, sin tapa visible con marcas, sin lápices ni otros objetos nuevos, sin personas ni manos.
> - El mismo tamaño que la ilustración aprobada: 2576 × 1438.

## Notas técnicas

- Vive en [`buenojo/`](../../buenojo/), en la app. `color.js` tiene las cuentas (de HSB a RGB y a Lab, CIEDE2000, el puntaje, las frases, la ayuda y el sorteo); `estado.js`, el guardado; `mesa.css`, lo común a las dos pantallas (la mesa, la cinta, el «Volver»).
- **El acceso en la sala:** `sala/mask-cuadro.png` es la máscara del cuadro y su lámpara (sin lo que ya es del equipo de audio). La zona táctil del cuadro termina en y = 668 y la del equipo empieza en 670. Con cuatro objetos, el brillo da la vuelta en 6,8 s: uno cada 1,7 s, cada uno los mismos 2,2 s de antes.
- **Las pruebas:** `node herramientas/buenojo/probar.js` verifica CIEDE2000 contra los pares de referencia de Sharma, Wu y Dalal, el puntaje, las frases, la ayuda y el sorteo. Para las herramientas, `window.__buenojo` deja ver el estado, poner un color y saltar a la revelación o al total.
