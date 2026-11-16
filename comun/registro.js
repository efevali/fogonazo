/* El registro de partidas: lo que se juega, guardado en el teléfono (en Chrome), para calibrar los juegos con datos de
   personas y no solo de bots. No se ve en ningún lado ni sale del teléfono por su cuenta: se exporta a mano, con cinco
   toques seguidos en la lámpara de arco de la sala, como un archivo JSON (el menú de compartir del teléfono o, en la
   computadora, una descarga).

   - Registro.anotar(juego, datos): suma un evento a la lista de ese juego, con la hora (t, en ms) y la versión de la
     app (v). Cada juego tiene su lista, su tope de eventos (TOPE) y su presupuesto de caracteres (PRESUPUESTO): al
     pasar cualquiera de los dos se van los más viejos.
   - Registro.borrador(juego, datos): la partida en curso, guardada aparte después de cada jugada. Si la app se cierra
     sin que la partida termine (Android la cierra, se acaba la batería), la próxima vez que se carga este archivo el
     borrador pasa a la lista como «interrumpida». Anotar la partida borra su borrador.
   - Registro.exportar(): arma el archivo con todas las listas y lo comparte o lo descarga.

   Qué anota cada juego está en docs/coleccion.md, «Registro de partidas». */
window.Registro = (() => {
  'use strict';
  const PRE = 'coleccion.registro.', BOR = PRE + 'borrador.';
  const TOPE = { fogonazo: 2500, mahjong: 600, buenojo: 600, biblioteca: 600, app: 1500 };
  // El sitio (efevali.github.io) es el mismo de Kasa y el navegador le da un solo espacio, de unos 5 millones de
  // caracteres, para las dos apps. Para no llenarlo, cada lista tiene además un presupuesto de caracteres: entre todas,
  // a lo sumo 1,4 millones (menos de un tercio). Al pasarlo se van los eventos más viejos, como con el tope.
  const PRESUPUESTO = { fogonazo: 650000, mahjong: 120000, buenojo: 150000, biblioteca: 400000, app: 100000 };
  const JUEGOS = Object.keys(TOPE);

  // la versión instalada: la dice el service worker, a través de la contenedora (sin ella, queda en null)
  // (al abrir la app, el service worker puede no estar listo: se vuelve a preguntar con cada evento hasta tenerla)
  let version = null, preguntando = false;
  function pedirVersion() {
    if (version || preguntando) return;
    try {
      const A = window.App || (window.parent !== window && window.parent.App);
      if (!A || !A.version) return;
      preguntando = true;
      A.version.estado().then(e => { version = e && e.actual || null; }).catch(() => {}).then(() => { preguntando = false; });
    } catch (e) {}
  }
  pedirVersion();

  const leer = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
  // guardar la lista de un juego, dentro de su tope de eventos y de su presupuesto de caracteres
  function guardar(juego, v) {
    const tope = TOPE[juego] || 500, max = PRESUPUESTO[juego] || 100000;
    if (v.length > tope) v.splice(0, v.length - tope);
    let texto = JSON.stringify(v);
    // pasado el presupuesto, se van los más viejos, en proporción a lo que sobra (y un poco más, para no recortar
    // con cada partida)
    while (texto.length > max && v.length > 1) {
      v.splice(0, Math.max(1, Math.ceil(v.length * ((texto.length - max) / texto.length + 0.05))));
      texto = JSON.stringify(v);
    }
    // si igual no entra (el espacio ya está lleno), se van los más viejos, de a un cuarto, hasta que entre
    for (let n = 0; n < 6; n++) {
      try { localStorage.setItem(PRE + juego, texto); return true; } catch (e) {
        if (v.length < 4) return false;
        v.splice(0, Math.ceil(v.length / 4));
        texto = JSON.stringify(v);
      }
    }
    return false;
  }
  function anotar(juego, datos) {
    pedirVersion();
    const lista = leer(PRE + juego) || [];
    lista.push(Object.assign({ t: Date.now(), v: version }, datos));
    guardar(juego, lista);
    try { localStorage.removeItem(BOR + juego); } catch (e) {}
  }
  function borrador(juego, datos) {
    try { localStorage.setItem(BOR + juego, JSON.stringify(Object.assign({ t: Date.now(), v: version }, datos))); } catch (e) {}
  }
  // los borradores que quedaron de una partida cortada por cerrar la app
  for (const j of JUEGOS) {
    const b = leer(BOR + j);
    if (!b) continue;
    try { localStorage.removeItem(BOR + j); } catch (e) {}
    const lista = leer(PRE + j) || [];
    lista.push(Object.assign(b, { resultado: 'interrumpida' }));
    guardar(j, lista);
  }

  function archivo() {
    const listas = {};
    for (const j of JUEGOS) listas[j] = leer(PRE + j) || [];
    return {
      formato: 1, app: 'minijuegos', version, exportado: new Date().toISOString(),
      pantalla: { ancho: screen.width, alto: screen.height, densidad: window.devicePixelRatio || 1 },
      navegador: navigator.userAgent,
      registro: listas,
    };
  }
  async function exportar() {
    const d = new Date(), dos = n => String(n).padStart(2, '0');
    const nombre = `registro-${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}-${dos(d.getHours())}${dos(d.getMinutes())}.json`;
    const texto = JSON.stringify(archivo());
    // en el teléfono, el menú de compartir (mail, Drive, WhatsApp…); si no está o no acepta archivos, una descarga
    try {
      const f = new File([texto], nombre, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: nombre });
        return 'compartido';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelado';
    }
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'descargado';
  }

  return { anotar, borrador, exportar, archivo };
})();
