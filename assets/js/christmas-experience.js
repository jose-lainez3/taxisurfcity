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
    const snowStorageKey = "taxi-surfcity-snow-v2";
    const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : {matches:false};
    const compactQuery = window.matchMedia ? window.matchMedia("(max-width:767px)") : {matches:false};
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const lowPower = Boolean((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 3) ||
      (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))));
    let wantsMusic = true;
    let snowPaused = false;
    let snowOverlay = null;
    try {
      wantsMusic = localStorage.getItem(storageKey) !== "off";
      snowPaused = localStorage.getItem(snowStorageKey) === "off";
    } catch (_) { /* El sitio funciona también sin almacenamiento. */ }

    // Tres planos de nieve: polvo lejano, copos medios y cristales cercanos.
    // Solo se crean nodos una vez; CSS anima transform en el compositor.
    function buildSnow() {
      if (snowOverlay || motionQuery.matches) return;
      const overlay = document.createElement("div");
      overlay.id = "christmas-snow-overlay";
      overlay.className = "christmas-snow-overlay";
      overlay.setAttribute("aria-hidden", "true");
      const fragment = document.createDocumentFragment();
      const count = lowPower ? (compactQuery.matches ? 8 : 12) : (compactQuery.matches ? 18 : 40);
      let seed = 20261224;
      function random() {
        seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      for (let i = 0; i < count; i++) {
        const crystal = i % 5 === 0;
        const near = i % 7 === 0;
        const far = i % 3 === 0 && !near;
        const kind = crystal ? "is-crystal" : (far ? "is-soft" : (i % 11 === 0 ? "is-gold" : ""));
        const flake = document.createElement("span");
        flake.className = "christmas-snowflake" + (kind ? " " + kind : "") + (near ? " is-near" : "");
        const duration = near ? 12 + random() * 10 : far ? 27 + random() * 13 : 18 + random() * 15;
        const size = crystal ? (near ? 16 + random() * 7 : 9 + random() * 7)
                     : near ? 6 + random() * 5 : far ? 2 + random() * 2.5 : 3.5 + random() * 4;
        const opacity = crystal ? (.46 + random() * .31) :
                        near ? (.62 + random() * .27) : far ? (.26 + random() * .25) : (.35 + random() * .34);
        const drift = Math.round(-120 + random() * 240);
        const sway = Math.round(16 + random() * 49);
        const spin = Math.round(-115 + random() * 230);
        flake.style.setProperty("--snow-left", (random() * 99).toFixed(2) + "%");
        flake.style.setProperty("--snow-size", size.toFixed(1) + "px");
        flake.style.setProperty("--snow-opacity", opacity.toFixed(2));
        flake.style.setProperty("--snow-drift", drift + "px");
        flake.style.setProperty("--snow-x-start", Math.round(drift * -.25) + "px");
        flake.style.setProperty("--snow-x-mid1", Math.round(drift * .34 + sway) + "px");
        flake.style.setProperty("--snow-x-mid2", Math.round(drift * .60 - sway) + "px");
        flake.style.setProperty("--snow-spin", spin + "deg");
        flake.style.setProperty("--snow-spin-mid1", Math.round(spin * .25) + "deg");
        flake.style.setProperty("--snow-spin-mid2", Math.round(spin * .70) + "deg");
        flake.style.setProperty("--snow-duration", duration.toFixed(2) + "s");
        flake.style.setProperty("--snow-delay", (-random() * duration).toFixed(2) + "s");
        fragment.appendChild(flake);
      }
      overlay.appendChild(fragment);
      document.body.appendChild(overlay);
      snowOverlay = overlay;
    }
    buildSnow();
    document.body.classList.toggle("christmas-snow-user-paused", snowPaused);

    // Un solo grupo flotante: control de música + control de nieve.
    const controls = document.createElement("div");
    controls.className = "christmas-controls";
    document.body.appendChild(controls);

    const button = document.createElement("button");
    button.id = "christmas-music-toggle";
    button.className = "christmas-music-toggle";
    button.type = "button";
    button.dataset.playing = "false";
    button.innerHTML = '<i class="bi bi-music-note-beamed" aria-hidden="true"></i><span class="christmas-music-label"></span>';
    controls.appendChild(button);

    const snowButton = document.createElement("button");
    snowButton.id = "christmas-snow-toggle";
    snowButton.className = "christmas-snow-toggle";
    snowButton.type = "button";
    snowButton.innerHTML = '<i class="bi bi-snow" aria-hidden="true"></i><span class="christmas-snow-label"></span>';
    controls.appendChild(snowButton);
    const snowLabel = snowButton.querySelector(".christmas-snow-label");
    function updateSnowButton() {
      const english = document.documentElement.lang === "en";
      const text = snowPaused
        ? (english ? "Resume snow" : "Reanudar nieve")
        : (english ? "Pause snow" : "Pausar nieve");
      snowButton.dataset.paused = snowPaused ? "true" : "false";
      snowButton.setAttribute("aria-label", text);
      snowButton.setAttribute("aria-pressed", snowPaused ? "true" : "false");
      snowButton.title = text;
      if (snowLabel) snowLabel.textContent = text;
    }
    snowButton.addEventListener("click", function(event) {
      event.stopPropagation();
      snowPaused = !snowPaused;
      document.body.classList.toggle("christmas-snow-user-paused", snowPaused);
      try { localStorage.setItem(snowStorageKey, snowPaused ? "off" : "on"); } catch (_) {}
      updateSnowButton();
    });
    if (motionQuery && motionQuery.addEventListener) {
      motionQuery.addEventListener("change", function() {
        if (!motionQuery.matches) buildSnow();
        snowButton.hidden = motionQuery.matches;
      });
    }
    snowButton.hidden = motionQuery.matches;
    updateSnowButton();
    const icon = button.querySelector("i");
    const label = button.querySelector(".christmas-music-label");
    const english = () => document.documentElement.lang === "en";

    // Grabación instrumental ORIGINAL, alojada con la web (sin YouTube).
    // Intentamos reproducir al cargar, pero respetamos las restricciones
    // de los navegadores: si bloquean autoplay, la primera interacción inicia.
    const sound = document.createElement("audio");
    sound.id = "christmas-original-audio";
    sound.src = "/assets/audio/navidad-surfcity-original.mp3";
    sound.preload = "metadata";
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
    document.addEventListener("languagechange", function() { updateButton(); updateSnowButton(); });
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
