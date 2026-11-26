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
      const compact = window.matchMedia && window.matchMedia("(max-width:767px)").matches;
      const constrained = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.connection && navigator.connection.saveData);
      const count = constrained ? 10 : compact ? 14 : 32;
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const flake = document.createElement("span");
        flake.className = "christmas-snowflake";
        const duration = 15 + random() * 16;
        const size = i % 9 === 0 ? 6 + random() * 3 : 1.5 + random() * 3.5;
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

    // Grabación instrumental ORIGINAL, alojada con la web (sin YouTube).
    // Intentamos reproducir al cargar, pero respetamos las restricciones
    // de los navegadores: si bloquean autoplay, la primera interacción inicia.
    const sound = document.createElement("audio");
    sound.id = "christmas-original-audio";
    sound.src = "/assets/audio/navidad-surfcity-original.mp3";
    sound.preload = "auto";
    sound.loop = true;
    sound.volume = .34;
    sound.setAttribute("aria-hidden", "true");
    document.body.appendChild(sound);

    const positionKey = "taxi-surfcity-christmas-audio-position";
    let pendingPlay = null;
    let blocked = false;
    let unavailable = false;
    let positionRestored = false;
    function currentLanguage() {
      return document.documentElement.lang === "en";
    }
    function updateButton() {
      const audible = !sound.paused && !sound.muted && wantsMusic;
      button.dataset.playing = audible ? "true" : "false";
      button.setAttribute("aria-pressed", audible ? "true" : "false");
      icon.className = audible ? "bi bi-volume-up-fill" : "bi bi-music-note-beamed";
      if (audible) {
        label.textContent = currentLanguage() ? "Mute Christmas music" : "Silenciar música";
      } else if (unavailable) {
        label.textContent = currentLanguage() ? "Retry Christmas music" : "Reintentar música";
      } else {
        label.textContent = currentLanguage() ? "Play Christmas music" : "Activar música navideña";
      }
      button.setAttribute("aria-label", label.textContent);
      button.title = currentLanguage()
        ? "Original instrumental: Christmas Lights in Surf City"
        : "Instrumental original: Navidad en Surf City";
    }

    function restorePosition() {
      if (positionRestored || sound.readyState < 1) return;
      positionRestored = true;
      try {
        const saved = JSON.parse(sessionStorage.getItem(positionKey) || "{}");
        if (typeof saved.time === "number" && saved.time >= 0 &&
            saved.timestamp > Date.now() - 600000 && Number.isFinite(sound.duration)) {
          sound.currentTime = Math.min(saved.time, Math.max(0, sound.duration - .1));
        }
      } catch (_) { /* Navegador sin almacenamiento disponible. */ }
    }

    function savePosition() {
      try {
        sessionStorage.setItem(positionKey, JSON.stringify({
          time: sound.currentTime || 0, timestamp: Date.now()
        }));
      } catch (_) {}
    }

    function playWhenAllowed() {
      if (!wantsMusic || document.hidden || pendingPlay) return;
      unavailable = false;
      try {
        const result = sound.play();
        if (result && typeof result.then === "function") {
          pendingPlay = result;
          result.then(function () {
            blocked = false;
            unavailable = false;
            pendingPlay = null;
            if (!wantsMusic || document.hidden) sound.pause();
            updateButton();
          }).catch(function (error) {
            pendingPlay = null;
            blocked = error && error.name === "NotAllowedError";
            unavailable = !blocked;
            updateButton();
          });
        } else {
          updateButton();
        }
      } catch (error) {
        blocked = error && error.name === "NotAllowedError";
        unavailable = !blocked;
        updateButton();
      }
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (wantsMusic && !sound.paused) {
        wantsMusic = false;
        sound.pause();
        savePosition();
        try { localStorage.setItem(storageKey, "off"); } catch (_) {}
        updateButton();
      } else {
        wantsMusic = true;
        unavailable = false;
        try { localStorage.setItem(storageKey, "on"); } catch (_) {}
        if (sound.error) sound.load();
        playWhenAllowed();
        updateButton();
      }
    });

    // Primer gesto del usuario: la llamada play() sucede DENTRO del evento.
    // Si el navegador bloqueó el audio al cargar, aquí puede autorizarlo.
    function startOnGesture(event) {
      if (!wantsMusic || (!sound.paused && !blocked)) return;
      if (event.target && event.target.closest &&
          event.target.closest("#christmas-music-toggle")) return;
      playWhenAllowed();
    }
    document.addEventListener("pointerdown", startOnGesture, {capture:true, passive:true});
    document.addEventListener("keydown", startOnGesture, {capture:true, passive:true});

    sound.addEventListener("loadedmetadata", restorePosition);
    sound.addEventListener("play", updateButton);
    sound.addEventListener("pause", updateButton);
    sound.addEventListener("ended", updateButton);
    sound.addEventListener("error", function () {
      unavailable = true;
      updateButton();
    });
    document.addEventListener("languagechange", updateButton);
    document.addEventListener("visibilitychange", function () {
      document.body.classList.toggle("christmas-snow-paused", document.hidden);
      if (document.hidden) {
        savePosition();
        sound.pause();
      } else if (wantsMusic) {
        playWhenAllowed();
      }
      updateButton();
    });
    window.addEventListener("pagehide", function () {
      savePosition();
      sound.pause();
    });

    // Permite que controles multimedia del sistema reproduzcan/pausen el audio.
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("play", function () {
          wantsMusic = true;
          try { localStorage.setItem(storageKey, "on"); } catch (_) {}
          playWhenAllowed();
        });
        navigator.mediaSession.setActionHandler("pause", function () {
          wantsMusic = false;
          try { localStorage.setItem(storageKey, "off"); } catch (_) {}
          sound.pause();
          updateButton();
        });
      } catch (_) { /* Compatibilidad opcional. */ }
    }

    updateButton();
    if (wantsMusic) playWhenAllowed();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChristmasExperience, {once:true});
  } else {
    initChristmasExperience();
  }
})();
