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
    const beatDuration = 60 / 94;
    const phraseBeats = 32;

    // Composición propia, "Luces sobre Surf City", 8 compases en do mayor.
    const melody = [
      ["E5",0,.78],["G5",1,.78],["A5",2,.86],["G5",3,.81],
      ["E5",4,.58],["D5",4.75,.55],["C5",5.5,1.12],["D5",7,.70],
      ["E5",8,.72],["G5",9,.67],["B5",10,.76],["A5",11,.78],
      ["G5",12,.94],["E5",13,.57],["D5",13.75,.52],["E5",14.5,1.13],
      ["C5",16,.73],["E5",17,.70],["G5",18,.77],["A5",19,.79],
      ["B5",20,.78],["A5",21,.56],["G5",21.75,.56],["E5",22.5,1.1],
      ["D5",24,.71],["E5",25,.70],["G5",26,.75],["E5",27,.69],
      ["D5",28,.78],["C5",29,.59],["D5",30,.53],["C5",31,.92]
    ];
    const chords = [
      ["C4","E4","G4"],["A3","C4","E4"],["F3","A3","C4"],["G3","B3","D4"],
      ["C4","E4","G4"],["A3","C4","E4"],["F3","A3","C4"],["G3","B3","D4"]
    ];
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
        button.title = english() ? "Original Christmas melody — mute" : "Melodía navideña original — silenciar";
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
      const amp = context.createGain();
      const stopAt = at + Math.max(.25, duration) + .34;
      amp.gain.setValueAtTime(.0001, at);
      amp.gain.exponentialRampToValueAtTime(Math.max(.0003, loudness), at + .018);
      amp.gain.exponentialRampToValueAtTime(.0001, stopAt);
      amp.connect(output);
      const fundamental = frequency(note);
      const base = context.createOscillator();
      base.type = "sine";
      base.frequency.setValueAtTime(fundamental, at);
      base.connect(amp);
      const shimmer = context.createOscillator();
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(fundamental * 2, at);
      const shimmerGain = context.createGain();
      shimmerGain.gain.value = .12;
      shimmer.connect(shimmerGain);
      shimmerGain.connect(amp);
      base.start(at); shimmer.start(at);
      base.stop(stopAt + .02); shimmer.stop(stopAt + .02);
      shimmer.onended = function () {
        shimmer.disconnect();
        shimmerGain.disconnect();
        base.disconnect();
        amp.disconnect();
      };
    }

    function schedulePhrase(startAt) {
      for (const [note, beat, duration] of melody) {
        bell(note, startAt + beat * beatDuration, duration * beatDuration, .13);
      }
      // Acompañamiento discreto tipo caja musical, sin batería ni audio externo.
      for (let i = 0; i < chords.length; i++) {
        const at = startAt + i * 4 * beatDuration;
        for (const note of chords[i]) {
          bell(note, at, 3.45 * beatDuration, .012);
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
          output.gain.value = .24; // Volumen ambiental bajo.
          output.connect(context.destination);
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
