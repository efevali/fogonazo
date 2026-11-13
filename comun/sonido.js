/* El sonido de la colección, sintetizado con WebAudio: sin archivos de audio.
   - Voces básicas (pulso, triangular, ruido y FM de dos operadores), con las que se arman los efectos y la música.
   - Los efectos y los cuatro temas de Fogonazo (Placa, Taller, Urgente y Siesta), su sonido de siempre.
   - Los del mahjong: voces orientales (koto, flauta, bloque de madera, tamborcito y campana), sus efectos y Siesta y
     Taller como primas orientales: mismo tempo, ritmo, acordes y bajo, la melodía en do pentatónica mayor.
   - Los de Buen ojo (S-33, S-34): voces renacentistas (laúd, flauta dulce, viola da gamba y tamboril), Taller como
     primo renacentista y efectos con esos instrumentos y sonidos del oficio del pintor.
   - Los de Biblioteca (S-41, S-42): Taller como primo de dibujito de los 70, con la melodía silbada, y efectos con
     el sonido de cada objeto, una nota en do, silbidos y glockenspiel.
   - La lluvia de la sala: un colchón de ruido rosa apagado y gotitas en el vidrio.
   - El ronroneo de la gata de la sala (S-45), armado armónico por armónico sobre las medidas de un ronroneo real.
   - Un solo juego de volúmenes para toda la colección (música, efectos y lluvia, de 0 a 10), guardado en Chrome.
   Vive en la página contenedora (index.html), así que no se corta al pasar de una pantalla a otra. */
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, rainBus, purrBus, noiseBuf, revIn;
  // volúmenes de 0 a 10; con los de entrada, los efectos y la música suenan como en el Fogonazo publicado (70 y 35 %)
  // y la lluvia queda de fondo
  const CLAVE = 'coleccion.sonido';
  const vol = { musica: 7, efectos: 8, lluvia: 7 };
  try { const v = JSON.parse(localStorage.getItem(CLAVE)); if (v) for (const k in vol) if (Number.isFinite(v[k])) vol[k] = Math.max(0, Math.min(10, Math.round(v[k]))); } catch (e) {}
  const set = { sfx: 0.7, music: 0.35, mute: false, foco: 1 };   // foco: la música más baja para concentrarse (Buen ojo, en la partida)
  const fromVol = () => { set.sfx = vol.efectos / 10 * 0.875; set.music = vol.musica / 10 * 0.5; };
  fromVol();
  const last = {};
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const N = s => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
  let pulseWaves = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return true; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = 1.035;   // 0.3.0: +15 % (antes 0.9)
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    sfxBus = ctx.createGain(); musicBus = ctx.createGain(); rainBus = ctx.createGain(); rainBus.gain.value = 0;
    sfxBus.connect(master); musicBus.connect(master); master.connect(comp); comp.connect(ctx.destination); rainBus.connect(ctx.destination);
    // el ronroneo va directo, como la lluvia: por el compresor, sus graves le bajarían el volumen a todo lo demás
    purrBus = ctx.createGain(); purrBus.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    pulseWaves = {};
    for (const duty of [0.125, 0.25, 0.5]) {
      const n = 48, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) { re[k] = Math.sin(2 * Math.PI * k * duty) / (Math.PI * k); im[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (Math.PI * k); }
      pulseWaves[duty] = ctx.createPeriodicWave(re, im);
    }
    // una sala chica, para las primas orientales del mahjong
    const len = Math.floor(ctx.sampleRate * 1.5), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const c = ir.getChannelData(ch); for (let i = 0; i < len; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.6); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    revIn = ctx.createGain(); const revOut = ctx.createGain(); revOut.gain.value = 0.8;
    revIn.connect(conv); conv.connect(revOut); revOut.connect(musicBus);
    apply();
    return true;
  }
  function apply() {
    if (!ctx) return;
    const m = set.mute ? 0 : 1;
    sfxBus.gain.setTargetAtTime(set.sfx * m, ctx.currentTime, 0.02);
    musicBus.gain.setTargetAtTime(set.music * 0.6 * m * (Music.ducked ? 0.3 : 1) * set.foco, ctx.currentTime, 0.3);
    if (set.music * m > 0) Music.resume(); else Music.halt();
    Rain.apply();
    // con los efectos en 8 (los de entrada), al 75 %: el volumen de la prueba donde se aprobó
    purrBus.gain.setTargetAtTime(set.sfx * m * 1.07, ctx.currentTime, 0.05);
  }
  function throttle(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return false;
    last[name] = now; return true;
  }

  // ------------------------------------------------------------ voces básicas
  function out(dest, pan) {
    if (!pan || !ctx.createStereoPanner) return dest;
    const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(dest); return p;
  }
  function env(g, t, a, peak, dec, sus, end, rel) {
    const tA = Math.max(t + 0.001, Math.min(t + a, end));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, tA);
    let lvl = peak, tD = tA;
    if (dec && end > tA) {
      tD = Math.min(tA + dec, end);
      lvl = Math.max(0.0001, peak * Math.pow(sus, (tD - tA) / dec));
      g.gain.exponentialRampToValueAtTime(lvl, tD);
    }
    if (end > tD) g.gain.setValueAtTime(lvl, end);
    g.gain.exponentialRampToValueAtTime(0.0001, Math.max(end, tD) + rel);
  }
  function tone(o) {
    const t = o.at !== undefined ? o.at : ctx.currentTime + (o.t || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    if (o.duty) osc.setPeriodicWave(pulseWaves[o.duty]); else osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.slide || o.dur));
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.f * 0.012, t + Math.min(0.35, o.dur * 0.6)); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + o.dur + 0.1); }
    const v = o.vol || 0.15;
    if (o.hold) env(g, t, o.attack || 0.004, v, o.dec || 0, o.sus || 1, t + o.dur, o.rel || 0.04);
    else { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur); }
    osc.connect(g); g.connect(out(o.dest || sfxBus, o.pan));
    osc.start(t); osc.stop(t + o.dur + (o.rel || 0.04) + 0.05);
  }
  function noise(o) {
    const t = o.at !== undefined ? o.at : ctx.currentTime + (o.t || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.freq2) f.frequency.exponentialRampToValueAtTime(o.freq2, t + o.dur);
    f.Q.value = o.q || 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + (o.attack || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(out(o.dest || sfxBus, o.pan));
    src.start(t, Math.random() * 0.5); src.stop(t + o.dur + 0.03);
  }
  // FM de 2 operadores: modulador → frecuencia del portador. index = desvío / frecuencia del modulador.
  function fm(o) {
    const t = o.at !== undefined ? o.at : ctx.currentTime + (o.t || 0);
    const f = o.f, ratio = o.ratio || 1, fmf = f * ratio;
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.type = o.car || 'sine'; mod.type = o.mod || 'sine';
    car.frequency.setValueAtTime(f, t);
    if (o.f2) car.frequency.exponentialRampToValueAtTime(o.f2, t + (o.slide || o.dur));
    if (o.detune) car.detune.value = o.detune;
    mod.frequency.setValueAtTime(fmf, t);
    if (o.f2) mod.frequency.exponentialRampToValueAtTime(o.f2 * ratio, t + (o.slide || o.dur));
    const i0 = (o.index || 2) * fmf, i1 = (o.indexEnd !== undefined ? o.indexEnd : (o.index || 2) * 0.3) * fmf;
    mg.gain.setValueAtTime(i0, t);
    mg.gain.exponentialRampToValueAtTime(Math.max(0.01, i1), t + (o.indexTime || 0.15));
    mod.connect(mg); mg.connect(car.frequency);
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.01, t + Math.min(0.3, o.dur * 0.6)); l.connect(lg); lg.connect(car.frequency); l.start(t); l.stop(t + o.dur + 0.2); }
    const rel = o.rel || 0.08;
    env(g, t, o.attack || 0.004, o.vol || 0.12, o.dec || 0, o.sus === undefined ? 1 : o.sus, t + o.dur, rel);
    car.connect(g); g.connect(out(o.dest || sfxBus, o.pan));
    if (o.send) g.connect(o.send);
    car.start(t); mod.start(t); car.stop(t + o.dur + rel + 0.05); mod.stop(t + o.dur + rel + 0.05);
  }

  // ------------------------------------------------------------ voces orientales (mahjong)
  // koto: cuerda pulsada FM con una leve caída de afinación al atacar
  function koto(f, t, vol, dest, pan, send, len) {
    const L = len || 1.1;
    fm({ at: t, f: f * 1.008, f2: f, slide: 0.05, ratio: 1, index: 2.6, indexEnd: 0.06, indexTime: 0.16, dur: L, vol, attack: 0.002, dec: L, sus: 0.03, rel: 0.08, pan, dest, send });
    fm({ at: t, f: f * 3, ratio: 1, index: 0.7, indexEnd: 0.05, indexTime: 0.05, dur: 0.22, vol: vol * 0.3, attack: 0.001, dec: 0.22, sus: 0.02, rel: 0.03, pan, dest });
    noise({ at: t, dur: 0.016, vol: vol * 0.45, filter: 'bandpass', freq: 3800, q: 1.2, dest, pan });
  }
  // flauta tipo dizi: ataque limpio, una nota de adorno desde arriba y vibrato liviano
  function flauta(f, t, d, vol, dest, pan, send) {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
    const g = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain(), o = out(dest || sfxBus, pan);
    o1.type = 'sine'; o2.type = 'triangle'; o3.type = 'sine'; g2.gain.value = 0.45; g3.gain.value = 0.12;
    const adorno = d > 0.3;
    [[o1, 1], [o2, 1], [o3, 2]].forEach(([osc, m]) => {
      if (adorno) { osc.frequency.setValueAtTime(f * m * 1.1225, t); osc.frequency.setValueAtTime(f * m, t + 0.05); }
      else osc.frequency.setValueAtTime(f * m, t);
    });
    o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
    if (d > 0.35) {
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.8;
      lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(0, t + 0.18); lg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(d, 0.5));
      l.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); l.start(t); l.stop(t + d + 0.3);
    }
    env(g, t, 0.025, vol, 0.3, 0.8, t + d, 0.12);
    g.connect(o); if (send) g.connect(send);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(f * 3, 8000); bp.Q.value = 2;
    const ng = ctx.createGain(), hold = Math.max(d, 0.12);
    ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.015);
    ng.gain.exponentialRampToValueAtTime(vol * 0.05, t + 0.1); ng.gain.setValueAtTime(vol * 0.05, t + hold); ng.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.1);
    src.connect(bp); bp.connect(ng); ng.connect(o);
    src.start(t, Math.random() * 0.4); src.stop(t + d + 0.3);
    for (const x of [o1, o2, o3]) { x.start(t); x.stop(t + d + 0.25); }
  }
  // pon: tamborcito de mano, para darle rebote
  function pon(t, f, vol, dest) {
    tone({ at: t, f, f2: f * 0.7, slide: 0.12, dur: 0.22, vol, type: 'sine', dest });
    noise({ at: t, dur: 0.02, vol: vol * 0.5, filter: 'lowpass', freq: 1500, dest });
  }
  function madera(t, f, vol, dest, pan) {
    tone({ at: t, f, f2: f * 0.88, slide: 0.05, dur: 0.07, vol, type: 'sine', dest, pan });
    noise({ at: t, dur: 0.012, vol: vol * 0.7, filter: 'bandpass', freq: f * 2.3, q: 3, dest, pan });
  }
  function rin(t, f, vol, dest) {
    fm({ at: t, f, ratio: 2.76, index: 0.9, indexEnd: 0.05, indexTime: 1.4, dur: 2.4, vol, attack: 0.003, dec: 2.4, sus: 0.01, rel: 0.3, dest });
    fm({ at: t, f: f * 2.02, ratio: 1, index: 0.2, indexEnd: 0.01, dur: 1.2, vol: vol * 0.35, attack: 0.003, dec: 1.2, sus: 0.01, rel: 0.2, dest });
  }

  // ------------------------------------------------------------ voces renacentistas (Buen ojo, S-33)
  // laúd: cuerda pulsada con el dedo, por Karplus-Strong, calculada una vez por nota
  const cuerdasLaud = new Map();
  function cuerdaLaud(m) {
    if (cuerdasLaud.has(m)) return cuerdasLaud.get(m);
    const sr = ctx.sampleRate, f = mtof(m), P = Math.max(2, Math.round(sr / f - 0.5)), len = Math.floor(sr * 1.6);
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), ring = new Float32Array(P);
    let prev = 0; for (let i = 0; i < P; i++) { prev = prev * 0.55 + (Math.random() * 2 - 1) * 0.45; ring[i] = prev; }
    const damp = 0.9955 - Math.min(0.006, f / 200000);
    let q = 0; for (let i = 0; i < len; i++) { const a = ring[q], b = ring[(q + 1) % P]; d[i] = a; ring[q] = damp * 0.5 * (a + b); q = (q + 1) % P; }
    let pk = 0; for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(d[i])); for (let i = 0; i < len; i++) d[i] /= pk || 1;
    cuerdasLaud.set(m, buf); return buf;
  }
  function laud(m, t, vol, dest, pan) {
    const s = ctx.createBufferSource(); s.buffer = cuerdaLaud(m);
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; g.gain.value = vol;
    s.connect(lp); lp.connect(g); g.connect(out(dest, pan)); s.start(t); s.stop(t + 1.6);
  }
  function vibratoR(param, f, t, prof) {
    const l = ctx.createOscillator(), g = ctx.createGain(); l.frequency.value = 5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0, t + 0.18); g.gain.linearRampToValueAtTime(f * prof, t + 0.43);
    l.connect(g); g.connect(param); l.start(t); return l;
  }
  // flauta dulce: casi un seno, con algo de triangular y de la octava (para que el parlante del teléfono la lleve), un
  // soplo al atacar y un vibrato liviano y tardío
  function flautaDulce(m, t, d, vol, dest, pan) {
    const f = mtof(m), o = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
    o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f; g2.gain.value = 0.55; o3.frequency.value = f * 2; g3.gain.value = 0.12;
    const lv = vibratoR(o.frequency, f, t, 0.004), lv2 = vibratoR(o2.frequency, f, t, 0.004);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.035); g.gain.setValueAtTime(vol * 0.92, t + Math.max(0.055, d - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.05);
    o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g); g.connect(out(dest, pan));
    noise({ at: t, dur: 0.05, vol: vol * 0.5, filter: 'bandpass', freq: f * 2, q: 3, dest, pan });
    o.start(t); o2.start(t); o3.start(t); for (const x of [o, o2, o3, lv, lv2]) x.stop(t + d + 0.08);
  }
  // viola da gamba: dos sierras apenas desafinadas por un cuerpo oscuro, con arco (ataque suave), sin vibrato
  function gamba(m, t, d, vol, dest, pan) {
    const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(), cuerpo = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.6; cuerpo.type = 'peaking'; cuerpo.frequency.value = 900; cuerpo.Q.value = 1.2; cuerpo.gain.value = 5;
    const osc = [-3, 3].map(c => { const x = ctx.createOscillator(); x.type = 'sawtooth'; x.frequency.value = f; x.detune.value = c; x.connect(lp); return x; });
    lp.connect(cuerpo); cuerpo.connect(g); g.connect(out(dest, pan));
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.035); g.gain.setValueAtTime(vol, t + Math.max(0.035, d - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.07);
    osc.forEach(x => { x.start(t); x.stop(t + d + 0.12); });
  }
  // tamboril: un tambor de marco grave, que se siente más de lo que se oye
  function tamboril(t, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(85, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.22);
    noise({ at: t, dur: 0.05, vol: vol * 0.35, filter: 'lowpass', freq: 900, dest });
  }

  // ------------------------------------------------------------ efectos
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5, 1568];
  const MJ_SEMI = [0, 2, 4, 7, 9, 12, 14, 16, 19], MJ_PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const FX8 = {
    click() { tone({ f: 1400, dur: 0.03, vol: 0.06 }); },
    swap() { tone({ f: 520, f2: 820, dur: 0.07, vol: 0.07, duty: 0.25 }); },
    bad() { tone({ f: 190, dur: 0.09, vol: 0.09 }); tone({ f: 150, t: 0.1, dur: 0.12, vol: 0.09 }); },
    match(c) {
      const k = Math.min(PENTA.length - 1, (c || 1) - 1);
      tone({ f: PENTA[k], dur: 0.14, vol: 0.09, duty: 0.25 });
      tone({ f: PENTA[k] / 2, dur: 0.18, vol: 0.08, type: 'triangle' });
      noise({ dur: 0.04, vol: 0.05, filter: 'highpass', freq: 5000 });
    },
    special() { [0, 0.05, 0.1].forEach((t, i) => tone({ f: [660, 880, 1320][i], t, dur: 0.08, vol: 0.07, duty: 0.125 })); },
    beam() { tone({ f: 1800, f2: 160, dur: 0.28, vol: 0.06, type: 'sawtooth' }); noise({ dur: 0.25, vol: 0.09, filter: 'bandpass', freq: 3000, freq2: 600, q: 2 }); },
    blast() { noise({ dur: 0.45, vol: 0.22, filter: 'lowpass', freq: 1400, freq2: 120 }); tone({ f: 140, f2: 40, dur: 0.35, vol: 0.18, type: 'triangle' }); },
    zap() { tone({ f: 300, f2: 2400, dur: 0.35, vol: 0.06, duty: 0.125 }); for (let i = 0; i < 5; i++) noise({ t: i * 0.06, dur: 0.04, vol: 0.08, filter: 'highpass', freq: 2500 }); },
    ant() { [0, 0.07, 0.14].forEach(t => tone({ f: 1568, f2: 2093, t, dur: 0.05, vol: 0.06, duty: 0.25 })); tone({ f: 2400, f2: 600, t: 0.2, dur: 0.18, vol: 0.04, duty: 0.125 }); },
    nova() { tone({ f: 80, f2: 1600, dur: 0.6, vol: 0.08, duty: 0.5 }); noise({ dur: 0.8, vol: 0.2, filter: 'lowpass', freq: 3000, freq2: 100 }); },
    solder() { noise({ dur: 0.22, vol: 0.05, filter: 'bandpass', freq: 5200, q: 3 }); tone({ f: 2100, dur: 0.05, vol: 0.025, type: 'triangle' }); },
    crack() { noise({ dur: 0.12, vol: 0.14, filter: 'lowpass', freq: 900 }); tone({ f: 95, dur: 0.1, vol: 0.1 }); },
    rip() { noise({ dur: 0.16, vol: 0.1, filter: 'highpass', freq: 600, freq2: 6000 }); },
    tube() { tone({ f: 220, dur: 0.18, vol: 0.06, type: 'triangle' }); [880, 1108.7, 1318.5].forEach((f, i) => tone({ f, t: 0.08 + i * 0.07, dur: 0.12, vol: 0.05, duty: 0.25 })); },
    shuffle() { noise({ dur: 0.5, vol: 0.08, filter: 'bandpass', freq: 400, freq2: 3000, q: 1.5 }); },
    star(i) { const f = [988, 1175, 1568][i] || 988; tone({ f, dur: 0.3, vol: 0.08, duty: 0.25 }); tone({ f: f * 2, t: 0.06, dur: 0.2, vol: 0.04, duty: 0.125 }); },
    win() { [523, 659, 784, 1047].forEach((f, i) => { tone({ f, t: i * 0.11, dur: 0.16, vol: 0.08, duty: 0.25 }); tone({ f: f / 2, t: i * 0.11, dur: 0.2, vol: 0.06, type: 'triangle' }); }); tone({ f: 1047, t: 0.46, dur: 0.5, vol: 0.07, duty: 0.25 }); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone({ f, t: i * 0.16, dur: 0.2, vol: 0.08, type: 'triangle' })); },
    warn() { tone({ f: 1760, dur: 0.05, vol: 0.05, duty: 0.5 }); },
    bonus(i) { tone({ f: 660 * Math.pow(1.06, i || 0), dur: 0.06, vol: 0.05, duty: 0.125 }); },
    goal() { tone({ f: 1318.5, dur: 0.08, vol: 0.06, duty: 0.25 }); tone({ f: 1760, t: 0.08, dur: 0.12, vol: 0.06, duty: 0.25 }); },

    // mahjong: primos de los de Fogonazo, tocados con koto, madera y campana
    toc() { const t = ctx.currentTime; noise({ at: t, dur: 0.028, vol: 0.12, filter: 'bandpass', freq: 2700, q: 1.8 }); fm({ at: t, f: 2100, ratio: 1.41, index: 1.5, indexEnd: 0.2, indexTime: 0.03, dur: 0.035, vol: 0.045 }); },
    suelta() { noise({ dur: 0.022, vol: 0.06, filter: 'bandpass', freq: 1900, q: 1.8 }); },
    boton() { madera(ctx.currentTime, 1250, 0.05); },
    // el «Bip» de Fogonazo (dos notas a una quinta, que suben con la cadena), tocado por un koto
    par(c) {
      const t = ctx.currentTime, k = Math.pow(2, MJ_SEMI[Math.min(MJ_SEMI.length - 1, (c || 1) - 1)] / 12);
      noise({ at: t, dur: 0.02, vol: 0.1, filter: 'bandpass', freq: 3000, q: 2 });
      noise({ at: t + 0.025, dur: 0.02, vol: 0.08, filter: 'bandpass', freq: 2500, q: 2 });
      koto(659.25 * k, t, 0.085, null, -0.1, null, 0.7);
      koto(987.77 * k, t + 0.05, 0.075, null, 0.1, null, 0.8);
    },
    mal() { const t = ctx.currentTime; fm({ at: t, f: 190, ratio: 1.41, index: 3, indexEnd: 1, indexTime: 0.08, dur: 0.09, vol: 0.09, car: 'triangle' }); fm({ at: t + 0.1, f: 150, ratio: 1.41, index: 3, indexEnd: 1, indexTime: 0.08, dur: 0.12, vol: 0.09, car: 'triangle' }); },
    baraja() {
      const t = ctx.currentTime;
      for (let i = 0; i < 10; i++) noise({ at: t + Math.random() * 0.45, dur: 0.022, vol: 0.06 + Math.random() * 0.05, filter: 'bandpass', freq: 1800 + Math.random() * 1600, q: 2, pan: Math.random() * 1.2 - 0.6 });
      MJ_PENTA.forEach((f, i) => koto(f, t + 0.08 + i * 0.045, 0.04, null, (i - 2.5) * 0.12, null, 0.6));
    },
    reparte() { const t = ctx.currentTime; for (let i = 0; i < 16; i++) noise({ at: t + i * 0.045 + Math.random() * 0.02, dur: 0.02, vol: 0.05 + Math.random() * 0.04, filter: 'bandpass', freq: 2000 + Math.random() * 1400, q: 2, pan: Math.random() * 1.2 - 0.6 }); },
    pista() { rin(ctx.currentTime, 1568, 0.035); },
    deshacer() { const t = ctx.currentTime; koto(987.77, t, 0.06, null, 0, null, 0.5); koto(659.25, t + 0.06, 0.055, null, 0, null, 0.6); },
    limpio() {
      const t = ctx.currentTime;
      MJ_PENTA.forEach((f, i) => koto(f, t + i * 0.07, 0.07, null, (i - 2.5) * 0.1, null, 0.9));
      flauta(1046.5, t + 0.45, 0.9, 0.05, sfxBus, 0, null);
      rin(t + 0.42, 1318.5, 0.045);
      fm({ at: t + 0.42, f: 98, ratio: 1.4, index: 2, indexEnd: 0.2, indexTime: 0.6, dur: 1.4, vol: 0.06, dec: 1.4, sus: 0.05, rel: 0.2 });
    },
    record() { const t = ctx.currentTime; [1046.5, 1318.5, 1568].forEach((f, i) => koto(f, t + i * 0.09, 0.065, null, 0, null, 0.9)); rin(t + 0.3, 2093, 0.035); },

    // Buen ojo (S-34): sonidos del oficio del pintor y los instrumentos de su música
    // tocar una cinta: la cinta de papel, un golpecito sordo con algo de papel
    bo_cinta() { const t = ctx.currentTime, d = nivel(0.96); noise({ at: t, dur: 0.035, vol: 0.22, filter: 'lowpass', freq: 1400, dest: d }); senoR(t, 210, 150, 0.06, 0.16, d); noise({ at: t + 0.004, dur: 0.05, vol: 0.05, filter: 'bandpass', freq: 3800, q: 1.5, dest: d }); },
    // agarrar el pomo: un clic de aluminio, apagado
    bo_agarra() { const t = ctx.currentTime, d = nivel(2.56); [[2500, 0.045, 0.045], [3900, 0.03, 0.03], [5800, 0.02, 0.015]].forEach(([f, l, v]) => senoR(t, f, 0, l, v, d)); noise({ at: t, dur: 0.012, vol: 0.1, filter: 'bandpass', freq: 3000, q: 1.2, dest: d }); },
    // soltar el pomo: un toque liviano sobre la mesa
    bo_suelta() { const t = ctx.currentTime, d = nivel(2); noise({ at: t, dur: 0.016, vol: 0.12, filter: 'bandpass', freq: 1500, q: 1.8, dest: d }); senoR(t, 330, 250, 0.03, 0.06, d); },
    // la revelación: una pincelada sobre el papel, igual para cualquier puntaje
    bo_pincel() {
      const t = ctx.currentTime, d = nivel(2.5);
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(4200, t + 0.32);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      src.connect(f); f.connect(g); g.connect(d); src.start(t, Math.random() * 0.5); src.stop(t + 0.34);
      for (let j = 0; j < 7; j++) noise({ at: t + 0.04 + j * 0.035, dur: 0.02, vol: 0.025, filter: 'bandpass', freq: 2500 + j * 300, q: 3, dest: d });
    },
    // fin de partida (S-35): la hoja del block que se da vuelta; el récord, la hoja y un sello de goma. Suenan con la
    // música baja (la partida la baja al terminar)
    bo_fin() { hojaBlock(ctx.currentTime, nivel(1)); },
    bo_record() { const t = ctx.currentTime, d = nivel(0.9); hojaBlock(t, d); selloGoma(t + 0.5, d); },

    // Biblioteca (S-42): los efectos de la variante D, en Bi (más abajo); apoya recibe el material
    bi_agarra(a) { Bi.efecto('agarra', a); },
    bi_apoya(a) { Bi.efecto('apoya', a); },
    bi_trio(a) { Bi.efecto('trio', a); },
    bi_llave(a) { Bi.efecto('llave', a); },
    bi_vidrio(a) { Bi.efecto('vidrio', a); },
    bi_reja(a) { Bi.efecto('reja', a); },
    bi_deshace(a) { Bi.efecto('deshace', a); },
    bi_trabada(a) { Bi.efecto('trabada', a); },
    bi_boton(a) { Bi.efecto('boton', a); },
    bi_dificultad(a) { Bi.efecto('dificultad', a); },
    bi_fin(a) { Bi.efecto('fin', a); },
    bi_record(a) { Bi.efecto('record', a); },
  };
  // cada efecto de Buen ojo pasa por su nivel: el que tenía en la prueba (S-34), medido acá (los golpes muy cortos
  // salen más bajos con el ataque de noise(), por eso algunos niveles pasan de 1)
  const BAJA_BO = 0.63;   // 0.15.1: todos unos 4 dB más bajos, porque sobresalían sobre la música
  function nivel(v) { const g = ctx.createGain(); g.gain.value = v * BAJA_BO; g.connect(sfxBus); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 4000); return g; }
  function senoR(t, f, f2, dur, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  // una hoja del block que se da vuelta: se levanta (la banda de ruido sube), pasa (un soplo) y cae sobre las otras
  function hojaBlock(t, d) {
    noise({ at: t, dur: 0.14, vol: 0.45, filter: 'bandpass', freq: 700, freq2: 2600, q: 0.9, attack: 0.05, dest: d, pan: -0.2 });
    noise({ at: t + 0.1, dur: 0.2, vol: 0.6, filter: 'bandpass', freq: 2400, freq2: 1100, q: 0.7, attack: 0.03, dest: d, pan: 0.2 });
    for (let j = 0; j < 5; j++) noise({ at: t + 0.03 + j * 0.04 + Math.random() * 0.015, dur: 0.014, vol: 0.15, filter: 'bandpass', freq: 4200 + Math.random() * 1800, q: 3, dest: d });
    senoR(t + 0.27, 140, 90, 0.06, 0.25, d); noise({ at: t + 0.27, dur: 0.05, vol: 0.3, filter: 'lowpass', freq: 900, dest: d });
  }
  // un sello de goma sobre el papel: un golpe sordo con un toque del mango
  function selloGoma(t, d) {
    senoR(t, 115, 55, 0.11, 0.45, d);
    noise({ at: t, dur: 0.06, vol: 0.27, filter: 'lowpass', freq: 650, q: 0.8, attack: 0.002, dest: d });
    noise({ at: t + 0.004, dur: 0.025, vol: 0.08, filter: 'bandpass', freq: 1800, q: 1.5, attack: 0.002, dest: d });
  }

  // ------------------------------------------------------------ Biblioteca (S-41, S-42)
  // La música: Taller como primo de dibujito de los 70 (B2), a 116 con swing: bajo eléctrico, piano eléctrico en el
  // arpegio, bongós en los contratiempos, shaker en corcheas, pandereta en el 2 y el 4 y la melodía silbada; al cierre de
  // la vuelta sin melodía, un barrido de vibráfono con glockenspiel. Los efectos, la variante D: cada objeto suena como
  // lo que es (libro, plástico, metal, madera) con una nota en do, y el trío, la llave, las puertas, deshacer, «No queda
  // lugar», el final y el récord con silbidos y glockenspiel. Las voces y los niveles son los de la prueba donde se
  // aprobaron (herramientas/biblioteca/prueba-sonido.html, borrada al aprobarse: queda en Git).
  const Bi = (() => {
    const N2 = N;
    const glk = (n, t, vol, d, pan) => glock(N2(n), t, vol, d, pan);
    const sil = (n, t, dur, vol, d) => silbido(N2(n) - 12, t, dur, vol, d, 0.1);
    const salida = (dest, pan) => { if (!pan) return dest; const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(dest); return p; };

    function ruido(t, dur, vol, tipo, freq, q, dest, pan, freq2) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.setValueAtTime(freq, t); f.Q.value = q || 0.8;
      if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(salida(dest, pan)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    function seno(t, f, f2, dur, vol, dest, pan, tipo) {
      const o = ctx.createOscillator(), g = ctx.createGain(); if (tipo) o.type = tipo; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(salida(dest, pan)); o.start(t); o.stop(t + dur + 0.02);
    }
    function vibrato(param, f, t, prof, vel, demora) {
      const l = ctx.createOscillator(), g = ctx.createGain(); l.frequency.value = vel || 5.2;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0, t + (demora || 0.15)); g.gain.linearRampToValueAtTime(f * prof, t + (demora || 0.15) + 0.25);
      l.connect(g); g.connect(param); l.start(t); return l;
    }
    function bloque(t, alto, vol, dest) {
      const f = alto ? 1250 : 880;
      seno(t, f, f * 0.92, 0.06, vol, dest, alto ? 0.3 : -0.3);
      ruido(t, 0.012, vol * 0.6, 'bandpass', f * 2.2, 3, dest, alto ? 0.3 : -0.3);
    }
    function silbato(t, m0, m1, dur, vol, dest) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f0 = mtof(m0), f1 = mtof(m1);
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.85);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = f1 * 0.012; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.setValueAtTime(vol, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(salida(dest, 0.15));
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4;
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.85);
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.05); ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bp); bp.connect(ng); ng.connect(salida(dest, 0.15));
      o.start(t); l.start(t); s.start(t); for (const x of [o, l, s]) x.stop(t + dur + 0.05);
    }
    function bajoE(m, t, d, vol, dest) {
      const f = mtof(m), L = Math.min(d, 0.5), o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), g2 = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sawtooth'; o2.frequency.value = f; g2.gain.value = 0.25;
      lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.setValueAtTime(1300, t); lp.frequency.exponentialRampToValueAtTime(350, t + 0.15);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(vol * 0.45, t + L); g.gain.exponentialRampToValueAtTime(0.0001, t + L + 0.06);
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest);
      o.start(t); o2.start(t); o.stop(t + L + 0.1); o2.stop(t + L + 0.1);
    }
    function fm(t, f, ratio, i0, i1, iT, dur, vol, dest, pan, dec) {
      const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
      car.frequency.value = f; mod.frequency.value = f * ratio;
      mg.gain.setValueAtTime(i0 * f * ratio, t); mg.gain.exponentialRampToValueAtTime(Math.max(0.01, i1 * f * ratio), t + iT);
      mod.connect(mg); mg.connect(car.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(vol * (dec || 0.3), t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      car.connect(g); g.connect(salida(dest, pan)); car.start(t); mod.start(t); car.stop(t + dur + 0.02); mod.stop(t + dur + 0.02);
    }
    function rhodesB(m, t, vol, dest, pan) {
      const f = mtof(m);
      fm(t, f, 1, 2.6, 0.35, 0.18, 0.8, vol, dest, pan, 0.3);
      fm(t, f * 7, 1, 0.8, 0.05, 0.04, 0.16, vol * 0.3, dest, pan, 0.2);
    }
    function vibra(m, t, d, vol, dest, pan) {
      const f = mtof(m), L = Math.max(0.9, d * 1.5), g = ctx.createGain(), trem = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5.5; lg.gain.value = 0.28; trem.gain.value = 0.72; l.connect(lg); lg.connect(trem.gain);
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = f; o2.frequency.value = f * 4; g2.gain.setValueAtTime(0.25, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + L);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(trem); trem.connect(salida(dest, pan));
      ruido(t, 0.01, vol * 0.25, 'bandpass', 3000, 1.2, dest, pan);
      for (const x of [o, o2, l]) { x.start(t); x.stop(t + L + 0.05); }
    }
    function glock(m, t, vol, dest, pan) {
      const f = mtof(m);
      seno(t, f, 0, 0.6, vol, dest, pan);
      seno(t, f * 2.76, 0, 0.15, vol * 0.35, dest, pan);
      ruido(t, 0.006, vol * 0.5, 'highpass', 6000, 1, dest, pan);
    }
    function shaker(t, acc, vol, dest) { ruido(t, acc ? 0.05 : 0.035, acc ? vol : vol * 0.55, 'bandpass', 7500, 1.2, dest, 0.35); }
    function pandereta(t, vol, dest) {
      for (let j = 0; j < 4; j++) ruido(t + j * 0.006, 0.12 - j * 0.02, vol * (1 - j * 0.2), 'bandpass', 8500 + j * 700, 3, dest, -0.3);
      ruido(t, 0.02, vol * 0.6, 'bandpass', 2200, 1.5, dest, -0.3);
    }
    function bajoEB(m, t, d, vol, dest) {
      bajoE(m, t, d, vol, dest);
      ruido(t, 0.015, vol * 0.3, 'bandpass', 1800, 2, dest);
    }
    function vibraP(m, t, d, vol, dest, pan) {
      const f = mtof(m), L = Math.max(0.7, d * 1.3), g = ctx.createGain(), trem = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5.5; lg.gain.value = 0.12; trem.gain.value = 0.88; l.connect(lg); lg.connect(trem.gain);
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = f; o2.frequency.value = f * 4; g2.gain.setValueAtTime(0.3, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(vol * 0.7, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + L);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(trem); trem.connect(salida(dest, pan));
      seno(t, f * 10, 0, 0.05, vol * 0.15, dest, pan); ruido(t, 0.01, vol * 0.3, 'bandpass', 3000, 1.2, dest, pan);
      for (const x of [o, o2, l]) { x.start(t); x.stop(t + L + 0.05); }
    }
    function silbido(m, t, d, vol, dest, pan) {
      const f = mtof(m) * 2, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(f * 0.97, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
      const v = vibrato(o.frequency, f, t, 0.008, 6.2, 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.025); g.gain.setValueAtTime(vol * 0.9, t + Math.max(0.04, d - 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.04);
      o.connect(g); g.connect(salida(dest, pan));
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 6;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(vol * 0.6, t + 0.02); ng.gain.exponentialRampToValueAtTime(vol * 0.15, t + 0.08); ng.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.04);
      s.connect(bp); bp.connect(ng); ng.connect(salida(dest, pan));
      o.start(t); s.start(t, Math.random() * 0.5); o.stop(t + d + 0.08); s.stop(t + d + 0.08); v.stop(t + d + 0.08);
    }
    function bongo(t, alto, vol, dest) {
      const f = alto ? 420 : 310, pan = alto ? 0.3 : -0.3;
      seno(t, f, f * 0.86, alto ? 0.12 : 0.16, vol, dest, pan);
      ruido(t, 0.018, vol * 0.4, 'bandpass', f * 4, 1.5, dest, pan);
    }
    function golpe(t, f, f2, dur, vol, d, pan) { seno(t, f, f2, dur, vol, d, pan); }
    function timbre(t, d, vol) { seno(t, 2093, 0, 1.3, vol, d, 0.15); seno(t, 2093 * 2.71, 0, 0.5, vol * 0.3, d, 0.15); ruido(t, 0.006, vol * 0.8, 'bandpass', 5000, 2, d, 0.15); }
    const APOYA = {
      libro(t, d) { golpe(t, 170, 105, 0.08, 0.2, d); ruido(t, 0.05, 0.14, 'lowpass', 900, 0.8, d); ruido(t + 0.003, 0.03, 0.035, 'bandpass', 3000, 1.5, d); },
      plastico(t, d) { ruido(t, 0.014, 0.16, 'bandpass', 3300, 3, d); seno(t, 1900, 0, 0.02, 0.05, d); ruido(t + 0.024, 0.01, 0.07, 'bandpass', 2600, 3, d); golpe(t, 260, 200, 0.04, 0.06, d); },
      metal(t, d) { golpe(t, 220, 160, 0.04, 0.08, d); [[2450, 0.14, 0.045], [3720, 0.09, 0.028], [5330, 0.06, 0.016]].forEach(([f, l, v]) => seno(t, f, 0, l, v, d)); ruido(t, 0.008, 0.06, 'bandpass', 4000, 2, d); },
      madera(t, d) { golpe(t, 540, 480, 0.07, 0.11, d); ruido(t, 0.018, 0.09, 'bandpass', 1500, 2, d); seno(t, 1950, 0, 0.05, 0.02, d); },
    };
    const NOTA_D = { libro: 'G4', plastico: 'C5', madera: 'E5', metal: 'G5' };
    const FXD = {
      agarra(t, d) { seno(t, 900, 1450, 0.06, 0.045, d); ruido(t, 0.02, 0.03, 'bandpass', 2400, 1.5, d); },
      apoya(t, d, mat) { APOYA[mat](t, d); const n = NOTA_D[mat]; if (mat === 'metal') glk(n, t, 0.04, d, 0.1); else seno(t, mtof(N(n)), mtof(N(n)) * 0.82, 0.12, 0.07, d, 0.1); },
      trio(t, d) { sil('C6', t, 0.07, 0.07, d); sil('E6', t + 0.07, 0.07, 0.07, d); sil('G6', t + 0.14, 0.14, 0.075, d); seno(t + 0.3, 500, 1300, 0.05, 0.09, d); ruido(t + 0.3, 0.03, 0.06, 'bandpass', 2000, 1.5, d); },
      llave(t, d) { ['G6', 'C7', 'E7', 'G7'].forEach((n, j) => glk(n, t + j * 0.05, 0.035, d, -0.2 + j * 0.15)); },
      vidrio(t, d) { ruido(t, 0.012, 0.1, 'bandpass', 2600, 3, d); ruido(t + 0.07, 0.012, 0.1, 'bandpass', 3000, 3, d); ['C6', 'E6', 'G6', 'C7'].forEach((n, j) => glk(n, t + 0.14 + j * 0.06, 0.04, d, -0.2 + j * 0.15)); },
      reja(t, d) { golpe(t, 300, 180, 0.08, 0.1, d); for (let j = 0; j < 6; j++) ruido(t + 0.08 + j * 0.025, 0.01, 0.06, 'bandpass', 2400 + j * 300, 3, d, -0.3 + j * 0.12);
        silbato(t + 0.1, N('C5'), N('C6'), 0.25, 0.035, d); [[1046, 0.3, 0.05], [1568, 0.2, 0.025]].forEach(([f, l, v]) => seno(t + 0.36, f, 0, l, v, d, 0.3)); },
      deshace(t, d) { silbido(N('A5') - 12, t, 0.13, 0.06, d, 0); seno(t, 1400, 800, 0.14, 0.02, d); },
      trabada(t, d) { sil('G5', t, 0.14, 0.07, d); sil('E5', t + 0.2, 0.28, 0.07, d); },
      boton(t, d) { bloque(t, true, 0.06, d); },
      dificultad(t, d) { ruido(t, 0.14, 0.06, 'bandpass', 900, 1, d, 0, 1800); glk('E6', t + 0.1, 0.035, d, 0.1); },
      fin(t, d) { sil('G5', t, 0.1, 0.075, d); sil('C6', t + 0.12, 0.1, 0.075, d); sil('E6', t + 0.24, 0.4, 0.08, d); ['C5', 'E5', 'G5'].forEach((n, j) => vibraP(N(n), t + 0.24, 0.6, 0.03, d, -0.2 + j * 0.2)); },
      record(t, d) { FXD.fin(t, d); ['C7', 'E7', 'G7', 'C8'].forEach((n, j) => glk(n, t + 0.5 + j * 0.05, 0.03, d, -0.2 + j * 0.15)); timbre(t + 0.8, d, 0.04); },
    };
    // el nivel de cada efecto, medido contra la música en la prueba
    const NIVEL = { 'agarra': 1.349, 'apoya:libro': 0.519, 'apoya:plastico': 0.955, 'apoya:metal': 0.495, 'apoya:madera': 0.741, 'trio': 0.335, 'llave': 0.398, 'vidrio': 0.417, 'reja': 0.569, 'deshace': 0.275, 'trabada': 0.237, 'boton': 1.334, 'dificultad': 0.610, 'fin': 0.248, 'record': 0.269 };
    function efecto(nombre, mat) {
      const g = ctx.createGain(); g.gain.value = NIVEL[nombre + (mat ? ':' + mat : '')] || 1; g.connect(sfxBus);
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 4000);
      FXD[nombre](ctx.currentTime + 0.01, g, mat);
    }
    // un paso de la música (una semicorchea): las corcheas de contratiempo, atrasadas por el swing
    function paso(song, step, t0, S, dest) {
      const k = step % 64, bar = (k / 16) | 0, i = k % 16, conMel = ((step / 64) | 0) % 2 === 1;
      const chord = song.chordsM[bar], root = song.rootsM[bar], t = t0 + (i % 4 === 2 ? S * 0.6 : 0);
      if (song.bass.includes(i)) bajoEB(root, t, S * song.bassLen, 0.12, dest);
      if (i % 2 === 0) { rhodesB(chord[(i / 2) % 3] + 12, t, 0.045, dest, (i / 2) % 2 ? 0.2 : -0.2); shaker(t, i % 4 === 2, 0.03, dest); }
      if (song.hats.includes(i)) bongo(t, i % 8 === 2, 0.045, dest);
      if (i === 4 || i === 12) pandereta(t, 0.035, dest);
      const L = conMel ? song.leadByStep.get(k) : null;
      if (L) silbido(L[0], t, S * L[1] * 0.95, 0.066, dest, 0.1);
      if (!conMel && k === 58) ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, j) => { vibra(N2(n), t + j * S * 0.5, S, 0.03, dest, -0.3 + j * 0.12); glk(n, t + j * S * 0.5, 0.012, dest, 0.2); });
    }
    return { efecto, paso };
  })();

  function play(name, arg, gap) {
    if (!ctx || set.mute || set.sfx <= 0) return;
    if (!throttle(name, gap === undefined ? 35 : gap)) return;
    try { FX8[name](arg); } catch (e) {}
  }

  // ------------------------------------------------------------ música
  // Temas de 4 compases (64 semicorcheas). "Placa" es el tema original del juego;
  // "Taller" (mapa) y "Urgente" (contrarreloj) salen de la misma familia.
  // "Siesta" (modo zen) es más tranquilo: tonalidad mayor, acordes con séptima, sin hi-hats seguidos,
  // bajo largo e instrumentos suaves (soft: true, ver ARR['8s']).
  const SONGS = {
    map: {
      name: 'Taller', bpm: 92,
      chords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']],
      roots: ['C3', 'G2', 'A2', 'F2'],
      bass: [0, 6, 8, 14], bassLen: 1.8, octave: [],
      arpEvery: 2, hats: [2, 6, 10, 14], hatAccent: [], kick: [], snare: [], leadPasses: 'odd',
      lead: [[0, 'E5', 4], [4, 'G5', 2], [6, 'E5', 2], [8, 'D5', 4], [12, 'C5', 4],
        [16, 'D5', 2], [18, 'B4', 2], [20, 'D5', 4], [24, 'G5', 6],
        [32, 'C5', 2], [34, 'E5', 2], [36, 'A5', 4], [40, 'G5', 2], [42, 'E5', 2], [44, 'C5', 4],
        [48, 'A4', 2], [50, 'C5', 2], [52, 'F5', 4], [56, 'E5', 3], [60, 'D5', 4]],
    },
    game: {
      name: 'Placa', bpm: 104,
      chords: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']],
      roots: ['A2', 'F2', 'C3', 'G2'],
      bass: [0, 6, 8, 14], bassLen: 1.8, octave: [],
      arpEvery: 1, hats: [0, 2, 4, 6, 8, 10, 12, 14], hatAccent: [2, 6, 10, 14], kick: [], snare: [], leadPasses: 'odd',
      lead: [[0, 'E5', 2], [4, 'G5', 2], [8, 'A5', 3], [14, 'G5', 2],
        [16, 'F5', 2], [20, 'E5', 2], [24, 'C5', 4],
        [32, 'E5', 2], [36, 'G5', 2], [40, 'C6', 3], [46, 'B5', 2],
        [48, 'A5', 2], [52, 'G5', 2], [56, 'D5', 4]],
    },
    timed: {
      name: 'Urgente', bpm: 144,
      chords: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['D4', 'F4', 'A4'], ['E3', 'G#3', 'B3']],
      roots: ['A2', 'F2', 'D3', 'E2'],
      bass: [0, 2, 4, 6, 8, 10, 12, 14], bassLen: 1.3, octave: [2, 6, 10, 14],
      arpEvery: 1, hats: [0, 2, 4, 6, 8, 10, 12, 14], hatAccent: [2, 6, 10, 14], kick: [0, 8], snare: [4, 12], leadPasses: 'all',
      lead: [[0, 'A5', 2], [2, 'G5', 2], [4, 'A5', 2], [6, 'E5', 2], [8, 'A5', 2], [10, 'C6', 2], [12, 'B5', 2], [14, 'A5', 2],
        [16, 'A5', 2], [18, 'G5', 2], [20, 'F5', 2], [22, 'C5', 2], [24, 'F5', 2], [26, 'A5', 2], [28, 'G5', 2], [30, 'F5', 2],
        [32, 'F5', 2], [34, 'E5', 2], [36, 'D5', 2], [38, 'A4', 2], [40, 'D5', 2], [42, 'F5', 2], [44, 'E5', 2], [46, 'D5', 2],
        [48, 'E5', 2], [50, 'F5', 2], [52, 'G#5', 4], [56, 'B5', 2], [58, 'G#5', 2], [60, 'E5', 4]],
    },
    zen: {
      name: 'Siesta', bpm: 104, soft: true,
      chords: [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'D4']],
      roots: ['F2', 'E2', 'D2', 'C2'],
      bass: [0, 10], bassLen: 5, octave: [],
      arpEvery: 2, hats: [4, 12], hatAccent: [], kick: [], snare: [], leadPasses: 'odd',
      lead: [[0, 'A5', 6], [8, 'G5', 2], [10, 'E5', 4],
        [16, 'D5', 6], [24, 'E5', 2], [26, 'G5', 4],
        [32, 'F5', 6], [40, 'E5', 2], [42, 'C5', 4],
        [48, 'D5', 4], [52, 'E5', 2], [54, 'G5', 2], [56, 'E5', 6]],
    },
  };
  // Primas orientales para el mahjong: mismo tempo, ritmo, acordes y bajo que Siesta y Taller. La melodía pasa a do
  // pentatónica mayor (sin fa ni si) cambiando solo esas notas por la vecina. El color oriental lo dan el koto, la
  // flauta, la madera, el tamborcito y el glissando de cierre (ver ARR.jp y schedJp).
  Object.assign(SONGS, {
    zenO: { name: 'Siesta oriental', bpm: 104, jp: true, leadInst: 'flauta', arpVol: 0.024, hatVol: 0.02, ponVol: 0.045, pon: [0, 8], rin: 2093,
      chords: [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'D4']], roots: ['F2', 'E2', 'D2', 'C2'],
      bass: [0, 10], bassLen: 5, octave: [], arpEvery: 2, hats: [4, 12], hatAccent: [],
      lead: [[0, 'A5', 6], [8, 'G5', 2], [10, 'E5', 4], [16, 'D5', 6], [24, 'E5', 2], [26, 'G5', 4],
        [32, 'A5', 6], [40, 'E5', 2], [42, 'C5', 4], [48, 'D5', 4], [52, 'E5', 2], [54, 'G5', 2], [56, 'E5', 6]] },
    mapO: { name: 'Taller oriental', bpm: 92, jp: true, leadInst: 'koto', arpVol: 0.026, hatVol: 0.022, ponVol: 0.05, pon: [0, 8], rin: 2093,
      chords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']], roots: ['C3', 'G2', 'A2', 'F2'],
      bass: [0, 6, 8, 14], bassLen: 1.8, octave: [], arpEvery: 2, hats: [2, 6, 10, 14], hatAccent: [],
      lead: [[0, 'E5', 4], [4, 'G5', 2], [6, 'E5', 2], [8, 'D5', 4], [12, 'C5', 4], [16, 'D5', 2], [18, 'A4', 2], [20, 'D5', 4], [24, 'G5', 6],
        [32, 'C5', 2], [34, 'E5', 2], [36, 'A5', 4], [40, 'G5', 2], [42, 'E5', 2], [44, 'C5', 4], [48, 'A4', 2], [50, 'C5', 2], [52, 'G5', 4], [56, 'E5', 3], [60, 'D5', 4]] },
  });
  // El primo renacentista de Taller, para todo Buen ojo (S-33; 0.15.1: un solo tema, porque los cuatro, que cambiaban
  // con la dificultad, no se llevaban bien al pasar de una pantalla a otra). Mismo tempo, ritmo, acordes y bajo que el
  // de Fogonazo. Laúd en los arpegios, flauta dulce en la melodía con un adorno corto en las notas largas, viola da
  // gamba en el bajo y tamboril. Suena tan fuerte como el original (trim, medido en herramientas/buenojo/prueba-musica.html).
  // 0.15.2 (S-36, L3): con menos presencia y la misma estructura: la gamba una nota larga por compás, el laúd dos (la
  // fundamental y la quinta), sin tamboril, y la melodía en negras, sin adornos (las notas entre tiempos se van y la
  // anterior se sostiene), con la flauta unos 3 dB más baja.
  const RENACENTISTAS = {
    tallerR: ['map', { fl: 0.06, laud: 0.09, tambor: {}, trim: 0.363, bass: [0], bassLen: 6, arpEvery: 8, arpNotas: [0, 2], adorno: false,
      lead: [[0, 'E5', 4], [4, 'G5', 4], [8, 'D5', 4], [12, 'C5', 4], [16, 'D5', 8], [24, 'G5', 6],
        [32, 'C5', 4], [36, 'A5', 4], [40, 'G5', 4], [44, 'C5', 4], [48, 'A4', 4], [52, 'F5', 4], [56, 'E5', 4], [60, 'D5', 4]] }],
  };
  for (const [id, [base, o]] of Object.entries(RENACENTISTAS))
    SONGS[id] = Object.assign({}, SONGS[base], { name: SONGS[base].name + ' renacentista', ren: true, soft: false, escala: [0, 2, 4, 5, 7, 9, 11] }, o);
  // el primo de dibujito de Taller, para todo Biblioteca (S-41): mismos acordes, bajo y melodía, a 116 y con swing; los
  // instrumentos y el swing, en Bi.paso. Suena tan fuerte como el original (trim, medido en la prueba)
  SONGS.tallerD = Object.assign({}, SONGS.map, { name: 'Taller de dibujito', bpm: 116, dib: true, soft: false, trim: 0.42 });
  function defineSong(id, s) {
    s.chordsM = s.chords.map(c => c.map(N));
    s.rootsM = s.roots.map(N);
    s.leadByStep = new Map(s.lead.map(([st, n, len]) => [st, [N(n), len]]));
    SONGS[id] = s;
  }
  for (const [id, s] of Object.entries(SONGS)) defineSong(id, s);

  // los instrumentos del tema original (pulsos percusivos, cuadrada, triangular, ruido)
  function pluck(f, t, dur, vol, type, dest, duty) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    if (duty) osc.setPeriodicWave(pulseWaves[duty]); else osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + dur + 0.02);
  }
  function hiss(t, vol, dest, dur, freq, type, pan) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = freq || 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.04));
    src.connect(f); f.connect(g); g.connect(out(dest, pan)); src.start(t, Math.random() * 0.5); src.stop(t + (dur || 0.04) + 0.02);
  }
  const ARR = {
    '8': {
      bass(f, t, d, dest) { pluck(f, t, d, 0.12, 'square', dest); },
      arp(f, t, d, dest) { pluck(f, t, d, 0.035, 'triangle', dest); },
      hat(t, acc, dest) { hiss(t, acc ? 0.05 : 0.025, dest); },
      kick(t, dest) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.08); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.13); },
      snare(t, dest) { hiss(t, 0.08, dest, 0.11, 1500, 'bandpass'); },
      lead(f, t, d, dest) { pluck(f, t, d, 0.045, 'square', dest); },
    },
    // suave (modo zen): bajo triangular, arpegio de pulso fino tipo caja de música, melodía de pulso al 25 %
    jp: {
      bass(f, t, d, dest) { const L = Math.min(d, 1.0); fm({ at: t, f, ratio: 1, index: 1.5, indexEnd: 0.25, indexTime: 0.12, dur: L, vol: 0.08, dec: L, sus: 0.12, rel: 0.06, dest }); },
      arp(f, t, d, dest, k, s) { koto(f, t, s.arpVol, dest, k % 4 < 2 ? -0.3 : 0.3, null, Math.max(0.5, d * 1.8)); },
      hat(t, acc, dest, s) { madera(t, acc ? 1320 : 1000, acc ? s.hatVol * 1.5 : s.hatVol, dest, 0.22); },
      drum(t, acc, dest, s) { pon(t, acc ? 330 : 262, s.ponVol * (acc ? 1 : 0.75), dest); },
      lead(f, t, d, dest, send, s) { if (s.leadInst === 'koto') koto(f, t, 0.06, dest, -0.1, send, Math.max(0.9, d * 1.4)); else flauta(f, t, d, 0.05, dest, -0.1, send); },
    },
    '8s': {
      bass(f, t, d, dest) { pluck(f, t, Math.min(d, 1.2), 0.13, 'triangle', dest); },
      arp(f, t, d, dest) { pluck(f, t, d * 1.6, 0.022, null, dest, 0.125); },
      hat(t, acc, dest) { hiss(t, 0.014, dest, 0.03, 9000); },
      kick() {}, snare() {},
      lead(f, t, d, dest) { pluck(f, t, d, 0.04, null, dest, 0.25); },
    },
  };

  const Music = (() => {
    let timer = null, cur = null, step = 0, nextT = 0, want = null;
    const st = { ducked: false };
    function makeBus(song) {
      const b = ctx.createGain(); b.gain.value = 1;
      b.connect(musicBus);
      const d = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2400; fb.gain.value = 0.22; wet.gain.value = 0.14;
      d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(b);
      // las orientales: eco a tres semicorcheas y un poco de sala
      if (song && song.jp) { d.delayTime.value = (60 / song.bpm / 4) * 3; const s = ctx.createGain(); s.gain.value = 0.14; b.connect(s); s.connect(revIn); }
      // las renacentistas: su nivel y la misma sala chica
      // la de dibujito: su nivel y un poco de la sala chica
      if (song && song.dib) { b.gain.value = song.trim; const s = ctx.createGain(); s.gain.value = 0.175; b.connect(s); s.connect(revIn); }
      if (song && song.ren) { b.gain.value = song.trim; const s = ctx.createGain(); s.gain.value = 0.275; b.connect(s); s.connect(revIn); }
      return { b, echoIn: d, delay: d };
    }
    function schedJp(c, t, S) {
      const song = c.song, A = ARR.jp, dest = c.bus.b, k = step % 64, bar = (k / 16) | 0, b = k % 16;
      const chord = song.chordsM[bar], root = song.rootsM[bar];
      if (song.bass.includes(b)) A.bass(mtof(root + (song.octave.includes(b) ? 12 : 0)), t, S * song.bassLen, dest);
      if (b % song.arpEvery === 0) A.arp(mtof(chord[(b / song.arpEvery) % chord.length] + 12), t, S * song.arpEvery * 0.9, dest, b, song);
      if (song.hats.includes(b)) A.hat(t, song.hatAccent.includes(b), dest, song);
      if (song.pon.includes(b)) A.drum(t, b === 0, dest, song);
      if (step % 128 === 0) rin(t, song.rin, 0.022, dest);
      // glissando de koto al cierre de la vuelta sin melodía
      if (k === 56 && ((step / 64) | 0) % 2 === 0) MJ_PENTA.forEach((f, i) => koto(f, t + i * S * 0.5, 0.03, dest, (i - 2.5) * 0.12, null, 0.7));
      if (((step / 64) | 0) % 2 === 1) { const L = song.leadByStep.get(k); if (L) A.lead(mtof(L[0]), t, S * L[1] * 0.95, dest, c.bus.echoIn, song); }
    }
    function schedRen(c, t, S) {
      const song = c.song, dest = c.bus.b, k = step % 64, bar = (k / 16) | 0, i = k % 16;
      const chord = song.chordsM[bar], root = song.rootsM[bar];
      if (song.bass.includes(i)) gamba(root + (song.octave.includes(i) ? 12 : 0), t, S * song.bassLen, song.bass.length > 4 ? 0.045 : 0.06, dest, -0.15);
      if (i % song.arpEvery === 0) { const j = i / song.arpEvery; laud(chord[song.arpNotas ? song.arpNotas[j % song.arpNotas.length] : j % chord.length], t, song.laud, dest, (song.arpNotas ? j % 2 === 0 : i % 4 < 2) ? -0.25 : 0.25); }
      if (song.tambor[i]) tamboril(t, song.tambor[i], dest);
      if (song.leadPasses === 'all' || ((step / 64) | 0) % 2 === 1) {
        const L = song.leadByStep.get(k);
        if (!L) return;
        const [m, len] = L, d = S * len * 0.95;
        // un adorno corto desde la nota de arriba en las notas largas, como haría un flautista
        if (len >= 4 && song.adorno !== false) {
          let sup = m + 2; for (const x of [1, 2]) if (song.escala.includes((m + x) % 12)) { sup = m + x; break; }
          flautaDulce(sup, t, S * 0.45, song.fl * 0.9, dest, 0.1); flautaDulce(m, t + S * 0.5, d - S * 0.5, song.fl, dest, 0.1);
        } else flautaDulce(m, t, d, song.fl, dest, 0.1);
      }
    }
    function schedStep(c, t, S) {
      if (c.song.jp) { schedJp(c, t, S); return; }
      if (c.song.ren) { schedRen(c, t, S); return; }
      if (c.song.dib) { Bi.paso(c.song, step, t, S, c.bus.b); return; }
      const song = c.song, A = ARR[song.soft ? '8s' : '8'], dest = c.bus.b, k = step % 64, bar = (k / 16) | 0, b = k % 16;
      const chord = song.chordsM[bar], root = song.rootsM[bar];
      if (song.bass.includes(b)) A.bass(mtof(root + (song.octave.includes(b) ? 12 : 0)), t, S * song.bassLen, dest);
      if (b % song.arpEvery === 0) A.arp(mtof(chord[(b / song.arpEvery) % chord.length] + 12), t, S * song.arpEvery * 0.9, dest, b);
      if (song.hats.includes(b)) A.hat(t, song.hatAccent.includes(b), dest);
      if (song.kick.includes(b)) A.kick(t, dest);
      if (song.snare.includes(b)) A.snare(t, dest);
      const pass = (step / 64) | 0;
      if (song.leadPasses === 'all' || pass % 2 === 1) {
        const L = song.leadByStep.get(k);
        if (L) A.lead(mtof(L[0]), t, S * L[1] * 0.95, dest, k, c.bus.echoIn);
      }
    }
    function tick() {
      if (!cur) return;
      const S = 60 / cur.song.bpm / 4;
      while (nextT < ctx.currentTime + 0.15) { schedStep(cur, nextT, S); step++; nextT += S; }
    }
    function start(track) {
      if (!ctx) return;
      if (cur && cur.track === track) return;
      stopNow(0.25);
      cur = { track, song: SONGS[track], bus: makeBus(SONGS[track]) };
      step = 0; nextT = ctx.currentTime + 0.08;
      if (!timer) timer = setInterval(tick, 30);
    }
    function stopNow(fade) {
      if (cur) {
        const bb = cur.bus.b, t = ctx.currentTime;
        bb.gain.setValueAtTime(bb.gain.value, t); bb.gain.linearRampToValueAtTime(0, t + (fade || 0.05));
        setTimeout(() => { try { bb.disconnect(); } catch (e) {} }, ((fade || 0.05) + 0.6) * 1000);
      }
      cur = null;
      if (timer) { clearInterval(timer); timer = null; }
    }
    return {
      get ducked() { return st.ducked; },
      want(track) { want = { track }; if (ctx && set.music > 0 && !set.mute && !document.hidden) start(want.track); },
      resume() { if (want && ctx && !document.hidden) start(want.track); },
      halt() { stopNow(0.2); },
      duck(on) { st.ducked = on; apply(); },
      stop() { want = null; stopNow(0.3); },
      current() { return cur ? { track: cur.track, name: cur.song.name } : null; },
      songs: SONGS,
    };
  })();

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { Music.halt(); ctx.suspend().catch(() => {}); }
    else { ctx.resume().catch(() => {}); apply(); }
  });

  // ------------------------------------------------------------ lluvia (la de la sala)
  // 0.5.0 (#39): una lluvia leve escuchada desde adentro, detrás del vidrio. Un colchón grave y apagado (ruido rosa
  // filtrado) y gotitas cortas, parejas y apagadas, que pegan en el vidrio al azar y repartidas en el estéreo. Sin gotas
  // gordas espaciadas: desde adentro suenan falsas. La anterior era solo el colchón, más brillante, y sonaba a viento.
  const Rain = (() => {
    const BED = { hp: 90, lp: 520, g: 0.15 }, DROPS = { rate: 34, lo: 1600, hi: 4200, dur: 0.018, vol: 0.05 };
    let built = false, on = false, timer = null, next = 0;
    function build() {
      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const dd = buf.getChannelData(c); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
          b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
          dd[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
        }
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = BED.hp;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = BED.lp;
      const g = ctx.createGain(); g.gain.value = BED.g;
      src.connect(hp).connect(lp).connect(g).connect(rainBus);
      src.start();
      built = true;
    }
    // una gota en el vidrio: un chasquido de ruido muy corto por un filtro resonante
    function drop(t) {
      const D = DROPS, src = ctx.createBufferSource(); src.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = D.lo * Math.pow(D.hi / D.lo, Math.random()); f.Q.value = 3 + Math.random() * 6;
      const g = ctx.createGain(), v = D.vol * (0.3 + Math.random() * Math.random() * 1.7), dur = D.dur * (0.6 + Math.random() * 0.9);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.0012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.8 - 0.9;
      src.connect(f).connect(g).connect(p).connect(rainBus); src.start(t, Math.random() * 0.9); src.stop(t + dur + 0.02);
    }
    function tick() {
      const now = ctx.currentTime, until = now + 0.12;
      if (next < now) next = now + 0.02;
      while (next < until) { drop(next); next += -Math.log(1 - Math.random()) / DROPS.rate; }
    }
    return {
      want(v) { on = v; this.apply(); },
      apply() {
        if (!ctx) return;
        // 0.5.1: 0,5, el mismo nivel de la prueba de sonido donde se eligió. En la 0.5.0 iba a 0,155 y casi no se
        // oía: es una lluvia grave y apagada, y el parlante del teléfono deja pasar poco de los graves
        const g = on && !set.mute ? vol.lluvia / 10 * 0.5 : 0;
        if (g > 0 && !built) build();
        rainBus.gain.setTargetAtTime(g, ctx.currentTime, 0.4);
        if (g > 0 && !timer) timer = setInterval(tick, 40);
        else if (g === 0 && timer) { clearInterval(timer); timer = null; }
      },
    };
  })();

  // ------------------------------------------------------------ el ronroneo (el de la gata de la sala)
  // 0.25.0 (S-45): se arma armónico por armónico sobre las medidas de un ronroneo real (no usa su audio): unos 24
  // pulsos por segundo, con la respiración alternando una fase corta y fuerte (más grave y redonda) y una larga y suave
  // (la que más se oye en el parlante del teléfono), con una micropausa antes de la fuerte, y casi nada por encima de
  // 800 Hz. Se le baja la nota más grave, que el teléfono no reproduce, para que lo que sí se oye pueda sonar más.
  // Las tres últimas respiraciones bajan de a poco y los últimos 2,5 s se desvanecen. Dura unos 8 o 12 s, al azar, y
  // cada uno sale un poco distinto. Se arma de a tramos, sin trabar la pantalla, y queda uno listo de antemano.
  // Descartados en S-45: los ronroneos cortos, maullidos y otros ruiditos (sintetizados, sonaban falsos) y filtrar
  // ruido (sonaba a lata o, muy filtrado, como debajo de un almohadón).
  const Purr = (() => {
    const SR = 44100, TAU = 2 * Math.PI;
    const azar = (a, b) => a + Math.random() * (b - a);
    const suave = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
    const db = x => Math.pow(10, x / 20);
    // nivel de cada armónico (dB) según su frecuencia, medido en las dos fases del ronroneo real
    const FUERTE = [[24, 0], [48, -13], [96, -22], [170, -42], [250, -45], [350, -48], [450, -47], [550, -51], [650, -55], [800, -59], [1000, -70]];
    const SUAVE = [[24, -10], [48, -18], [96, -21], [170, -30], [250, -34], [350, -39], [450, -37], [550, -45], [650, -54], [800, -60], [1000, -71]];
    const TELEFONO = [[24, -10], [48, -5], [96, 0], [2000, 0]];
    function curva(t, f) {
      if (f <= t[0][0]) return t[0][1];
      for (let i = 1; i < t.length; i++) if (f <= t[i][0]) return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * Math.log(f / t[i - 1][0]) / Math.log(t[i][0] / t[i - 1][0]);
      return t[t.length - 1][1] - 12 * Math.log2(f / t[t.length - 1][0]);
    }
    const N = 44;   // armónicos: hasta unos 1100 Hz
    // un ciclo de respiración: la micropausa, la fase fuerte y la suave, larga
    const ciclo = (v = 1) => [{ dur: azar(0.04, 0.07), fuerte: 0, nivel: 0.05 * v }, { dur: azar(0.36, 0.45), fuerte: 1, nivel: v }, { dur: azar(0.78, 0.95), fuerte: 0, nivel: 0.9 * v }];
    async function armar() {
      const n = Math.random() < 0.5 ? 6 : 9;
      const fases = Array.from({ length: n }, (_, i) => ciclo([0.45, 0.65, 0.85][n - 1 - i] ?? 1)).flat();
      fases.push({ dur: 0.001, fuerte: 0, nivel: 0 });   // lleva el último pulso a silencio
      const d = new Float32Array(Math.ceil((fases.reduce((s, f) => s + f.dur, 0) + 0.2) * SR));
      const cf = new Float64Array(N + 1), sf = new Float64Array(N + 1);   // la fase de cada armónico, fija en cada ronroneo
      for (let k = 1; k <= N; k++) { const f = k < 8 ? 0 : Math.random() * TAU; cf[k] = Math.cos(f); sf[k] = Math.sin(f); }
      let tc = 0.03, prev = null;   // un solo reloj: los pulsos y las fases quedan pegados, sin huecos ni encimados
      for (const fa of fases) {
        const ini = tc;
        while (tc - ini < fa.dur) {
          const f0 = (fa.fuerte ? 25.8 : 24.2) * azar(0.97, 1.03), T = 1 / f0, p = (tc - ini) / fa.dur;
          const env = fa.nivel * suave(p / 0.15) * suave((1 - p) / 0.2) * azar(0.92, 1.08), amp = new Float64Array(N + 1);
          for (let k = 1; k <= N; k++) {
            const f = k * f0;
            amp[k] = env * db(fa.fuerte * curva(FUERTE, f) + (1 - fa.fuerte) * curva(SUAVE, f) + curva(TELEFONO, f) + (f > 150 ? azar(-2.5, 2.5) : 0));
          }
          // un período: cada armónico pasa del nivel del pulso anterior al de este, para que no haya saltos
          const s0 = Math.round(tc * SR), ns = Math.round((tc + T) * SR) - s0;
          for (let i = 0; i < ns && s0 + i < d.length; i++) {
            const x = i / ns, c1 = Math.cos(TAU * x), s1 = Math.sin(TAU * x);
            let ck = 1, sk = 0, v = 0;
            for (let k = 1; k <= N; k++) {
              const c = ck * c1 - sk * s1; sk = sk * c1 + ck * s1; ck = c;
              v += (prev ? prev[k] + (amp[k] - prev[k]) * x : amp[k] * x) * (ck * cf[k] - sk * sf[k]);
            }
            d[s0 + i] += v;
          }
          prev = amp; tc += T;
        }
        await new Promise(r => setTimeout(r, 0));   // de a una fase por vez, sin trabar la pantalla
      }
      // los últimos 2,5 s se desvanecen; después, al nivel de la prueba (pico en 0,7)
      let fin = d.length - 1;
      while (fin > 0 && d[fin] === 0) fin--;
      const i0 = Math.max(0, fin - Math.floor(2.5 * SR));
      let pico = 0;
      for (let i = 0; i <= fin; i++) {
        if (i >= i0) d[i] *= Math.pow(Math.cos((i - i0) / (fin - i0) * Math.PI / 2), 1.5);
        pico = Math.max(pico, Math.abs(d[i]));
      }
      if (pico) for (let i = 0; i < d.length; i++) d[i] *= 0.7 / pico;
      return d;
    }
    let listo = null, armando = null, sonando = null;
    function preparar() {
      if (!listo && !armando) armando = armar().then(d => { listo = d; armando = null; });
      return armando || Promise.resolve();
    }
    return {
      preparar,
      // suena un ronroneo; devuelve cuánto dura, en segundos (0 si no puede sonar)
      async play() {
        if (!ensure()) return 0;
        if (!listo) await preparar();
        if (!listo || sonando) return 0;
        const d = listo; listo = null; setTimeout(preparar, 500);   // el próximo, distinto, ya se va armando
        const buf = ctx.createBuffer(1, d.length, SR); buf.getChannelData(0).set(d);
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; src.connect(g); g.connect(purrBus); src.start();
        const yo = { src, g }; sonando = yo;
        src.onended = () => { if (sonando === yo) sonando = null; };
        return buf.duration;
      },
      // se calla con un fundido corto
      stop() {
        if (!sonando || !ctx) return;
        const { src, g } = sonando; sonando = null;
        try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.12); src.stop(ctx.currentTime + 0.6); } catch (e) {}
      },
      get sonando() { return !!sonando; },
    };
  })();

  function setVolume(k, v) {
    if (!(k in vol)) return;
    vol[k] = Math.max(0, Math.min(10, Math.round(v)));
    fromVol(); apply();
    try { localStorage.setItem(CLAVE, JSON.stringify(vol)); } catch (e) {}
  }

  return {
    ensure, play,
    volume: k => vol[k], setVolume,
    music(track) { Music.want(track); },
    stopMusic() { Music.stop(); },
    rain(on) { Rain.want(on); },
    purr() { return Purr.play(); },
    stopPurr() { Purr.stop(); },
    preparePurr() { Purr.preparar(); },
    purring() { return Purr.sonando; },
    duck(on) { Music.duck(on); },
    focus(f) { set.foco = f; apply(); },
    nowPlaying() { return Music.current(); },
    FX: Object.keys(FX8),
    _tap() { return ctx ? { ctx, master } : null; },
  };
})();
