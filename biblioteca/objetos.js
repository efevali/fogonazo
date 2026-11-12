/* Biblioteca: los veinte objetos y las dos llaves. Desde la 0.21.0 se ven las piezas pintadas (P-012 a P-014, recortadas
   en biblioteca/arte/objetos/ con herramientas/biblioteca/recortar.py); los dibujos con código de los bocetos S-37g,
   S-38a y S-39a quedan como medida (cada pieza ocupa el recuadro de su dibujo) y como respaldo. Cada uno en un recuadro de 60 × 80, apoyado abajo, con silueta propia
   para reconocerlo de un vistazo, salvo los que en Difícil se parecen a propósito.

   Objetos.instalar() pone los dibujos en la página (como símbolos de SVG); Objetos.svg(tipo) devuelve uno listo para
   usar. El orden de la lista es el de Repartos.OBJETOS: Fácil usa los primeros ocho, Normal catorce y Difícil los
   veinte. */
window.Objetos = (() => {
  'use strict';
  const D = {
    // el tomo: un libro gordo parado, de lomo bordó con bandas doradas y un rótulo
    tomo: `<rect x="16" y="14" width="28" height="64" rx="2" fill="#7c1f2c"/><rect x="16" y="14" width="5" height="64" fill="#5e1520"/>
      <rect x="16" y="22" width="28" height="4" fill="#d8b04a"/><rect x="16" y="66" width="28" height="4" fill="#d8b04a"/>
      <rect x="24" y="33" width="15" height="17" fill="#efe2c2"/><rect x="26.5" y="35.5" width="10" height="12" fill="none" stroke="#7c1f2c" stroke-width=".8"/>`,
    // un casete naranja de carcasa negra, parado
    casete: `<rect x="3" y="46" width="54" height="32" rx="3" fill="#1d1a19"/><rect x="7" y="50" width="46" height="14" rx="1.5" fill="#ef8a2b"/>
      <rect x="7" y="50" width="46" height="3" fill="#f6efe0"/><rect x="17" y="55.5" width="26" height="7" rx="3.5" fill="#1d1a19"/>
      <circle cx="22" cy="59" r="2.4" fill="#efe2c8"/><circle cx="38" cy="59" r="2.4" fill="#efe2c8"/><path d="M16 78 L19 69 H41 L44 78 Z" fill="#3a3533"/>`,
    // la torre Eiffel, gris claro con brillo metálico, para que se despegue del fondo (S-38a; antes era de bronce)
    eiffel: `<path d="M30 4 L31.6 20 L34 34 L37 48 L41.5 62 L47 78 H40 C38 70 35 66 30 66 C25 66 22 70 20 78 H13 L18.5 62 L23 48 L26 34 L28.4 20 Z" fill="#a9adb3"/>
      <path d="M30 4 L31.6 20 L34 34 L37 48 L41.5 62 L47 78 H44 L38.5 62 L34 48 L31.5 34 L30 20 Z" fill="#d6d9dd"/>
      <rect x="25" y="32" width="10" height="3" fill="#7d8188"/><rect x="21" y="47" width="18" height="3.4" fill="#7d8188"/><rect x="16.5" y="61" width="27" height="3.6" fill="#7d8188"/>`,
    // un avión de maqueta sobre su pie
    avion: `<ellipse cx="30" cy="77" rx="10" ry="2.4" fill="#4a3428"/><rect x="29" y="44" width="2.4" height="33" fill="#b8bcc2"/>
      <path d="M45 25 L51 13 H55 L52 31 Z" fill="#d23c2c"/><path d="M26 34 L44 34 L34 47 L28 47 Z" fill="#c9ccd2"/>
      <path d="M6 33 C6 29 10 27 16 27 H50 C54 27 57 29 57 31.5 C57 34 54 36 50 36 H16 C10 36 6 35 6 33 Z" fill="#e9eaee"/>
      <path d="M8 32.5 H52" stroke="#d23c2c" stroke-width="1.4"/><circle cx="11" cy="30.5" r="1.3" fill="#2a3442"/><path d="M28 27 L38 18 L42 18 L36 27 Z" fill="#c9ccd2"/>`,
    // un globo terráqueo con su arco dorado
    globo: `<path d="M22 78 L25 70 H35 L38 78 Z" fill="#b8893a"/><rect x="28.8" y="58" width="2.4" height="13" fill="#b8893a"/>
      <circle cx="29" cy="36" r="19" fill="#2d6ba3"/><path d="M17 26 C22 20 28 22 27 28 C26 34 32 34 31 41 C30 47 22 49 19 44 C16 39 13 31 17 26 Z" fill="#5fa04e"/>
      <path d="M37 28 C41 29 43 34 41 39 C39 42 36 39 37 35 Z" fill="#5fa04e"/><ellipse cx="22" cy="27" rx="4.5" ry="3" fill="#fff" opacity=".25"/>
      <path d="M41 17 A24 24 0 0 1 36 59" fill="none" stroke="#c99a42" stroke-width="2.6" stroke-linecap="round"/>`,
    // un despertador de dos campanas
    despertador: `<path d="M19 66 L13 77 M41 66 L47 77" stroke="#7a5a2a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="17" cy="23" r="8" fill="#c9a55a"/><circle cx="43" cy="23" r="8" fill="#c9a55a"/><rect x="28" y="17" width="4" height="6" fill="#8a6c3a"/>
      <circle cx="30" cy="47" r="20" fill="#2aa198"/><circle cx="30" cy="47" r="15.5" fill="#f4ecd8"/>
      <path d="M30 47 V36.5 M30 47 L37 51" stroke="#222" stroke-width="2.2" stroke-linecap="round"/><circle cx="30" cy="47" r="1.6" fill="#c0392b"/>`,
    // una mamushka roja
    mamushka: `<path d="M30 10 C40 10 45 18 44 28 C49 34 53 44 53 56 C53 70 44 78 30 78 C16 78 7 70 7 56 C7 44 11 34 16 28 C15 18 20 10 30 10 Z" fill="#cf2e2e"/>
      <circle cx="30" cy="27" r="10" fill="#f6dfc6"/><path d="M20 24 C22 17 38 17 40 24 C36 21 24 21 20 24 Z" fill="#7a3b1e"/>
      <circle cx="26.5" cy="27.5" r="1.1" fill="#3a2a22"/><circle cx="33.5" cy="27.5" r="1.1" fill="#3a2a22"/><circle cx="25" cy="31" r="1.6" fill="#ef9a9a"/><circle cx="35" cy="31" r="1.6" fill="#ef9a9a"/>
      <circle cx="30" cy="57" r="11.5" fill="#f2c335"/><circle cx="30" cy="57" r="5.5" fill="#cf2e2e"/><circle cx="30" cy="57" r="2" fill="#f2c335"/>`,
    // un cactus en su maceta, con una flor
    cactus: `<path d="M17 60 H43 L40 78 H20 Z" fill="#c0643a"/><rect x="15" y="56" width="30" height="6" rx="1" fill="#d8784a"/>
      <path d="M24 56 V24 C24 17 36 17 36 24 V56 Z" fill="#4c9a4a"/><path d="M24 42 H17 C13 42 12 39 12 36 V28 C12 25 17 25 17 28 V35 H24 Z" fill="#4c9a4a"/>
      <path d="M36 36 H42 V25 C42 22 47 22 47 25 V34 C47 38 45 41 41 41 H36 Z" fill="#4c9a4a"/>
      <path d="M28 22 V55 M32 22 V55" stroke="#3a7d39" stroke-width="1"/><circle cx="30" cy="16" r="3.2" fill="#ef6aa0"/>`,
    // tres libros parados: fino y alto, medio, bajo (sin que se vean las hojas)
    libros: `<rect x="8" y="10" width="11" height="68" rx="1" fill="#2f6b4a"/><rect x="8" y="17" width="11" height="2.5" fill="#d8b04a"/><rect x="8" y="68" width="11" height="2.5" fill="#d8b04a"/>
      <rect x="20" y="22" width="17" height="56" rx="1" fill="#2c5a96"/><rect x="20" y="28" width="17" height="2.5" fill="#d8b04a"/><rect x="24.5" y="36" width="8" height="11" fill="#efe2c2"/>
      <rect x="38" y="34" width="14" height="44" rx="1" fill="#d8a23a"/><rect x="38" y="70" width="14" height="2.5" fill="#8a2a22"/><rect x="38" y="40" width="14" height="2" fill="#8a2a22"/>`,
    // un autito celeste sobre su base
    auto: `<rect x="2" y="72" width="56" height="6" rx="1" fill="#5a3a26"/><path d="M8 66 C8 58 11 56 16 55 L21 45 C22 43 24 42 27 42 H37 C40 42 42 43 43 45 L47 55 C52 56 54 58 54 66 Z" fill="#3a8fb7"/>
      <path d="M23 54 L26 46 H31 V54 Z M34 54 V46 H38 L41 54 Z" fill="#d9eef6"/>
      <circle cx="18" cy="67" r="5.5" fill="#1d1a19"/><circle cx="18" cy="67" r="2.2" fill="#c9ccd2"/><circle cx="43" cy="67" r="5.5" fill="#1d1a19"/><circle cx="43" cy="67" r="2.2" fill="#c9ccd2"/>`,
    // una cámara de fotos
    camara: `<rect x="12" y="38" width="13" height="8" rx="1" fill="#9a9a96"/><circle cx="46" cy="41" r="3.6" fill="#8a8a86"/>
      <rect x="3" y="44" width="54" height="34" rx="3" fill="#1d1a19"/><rect x="3" y="44" width="54" height="9" rx="2" fill="#d6d6d2"/>
      <circle cx="30" cy="62" r="13" fill="#9a9a96"/><circle cx="30" cy="62" r="10" fill="#1f2e3e"/><circle cx="30" cy="62" r="5.5" fill="#2e4a66"/><circle cx="27" cy="59" r="2" fill="#fff" opacity=".45"/>`,
    // una radio portátil de madera
    radio: `<path d="M14 40 V30 C14 24 18 22 22 22 H38 C42 22 46 24 46 30 V40" fill="none" stroke="#2a2420" stroke-width="3.6"/>
      <rect x="3" y="38" width="54" height="40" rx="4" fill="#8a5a32"/><rect x="8" y="44" width="25" height="29" rx="2" fill="#2a2420"/>
      <path d="M11 49 H30 M11 54 H30 M11 59 H30 M11 64 H30 M11 69 H30" stroke="#6b6158" stroke-width="1.6"/>
      <circle cx="46" cy="52" r="6.5" fill="#ef8a2b"/><path d="M46 52 L49 48" stroke="#2a2420" stroke-width="1.6"/><rect x="39" y="64" width="6" height="7" fill="#efe2c2"/><rect x="47" y="64" width="6" height="7" fill="#efe2c2"/>`,
    // un casete blanco de etiqueta celeste
    caseteBlanco: `<rect x="3" y="46" width="54" height="32" rx="3" fill="#ebe7dc"/><rect x="7" y="50" width="46" height="14" rx="1.5" fill="#4aa3d6"/>
      <rect x="7" y="50" width="46" height="3" fill="#fbf8f0"/><rect x="17" y="55.5" width="26" height="7" rx="3.5" fill="#1d1a19"/>
      <circle cx="22" cy="59" r="2.4" fill="#efe2c8"/><circle cx="38" cy="59" r="2.4" fill="#efe2c8"/><path d="M16 78 L19 69 H41 L44 78 Z" fill="#c4bfb2"/>`,
    // una pila de tres libros acostados (S-38a)
    pila: `<rect x="5" y="64" width="50" height="14" rx="1.5" fill="#6b3f22"/><rect x="5" y="69" width="50" height="2.2" fill="#d8b04a"/>
      <rect x="10" y="51" width="41" height="13" rx="1.5" fill="#2a7a7a"/><rect x="38" y="54" width="9" height="7" fill="#efe2c2"/>
      <rect x="14" y="42" width="34" height="9" rx="1.5" fill="#d8a23a"/><rect x="14" y="45.5" width="34" height="1.8" fill="#8a2a22"/>`,
    // una enciclopedia: cuatro tomos finos e iguales, numerados
    enciclopedia: [0, 1, 2, 3].map(k => `<rect x="${7 + k * 11.8}" y="14" width="10.6" height="64" rx="1" fill="#24345e"/>
      <rect x="${7 + k * 11.8}" y="20" width="10.6" height="2" fill="#d8b04a"/><rect x="${7 + k * 11.8}" y="70" width="10.6" height="2" fill="#d8b04a"/>
      <text x="${12.3 + k * 11.8}" y="34" text-anchor="middle" font-family="Georgia,serif" font-size="7" font-weight="700" fill="#d8b04a">${['I', 'II', 'III', 'IV'][k]}</text>`).join(''),
    // los tres libros con la forma de los otros, pero en dos colores alternados: verde, bordó, verde (Difícil)
    librosAlt: `<rect x="8" y="10" width="11" height="68" rx="1" fill="#2f6b4a"/><rect x="8" y="17" width="11" height="2.5" fill="#d8b04a"/><rect x="8" y="68" width="11" height="2.5" fill="#d8b04a"/>
      <rect x="20" y="22" width="17" height="56" rx="1" fill="#7c1f2c"/><rect x="20" y="28" width="17" height="2.5" fill="#d8b04a"/><rect x="24.5" y="36" width="8" height="11" fill="#efe2c2"/>
      <rect x="38" y="34" width="14" height="44" rx="1" fill="#2f6b4a"/><rect x="38" y="70" width="14" height="2.5" fill="#d8b04a"/><rect x="38" y="40" width="14" height="2" fill="#d8b04a"/>`,
    // el tomo, gemelo del bordó, en azul (Difícil)
    tomoAzul: `<rect x="16" y="14" width="28" height="64" rx="2" fill="#1f3f7a"/><rect x="16" y="14" width="5" height="64" fill="#162e5a"/>
      <rect x="16" y="22" width="28" height="4" fill="#d8b04a"/><rect x="16" y="66" width="28" height="4" fill="#d8b04a"/>
      <rect x="24" y="33" width="15" height="17" fill="#efe2c2"/><rect x="26.5" y="35.5" width="10" height="12" fill="none" stroke="#1f3f7a" stroke-width=".8"/>`,
    // un casete transparente azulado de etiqueta amarilla (el C de S-38a; Difícil)
    caseteTransparente: `<rect x="3" y="46" width="54" height="32" rx="3" fill="#9fb8c8"/><rect x="7" y="50" width="46" height="14" rx="1.5" fill="#f2c335"/>
      <rect x="7" y="50" width="46" height="3" fill="#fbf4dc"/><rect x="17" y="55.5" width="26" height="7" rx="3.5" fill="#1d1a19"/>
      <circle cx="22" cy="59" r="2.4" fill="#efe2c8"/><circle cx="38" cy="59" r="2.4" fill="#efe2c8"/><path d="M16 78 L19 69 H41 L44 78 Z" fill="#7c96a8"/>`,
    // otra enciclopedia: cuatro tomos iguales, verde botella, más bajos y con números plateados (S-39a; Difícil)
    enciclopediaVerde: [0, 1, 2, 3].map(k => `<rect x="${7 + k * 11.8}" y="30" width="10.6" height="48" rx="1" fill="#1f5a3c"/>
      <rect x="${7 + k * 11.8}" y="35" width="10.6" height="1.8" fill="#c9ccd2"/><rect x="${7 + k * 11.8}" y="71" width="10.6" height="1.8" fill="#c9ccd2"/>
      <text x="${12.3 + k * 11.8}" y="47" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-weight="700" fill="#d9dce1">${['I', 'II', 'III', 'IV'][k]}</text>`).join(''),
    // la llave de la puerta de vidrio: de bronce, parada, ojo redondo y cinta roja (S-38c)
    llave: `<circle cx="30" cy="22" r="10" fill="none" stroke="#c99a3a" stroke-width="5"/><circle cx="30" cy="22" r="10" fill="none" stroke="#f0cf78" stroke-width="1.4" stroke-dasharray="10 40"/>
      <rect x="27.5" y="31" width="5" height="44" rx="1.5" fill="#c99a3a"/><rect x="28.5" y="31" width="1.6" height="44" fill="#f0cf78" opacity=".7"/>
      <path d="M32 60 H41 V65 H37 V70 H41 V75 H32 Z" fill="#c99a3a"/>
      <path d="M22 14 C14 6 8 10 12 18 C14 22 20 18 22 14 Z" fill="#c8392a"/><path d="M23 15 C18 24 14 30 10 33 M23 15 C24 24 22 32 20 36" stroke="#c8392a" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    // la llave de la reja: de hierro claro, ojo de trébol y cinta verde (S-38f; aclarada para que se despegue del fondo)
    llaveReja: `<g fill="#b4b8bf"><circle cx="30" cy="13" r="6.5"/><circle cx="23" cy="24" r="6.5"/><circle cx="37" cy="24" r="6.5"/></g>
      <circle cx="30" cy="13" r="2.6" fill="#2a1a10"/><circle cx="23" cy="24" r="2.6" fill="#2a1a10"/><circle cx="37" cy="24" r="2.6" fill="#2a1a10"/>
      <rect x="27.5" y="27" width="5" height="48" rx="1.5" fill="#b4b8bf"/><rect x="28.4" y="27" width="1.4" height="48" fill="#eef0f3"/>
      <path d="M32 58 H42 V63 H38 V66 H42 V75 H32 Z" fill="#b4b8bf"/><rect x="25" y="30" width="10" height="3" rx="1" fill="#d6d9de"/>
      <path d="M17 20 C9 13 5 18 9 25 C11 28 16 25 17 20 Z" fill="#4fa65a"/><path d="M18 22 C13 31 10 36 6 39 M18 22 C18 31 16 38 14 42" stroke="#4fa65a" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    // un casete ahumado de etiqueta roja
    caseteAhumado: `<rect x="3" y="46" width="54" height="32" rx="3" fill="#5c4f48"/><rect x="7" y="50" width="46" height="14" rx="1.5" fill="#cf2e2e"/>
      <rect x="7" y="50" width="46" height="3" fill="#f6efe0"/><rect x="17" y="55.5" width="26" height="7" rx="3.5" fill="#1d1a19"/>
      <circle cx="22" cy="59" r="2.4" fill="#efe2c8"/><circle cx="38" cy="59" r="2.4" fill="#efe2c8"/><path d="M16 78 L19 69 H41 L44 78 Z" fill="#3e3430"/>`,
  };
  const NOMBRES = { tomo: 'tomo', casete: 'casete naranja', eiffel: 'torre Eiffel', avion: 'avión', globo: 'globo terráqueo', despertador: 'despertador',
    mamushka: 'mamushka', cactus: 'cactus', libros: 'tres libros', auto: 'auto', camara: 'cámara', radio: 'radio', caseteBlanco: 'casete blanco', caseteAhumado: 'casete ahumado',
    pila: 'pila de libros', enciclopedia: 'enciclopedia', librosAlt: 'tres libros alternados', tomoAzul: 'tomo azul', caseteTransparente: 'casete transparente', enciclopediaVerde: 'enciclopedia verde',
    llave: 'llave de bronce', llaveReja: 'llave de hierro' };
  function instalar() {
    if (document.getElementById('objetos-biblioteca')) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'objetos-biblioteca'; s.setAttribute('width', 0); s.setAttribute('height', 0); s.setAttribute('aria-hidden', 'true'); s.style.position = 'absolute';
    s.innerHTML = '<defs>' + Object.entries(D).map(([k, v]) => `<symbol id="o-${k}" viewBox="0 0 60 80">${v}</symbol>`).join('') + '</defs>';
    document.body.prepend(s);
  }
  // las piezas pintadas (P-012 a P-014), recortadas en el mismo recuadro de 60 × 80 que el dibujo con código, a 240 × 320;
  // los dibujos con código quedan para los casetes A y B y como respaldo
  const PINTADOS = new Set(['tomo', 'casete', 'eiffel', 'avion', 'globo', 'despertador', 'mamushka', 'cactus', 'libros', 'auto', 'camara', 'radio',
    'caseteBlanco', 'pila', 'enciclopedia', 'librosAlt', 'tomoAzul', 'caseteTransparente', 'enciclopediaVerde', 'llave', 'llaveReja', 'caseteAhumado']);
  const base = new URL('arte/objetos/', document.currentScript ? document.currentScript.src : location.href).href;
  const svg = (tipo, extra = '') => PINTADOS.has(tipo)
    ? `<img src="${base}${tipo}.webp" alt="" draggable="false" ${extra}>`
    : `<svg viewBox="0 0 60 80" ${extra}><use href="#o-${tipo}"/></svg>`;
  return { instalar, svg, NOMBRES, TIPOS: Object.keys(D) };
})();
