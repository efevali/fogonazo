/* Lo que cada pantalla necesita de la página contenedora (index.html, comun/app.js): ir a otra pantalla, abrir y
   cerrar pasos que «atrás» deshace, y el sonido común.

   Pantalla.atras: la pantalla lo define para resolver un «atrás» que le toca a ella (cerrar un panel, abrir la pausa).

   Si la pantalla se abre sola, fuera de la contenedora (para probarla), la navegación va directo y no hay sonido. */
window.Pantalla = { atras: null };
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
