/* Taxi SurfCity Lainez — Navidad 2026
 * Nieve ligera y una melodía instrumental festiva ORIGINAL (sin terceros).
 * Nota: los navegadores pueden bloquear audio automático; se reintenta con
 * la primera interacción. El visitante siempre puede activar o silenciar.
 */
(function () {
  "use strict";

  function initChristmasExperience() {
    if (!document.body || !document.body.classList.contains("site-christmas")) return;
    if (document.getElementById("christmas-music-toggle")) return;

    const storageKey = "taxi-surfcity-christmas-music-v1";
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : {matches:false};
    let wantsMusic = true;
    try { wantsMusic = localStorage.getItem(storageKey) !== "off"; } catch (_) { /* almacenamiento deshabilitado */ }

    // Copos decorativos: sin red, sin imágenes, sin interferir con los botones.
    if (!motionQuery.matches) {
      const overlay = document.createElement("div");
      overlay.id = "christmas-snow-overlay";
      overlay.className = "christmas-snow-overlay";
      overlay.setAttribute("aria-hidden", "true");
      let seed = 20261224;
      function random() {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      const count = window.matchMedia && window.matchMedia("(max-width:767px)").matches ? 14 : 34;
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const flake = document.createElement("span");
        flake.className = "christmas-snowflake";
        const duration = 11 + random() * 12;
        const size = 2.5 + random() * 4;
        flake.style.setProperty("--snow-left", (random() * 99).toFixed(1) + "%");
        flake.style.setProperty("--snow-size", size.toFixed(1) + "px");
        flake.style.setProperty("--snow-opacity", (0.25 + random() * 0.46).toFixed(2));
        flake.style.setProperty("--snow-drift", Math.round(-65 + random() * 130) + "px");
        flake.style.setProperty("--snow-duration", duration.toFixed(1) + "s");
        flake.style.setProperty("--snow-delay", (-random() * duration).toFixed(1) + "s");
        fragment.appendChild(flake);
      }
      overlay.appendChild(fragment);
      document.body.appendChild(overlay);
    }

    const button = document.createElement("button");
    button.id = "christmas-music-toggle";
    button.className = "christmas-music-toggle";
    button.type = "button";
    button.dataset.playing = "false";
    button.innerHTML = '<i class="bi bi-music-note-beamed" aria-hidden="true"></i><span class="christmas-music-label"></span>';
    document.body.appendChild(button);
    const icon = button.querySelector("i");
    const label = button.querySelector(".christmas-music-label");
    const english = () => document.documentElement.lang === "en";

    let context = null;
    let output = null;
    let timer = null;
    let playing = false;
    let nextLoopTime = 0;
    let sleighBuffer = null;
    let sleighFilter = null;

    // "Campanitas sobre Surf City" — jingle ORIGINAL en do mayor, 124 BPM,
    // campanillas brillantes, tintineo de cascabeles y bajo ligero.
    // No reproduce una canción comercial ni descarga música externa.
    const beatDuration = 60 / 124;
    const phraseBeats = 32;
    const melody = [
      ["E5",0,.5],["G5",.75,.48],["A5",1.5,.52],["G5",2,.50],["E5",2.5,.47],["C5",3,.80],
      ["D5",4,.48],["E5",4.5,.48],["G5",5,.47],["A5",5.5,.48],["G5",6,.84],["E5",7,.82],
      ["F5",8,.48],["A5",8.75,.48],["C6",9.5,.7],["A5",10.5,.46],["G5",11,.47],["F5",11.5,.48],
      ["E5",12,.48],["G5",12.5,.46],["D5",13,.48],["G5",13.5,.45],["E5",14,.48],["C5",14.75,.96],
      ["G5",16,.48],["B5",16.75,.5],["D6",17.5,.5],["B5",18.25,.49],["G5",19,.82],
      ["A5",20,.49],["C6",20.75,.5],["E6",21.5,.5],["C6",22.25,.47],["A5",23,.84],
      ["F5",24,.48],["A5",24.75,.45],["C6",25.5,.55],["A5",26.25,.48],["G5",27,.45],["F5",27.5,.48],
      ["E5",28,.48],["D5",28.5,.48],["C5",29,.72],["E5",30,.4],["D5",30.5,.4],["C5",31,.90]
    ];
    const chords = [
      ["C4","E4","G4"],["G3","B3","D4"],["A3","C4","E4"],["F3","A3","C4"],
      ["C4","E4","G4"],["A3","C4","E4"],["F3","A3","C4"],["C4","E4","G4"]
    ];
    const bass = ["C3","G2","A2","F2","C3","A2","F2","C3"];
    const semitones = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

    function frequency(note) {
      const match = /^([A-G])(#?)(\d)$/.exec(note);
      if (!match) return 440;
      const midi = (Number(match[3]) + 1) * 12 + semitones[match[1]] + (match[2] ? 1 : 0);
      return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function updateButton() {
      const isOn = playing && context && context.state === "running";
      button.dataset.playing = isOn ? "true" : "false";
      button.setAttribute("aria-pressed", isOn ? "true" : "false");
      if (isOn) {
        label.textContent = english() ? "Mute Christmas music" : "Silenciar música";
        button.setAttribute("aria-label", label.textContent);
        button.title = english() ? "Christmas jingle — mute" : "Jingle navideño — silenciar";
        icon.className = "bi bi-volume-up-fill";
      } else {
        label.textContent = english() ? "Play Christmas music" : "Activar música navideña";
        button.setAttribute("aria-label", label.textContent);
        button.title = english() ? "Play Christmas music" : "Reproducir música navideña";
        icon.className = "bi bi-music-note-beamed";
      }
      if (!AudioConstructor) {
        button.disabled = true;
        label.textContent = english() ? "Music unavailable" : "Música no disponible";
      }
    }

    function bell(note, at, duration, loudness) {
      if (!context || !output) return;
      const fundamental = frequency(note);
      const end = at + Math.max(.20,duration) + .15;
      const amp = context.createGain();
      amp.gain.setValueAtTime(.0001,at);
      amp.gain.exponentialRampToValueAtTime(loudness,at + .009);
      amp.gain.exponentialRampToValueAtTime(.0001,end);
      amp.connect(output);

      // Tres parciales producen un timbre de campanilla/glóckenspiel.
      const partials = [
        {ratio:1,gain:.72,type:"sine"},
        {ratio:2.01,gain:.18,type:"sine"},
        {ratio:3.92,gain:.10,type:"triangle"}
      ];
      const oscillators = [];
      const partialGains = [];
      partials.forEach(function(part) {
        const voice = context.createOscillator();
        const gain = context.createGain();
        voice.type = part.type;
        voice.frequency.setValueAtTime(fundamental * part.ratio,at);
        gain.gain.value = part.gain;
        voice.connect(gain);
        gain.connect(amp);
        voice.start(at);
        voice.stop(end + .02);
        oscillators.push(voice);
        partialGains.push(gain);
      });
      oscillators[0].onended = function() {
        oscillators.forEach(function(v) { v.disconnect(); });
        partialGains.forEach(function(g) { g.disconnect(); });
        amp.disconnect();
      };
    }

    function pluck(note,at,volume) {
      if (!context || !output) return;
      const oscillator = context.createOscillator();
      const amp = context.createGain();
      const end = at + .32;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency(note),at);
      amp.gain.setValueAtTime(.0001,at);
      amp.gain.exponentialRampToValueAtTime(volume,at + .008);
      amp.gain.exponentialRampToValueAtTime(.0001,end);
      oscillator.connect(amp);
      amp.connect(output);
      oscillator.start(at);
      oscillator.stop(end + .02);
      oscillator.onended = function() { oscillator.disconnect(); amp.disconnect(); };
    }

    function setupSleighBells() {
      if (!context || sleighBuffer) return;
      const length = Math.floor(context.sampleRate * .095);
      sleighBuffer = context.createBuffer(1,length,context.sampleRate);
      const samples = sleighBuffer.getChannelData(0);
      let seed = 614223;
      for (let i = 0; i < samples.length; i++) {
        seed = (1664525 * seed + 1013904223) >>> 0;
        samples[i] = (seed / 2147483648 - 1) * Math.exp(-31 * i / samples.length);
      }
      sleighFilter = context.createBiquadFilter();
      sleighFilter.type = "highpass";
      sleighFilter.frequency.value = 4400;
      sleighFilter.connect(output);
    }

    function sleigh(at,accent) {
      if (!context || !sleighBuffer || !sleighFilter) return;
      const source = context.createBufferSource();
      source.buffer = sleighBuffer;
      const amp = context.createGain();
      amp.gain.value = accent ? .088 : .058;
      source.connect(amp);
      amp.connect(sleighFilter);
      source.start(at);
      source.onended = function() { source.disconnect(); amp.disconnect(); };
    }

    function schedulePhrase(startAt) {
      // Cascabeles en cada corchea, acentos en 1 y 3: ritmo reconocible navideño.
      for (let half = 0; half < phraseBeats * 2; half++) {
        const beat = half / 2;
        sleigh(startAt + beat * beatDuration,half % 8 === 0 || half % 8 === 4);
      }
      // Lead de campanillas brillante con repiques breves.
      for (const [note,beat,duration] of melody) {
        const at = startAt + beat * beatDuration;
        bell(note,at,duration * beatDuration,.17);
        if (beat % 4 === 0) {
          bell(note,at + .13,.20,.033);
        }
      }
      // Acompañamiento suavemente arpegiado: bajo y acordes.
      for (let i = 0; i < chords.length; i++) {
        const at = startAt + i * 4 * beatDuration;
        pluck(bass[i],at,.055);
        pluck(bass[i],at + 2 * beatDuration,.035);
        for (let j = 0; j < chords[i].length; j++) {
          bell(chords[i][j],at + (.35 + j * .45) * beatDuration,.48,.027);
          if (j === 0) {
            bell(chords[i][j],at + 2.8 * beatDuration,.38,.020);
          }
        }
      }
    }

    function tick() {
      if (!playing || !context || context.state !== "running") return;
      const horizon = context.currentTime + 1.25;
      while (nextLoopTime < horizon) {
        schedulePhrase(nextLoopTime);
        nextLoopTime += phraseBeats * beatDuration;
      }
    }

    function beginWhenAllowed(current) {
      if (context !== current || !wantsMusic || document.hidden || current.state !== "running") return;
      if (!playing) {
        playing = true;
        nextLoopTime = context.currentTime + .08;
        tick();
        timer = window.setInterval(tick, 180);
      }
      updateButton();
    }

    function startMusic() {
      if (!wantsMusic || !AudioConstructor || document.hidden) return;
      if (playing && context && context.state === "running") return;
      try {
        if (!context || context.state === "closed") {
          context = new AudioConstructor();
          output = context.createGain();
          output.gain.value = .28; // Volumen moderado de fondo.
          output.connect(context.destination);
          setupSleighBells();
        }
        const ref = context;
        if (ref.state === "running") {
          beginWhenAllowed(ref);
        } else {
          const resumed = ref.resume();
          if (resumed && typeof resumed.then === "function") {
            resumed.then(function () { beginWhenAllowed(ref); }).catch(function () { updateButton(); });
          }
        }
      } catch (_) {
        updateButton();
      }
    }

    function stopMusic() {
      playing = false;
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      const previous = context;
      context = null;
      output = null;
      sleighBuffer = null;
      sleighFilter = null;
      if (previous && previous.state !== "closed") {
        try { previous.close().catch(function () {}); } catch (_) { /* navegador */ }
      }
      updateButton();
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (playing) {
        wantsMusic = false;
        try { localStorage.setItem(storageKey, "off"); } catch (_) {}
        stopMusic();
      } else {
        wantsMusic = true;
        try { localStorage.setItem(storageKey, "on"); } catch (_) {}
        startMusic();
      }
    });

    // Autoplay: se intenta al abrir Inicio o Tours. Si el navegador lo prohíbe,
    // el primer clic/tecla del visitante permite iniciar el audio.
    function unlockFromGesture(event) {
      if (!wantsMusic || playing) return;
      if (event.target && event.target.closest && event.target.closest("#christmas-music-toggle")) return;
      startMusic();
    }
    document.addEventListener("pointerdown", unlockFromGesture, {capture:true,passive:true});
    document.addEventListener("keydown", unlockFromGesture, {capture:true,passive:true});

    document.addEventListener("visibilitychange", function () {
      document.body.classList.toggle("christmas-snow-paused", document.hidden);
      if (document.hidden) stopMusic();
      else if (wantsMusic) startMusic();
    });
    window.addEventListener("pagehide", stopMusic);
    document.addEventListener("languagechange", updateButton);

    updateButton();
    if (wantsMusic) startMusic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChristmasExperience, {once:true});
  } else {
    initChristmasExperience();
  }
})();
