/* Lo que cada pantalla necesita de la página contenedora (index.html, comun/app.js): ir a otra pantalla, abrir y
   cerrar pasos que «atrás» deshace, y el sonido común.

   Pantalla.atras: la pantalla lo define para resolver un «atrás» que le toca a ella (cerrar un panel, abrir la pausa).

   Si la pantalla se abre sola, fuera de la contenedora (para probarla), la navegación va directo y no hay sonido. */
window.Pantalla = {
  atras: null,
  /* Encuadre de una escena pintada en SVG (la sala, el instrumento de Fogonazo). La imagen es casi 16:9 y lo que importa
     va en su franja central, 20:9, la del teléfono acostado. Si la ventana es más ancha que la franja, la franja llena la
     pantalla y recorta un poco arriba y abajo, como siempre en el teléfono. Si es más angosta (un monitor, una notebook),
     la franja entra entera y arriba y abajo se ve más de la imagen; si ni la imagen entera alcanza, quedan bandas del
     color de fondo de la página. franja: [x, y, ancho, alto] en coordenadas de la imagen; alto: el alto de la imagen. */
  encuadre(svg, franja, alto) {
    const [x, y, w, h] = franja;
    const fit = () => {
      const vw = document.documentElement.clientWidth || innerWidth, vh = (window.visualViewport && visualViewport.height) || innerHeight;
      if (!vw || !vh || vw / vh >= w / h) {
        svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); return;
      }
      const ah = Math.min(alto, w * vh / vw), ay = Math.max(0, Math.min(alto - ah, y + h / 2 - ah / 2));
      svg.setAttribute('viewBox', `${x} ${ay.toFixed(1)} ${w} ${ah.toFixed(1)}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    };
    addEventListener('resize', fit); if (window.visualViewport) visualViewport.addEventListener('resize', fit);
    fit();
  },
};
window.App = (() => {
  try { if (window.parent !== window && window.parent.App) return window.parent.App; } catch (e) {}
  const raiz = new URL('..', document.currentScript ? document.currentScript.src : location.href);
  return {
    ir(url) { location.href = new URL(url, raiz).href; },
    reemplazar(url) { location.replace(new URL(url, raiz).href); },
    abrir() {},
    volver() { if (window.Pantalla.atras) window.Pantalla.atras(); },
    salir: async () => false,
    extra: 0,
    sonido: { fx() {}, volumen: () => 7, setVolumen() {}, duck() {}, musica() {} },
    instalacion: { disponible: true, cuadro: false, abrir: async () => false, samsung: false, ios: false, abrirEnChrome() {} },
  };
})();
