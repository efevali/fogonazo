# Buen ojo

El tercer juego de la colección: se ve un color unos segundos y se lo arma de memoria con tres pomos de pintura, uno para el tono, otro para la saturación y otro para el brillo. Es la mesa de un pintor vista desde arriba, como Fogonazo es el banco y el mahjong la mesa ratona. Se entra por el cuadro del arcoíris de la sala. Cómo se ve está en la [guía de estilo](../estilo.md#buen-ojo); por qué es así, en el [registro de decisiones](../decisiones.md#buen-ojo).

- **En la app desde la 0.14.0.** Desde la 0.14.1, con la mesa pintada (P-008) y, en el block y el total, el block pintado sobre ella (P-009). Producto lo jugó hasta la 0.15.2 (3/11 y 4/11) y no pide cambios en el puntaje, las bandas, la ayuda, los tiempos ni el sonido: no hay nada pendiente.
- La mecánica es la de juegos como Dialed: la idea no tiene dueño; el nombre, el aspecto, los textos y el código son propios.

## Cómo es

```
la sala ── el cuadro ──► el block (S-30b) ── Partida ──► la partida (S-30b a S-32) ── 5 colores ──► el total
                          ◀ Volver: la sala ── Práctica ──► la práctica (S-29h)
                                               ◀ Volver: el block
```

- **El block** (`index.html`): un block de dibujo abierto sobre la mesa. Tres muestras de pintura eligen la dificultad, que es cuánto se ve el color: **Fácil, 5 s; Normal, 3 s; Difícil, 1,5 s**. La elegida queda levantada, con borde ámbar, y se recuerda. Debajo de cada una, su récord en birome. Dos cintas: **Partida** (cinco colores) y **Práctica**.
- **La partida** (`partida.html?d=…`), cinco veces:
  1. **Mirar:** primero, una cuenta regresiva en tiza sobre la cartulina (3, 2, 1, un segundo cada uno, en silencio), en los cinco colores. Después el color aparece en esa cartulina, gris media y pegada con cinta (gris para que el entorno no engañe a la vista), mientras una línea de tiza se acorta. En la hoja de la derecha, las tres pinceladas todavía vacías.
  2. **Armar:** en la misma cartulina, el color que se va armando. Cada pincelada está pintada con el color del momento (el tono con todos los tonos, la saturación del gris al color vivo, el brillo del negro a la luz) y sobre cada una corre un pomo de aluminio, con la etiqueta del color actual. Agarrar el pomo lo mueve desde donde está; tocar la pincelada lo lleva ahí. Cada ronda los pomos arrancan en un lugar al azar, y adrede lejos del color en uno o dos de los tres selectores: al menos un 30 % del recorrido (#61). Arriba a la derecha de cada pincelada, chico y gris claro, el valor elegido (S-32); el de la referencia nunca se ve. **Listo** pasa a la revelación.
  3. **Revelación:** la referencia y tu intento lado a lado (así dice la cartulina); el puntaje de 0 a 10 encerrado en birome roja y una frase de su banda. Si la diferencia ya se ve sin esfuerzo (ΔE mayor a 6), debajo, la ayuda: «Te quedó un poco más celeste, más apagado y más claro». Siempre, una tabla informal con el tono, la saturación y el brillo de la referencia y de tu intento (S-32). Si no entra todo, la frase y la ayuda se achican un poco; la tabla no.
- **El total** (S-30b): una hoja del block con las cinco muestras (original y tuyo, con su puntaje), el total de 0 a 50 y, si lo es, el sello «Nuevo récord» con el anterior. **Otra partida** u «◀ Volver».
- **La práctica** (`partida.html?practica`): el color a la vista al lado del tuyo, con los números de cada pomo y los del original, sin puntaje ni récord. **Otro color** sortea uno nuevo.
- **«Atrás»** vuelve de la partida o la práctica al block, y del block a la sala.
- **Guardado** (`estado.js`), en Chrome: el récord de cada dificultad (el mejor total) y la dificultad elegida.

## El puntaje

- **La diferencia se mide como la ve el ojo:** CIEDE2000, sobre los colores pasados a Lab. Medir en tono, saturación y brillo sería injusto: 10° de tono son mucho en un rojo vivo y casi nada en un gris.
- **De la diferencia al puntaje:** hasta ΔE 1 es un 10; después, `10 / (1 + ((ΔE − 1) / 14)^1,6)`. ΔE 3 da 9,6; ΔE 6, 8,4; ΔE 12, 6; ΔE 20, 3,8. Se redondea a un decimal.
- **Los colores:** tono libre, saturación desde 20 (colores más apagados, #62) y brillo desde 30, para que el tono siempre se distinga. Los cinco de una partida quedan lejos entre sí (ΔE 20 o más).
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

## El sonido

- **La música** (S-33): Taller, el tema del mapa de Fogonazo, como primo renacentista, con laúd, flauta dulce, viola da gamba y tamboril. Uno solo en todo el juego (desde la 0.15.1): los cuatro de la 0.15.0, uno por dificultad, no se llevaban bien al pasar de una pantalla a otra. Desde la 0.15.2, con menos presencia (S-36): la viola da gamba, una nota larga por compás; el laúd, dos; sin tamboril; la melodía en negras, sin adornos, y la flauta más baja. En la partida suena un 30 % más baja, para concentrarse; al terminar baja más y queda así mientras se ve el total, como en Fogonazo.
- **Los efectos** (S-34): la cinta de papel al tocar un botón; un clic apagado de aluminio al agarrar un pomo y un toque liviano al soltarlo (mientras se arrastra, nada); la cuenta, en silencio; en la revelación, una pincelada sobre el papel, igual para cualquier puntaje (lo distinto lo dicen las frases); al terminar, la hoja del block que se da vuelta y, si hay récord, un sello de goma (S-35). Desde la 0.15.1, todos unos 4 dB más bajos: sobresalían sobre la música.

## Bocetos

Quedan los que muestran cómo es hoy cada pantalla; los superados y las opciones descartadas se borraron (están en el historial de Git, y el porqué, en el [registro de decisiones](../decisiones.md#buen-ojo)). Los colores y los puntajes son de ejemplo.

| Boceto | Qué fija | Estado |
|---|---|---|
| S-29 | [a · la sala, con el cuadro brillando](bocetos/S-29a-sala.jpg) y [h · la práctica](bocetos/S-29h-practica.jpg) | Aprobado (2/11) |
| S-30 | [b · las pantallas](bocetos/S-30b-pantallas.jpg): el block, el armado, la revelación y el total, con Barlow en todo salvo la nota de la revelación (en birome) y los botones de cinta con volumen | Aprobado (2/11), con más interlineado en la nota |
| S-31 | [c · las pinceladas más finas](bocetos/S-31c-pinceladas.jpg) (la C1, de 30) y [d · el pomo al 80 %](bocetos/S-31d-pomos.jpg), por debajo de los rótulos | Aprobado (3/11): C1 |
| S-32 | [c · el armado](bocetos/S-32c-armar.jpg), con el valor de cada pomo arriba a la derecha, y [f · la revelación](bocetos/S-32f-revelacion.jpg), con «Te quedó…» y la tabla Referencia / Tu intento | Aprobado (3/11) |
| S-33 a S-36 | El sonido (música, efectos, fin y récord, y Taller con menos presencia). Se aprobó escuchándolo en páginas de prueba, que ya se borraron; lo que quedó está en «El sonido» | Aprobados (3/11). En la app desde la 0.15.0 a la 0.15.2 |
| P-008 | La mesa del pintor desde arriba: [composición](bocetos/P-008-composicion.png) (la franja amarilla es lo que ve el teléfono; los recuadros, lo que dibuja el juego) y [la entrega](arte/P-008_fondo-mesa.jpg), de 2576 × 1438 | Aprobado (2/11), a la primera con Gemini |
| P-009 | El block abierto sobre esa mesa, para el block y el total: [composición](bocetos/P-009-composicion.png) y [la entrega](arte/P-009_block-mesa.jpg). La hoja quedó en x 355 a 2180 e y 201 a 1165, donde se pidió | Aprobado (2/11), en el segundo intento. Cómo se pidió, en [imágenes](../imagenes.md#pedidos-cerrados) |

## Notas técnicas

- Vive en [`buenojo/`](../../buenojo/), en la app. `color.js` tiene las cuentas (de HSB a RGB y a Lab, CIEDE2000, el puntaje, las frases, la ayuda y el sorteo); `estado.js`, el guardado; `mesa.css`, lo común a las dos pantallas (la mesa, la cinta, el «Volver»); `fondo.webp` y `fondo-block.webp`, el P-008 y el P-009 para la web, recortados arriba y abajo como el fondo del mahjong. Lo escrito en el block va sobre la hoja pintada: x 126 a 774 e y 22 a 364 del espacio de diseño.
- **El acceso en la sala:** `sala/mask-cuadro.png` es la máscara del cuadro y su lámpara (sin lo que ya es del equipo de audio). La zona táctil del cuadro termina en y = 668 y la del equipo empieza en 670. Con cuatro objetos, el brillo da la vuelta en 6,8 s: uno cada 1,7 s, cada uno los mismos 2,2 s de antes.
- **Las pruebas:** `node herramientas/buenojo/probar.js` verifica CIEDE2000 contra los pares de referencia de Sharma, Wu y Dalal, el puntaje, las frases, la ayuda y el sorteo. Para las herramientas, `window.__buenojo` deja ver el estado, poner un color y saltar a la revelación o al total.
