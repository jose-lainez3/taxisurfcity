// main.js — Taxi Surfcity Lainez
document.addEventListener('DOMContentLoaded', () => {

  /* 0. Rendimiento: pausar animaciones con la pestaña oculta + limpieza */
  const root = document.documentElement;
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('fx-paused', document.hidden);
  });

  // Los spans del fondo están ocultos por CSS: se eliminan del DOM
  document.querySelectorAll('.liquid-bg span').forEach(s => s.remove());

  /* Opiniones: el proveedor externo solo se descarga al acercarse al bloque.
     Evita competir con la portada, los tours y el asistente durante el inicio. */
  const reviewsWidget = document.querySelector('.elfsight-app-abbe46b9-a098-481f-b5ac-bb715f6aa488');
  if (reviewsWidget) {
    let reviewScriptLoaded = false;
    const loadReviews = () => {
      if (reviewScriptLoaded) return;
      reviewScriptLoaded = true;
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      script.onerror = () => { reviewScriptLoaded = false; };
      document.head.appendChild(script);
    };
    if ('IntersectionObserver' in window) {
      const reviewsObserver = new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          reviewsObserver.disconnect();
          loadReviews();
        }
      }, { rootMargin: '350px 0px' });
      reviewsObserver.observe(reviewsWidget);
    } else {
      window.addEventListener('load', loadReviews, { once:true });
    }
  }

  // Carga diferida de imágenes fuera del hero
  document.querySelectorAll('img').forEach(img => {
    img.decoding = 'async';
    if (!img.closest('.hero, .hero-collage-wrap, .navbar') && !img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }
  });

  /* 1. Menú móvil */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  /* 2. Reveal on scroll (reemplazo ligero de AOS, respeta prefers-reduced-motion) */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* 3. FAQ accordion propio (sin dependencias) */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-answer').style.maxHeight = null;
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* 4. Fallback de imágenes de tours ausentes */
  window.tourImgFallback = function (img, filename) {
    const placeholder = document.createElement('div');
    placeholder.className = 'tour-img-placeholder';
    placeholder.innerHTML = '<i class="ph-title">Foto próximamente</i><span>' + filename + '</span>';
    img.replaceWith(placeholder);
  };

  /* 5. Tarjetas de tour expandibles ("Ver detalles") */
  function setTourToggleLabel(btn, open) {
    const label = btn.querySelector('span');
    if (!label) return;
    const en = document.documentElement.lang === 'en';
    label.textContent = open
      ? (en ? 'View less' : 'Ver menos')
      : (en ? 'View details' : 'Ver detalles');
  }

  document.querySelectorAll('.tour-card').forEach(card => {
    const btn = card.querySelector('.tour-toggle');
    const details = card.querySelector('.tour-details');
    if (!btn || !details) return;
    btn.addEventListener('click', () => {
      const isOpen = card.classList.contains('is-open');
      card.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      setTourToggleLabel(btn, !isOpen);
    });
  });

  document.addEventListener('languagechange', () => {
    document.querySelectorAll('.tour-card').forEach(card => {
      const btn = card.querySelector('.tour-toggle');
      if (btn) setTourToggleLabel(btn, card.classList.contains('is-open'));
    });
  });

  /* 6. Restricción de fechas + calendario nativo forzado en todos los dispositivos */
  const MAX_MESES_ADELANTE = 12;

  function pad(n) { return String(n).padStart(2, '0'); }

  function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }

  function getMaxDateString() {
    const d = new Date();
    d.setMonth(d.getMonth() + MAX_MESES_ADELANTE);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const dateInputs = document.querySelectorAll('input[type="date"]#q-date, input[type="date"]#fecha');

  function updateDateConstraints() {
    const minDate = getTodayString();
    const maxDate = getMaxDateString();
    dateInputs.forEach(input => {
      input.setAttribute('min', minDate);
      input.setAttribute('max', maxDate);
    });
  }
  updateDateConstraints();

  // Abre el selector de fecha nativo sin importar el dispositivo o navegador
  function openDatePicker(input) {
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (error) {
        // Algunos navegadores exigen que el gesto venga directo del usuario;
        // si falla, el propio input ya muestra su selector nativo al enfocarse.
      }
    }
  }

  dateInputs.forEach(input => {
    // Evita que aparezca el teclado en móvil y fuerza siempre el calendario
    input.setAttribute('inputmode', 'none');

    // Escritorio: clic en cualquier parte del campo
    input.addEventListener('click', function () {
      openDatePicker(this);
    });

    // Móvil (iOS/Android): algunos navegadores solo disparan touchend/pointerup de forma fiable
    input.addEventListener('touchend', function (e) {
      e.preventDefault();
      this.focus();
      openDatePicker(this);
    }, { passive: false });

    input.addEventListener('pointerup', function () {
      openDatePicker(this);
    });

    // Navegación por teclado (tab + enter/espacio)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDatePicker(this);
      }
    });

    input.addEventListener('focus', function () {
      updateDateConstraints();
      openDatePicker(this);
    });

    const enforceDateValidation = function () {
      const minDate = getTodayString();
      const maxDate = getMaxDateString();

      if (this.validity && this.validity.badInput) {
        this.value = '';
        return;
      }
      if (!this.value) return;
      if (this.value < minDate) {
        this.value = minDate;
      } else if (this.value > maxDate) {
        this.value = maxDate;
      }
    };

    input.addEventListener('change', enforceDateValidation);
    input.addEventListener('blur', enforceDateValidation);
  });

  /* 7. Cotizador de tour -> envía la solicitud armada a WhatsApp */
  const WHATSAPP_NUMBER = '50376401181';

  function formatDateDisplay(dateValue) {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  }

  const quoteForm = document.getElementById('tour-quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      const pickup = quoteForm.pickup.value.trim();
      const destination = quoteForm.destination.value.trim();
      const dateValue = quoteForm.date.value;
      const people = quoteForm.people.value.trim();
      const notes = quoteForm.notes.value.trim();

      let message = 'Hola, quisiera cotizar un tour con los siguientes datos:\n';
      message += `📍 Punto de recogida: ${pickup}\n`;
      message += `🧭 Destino / Tour: ${destination}\n`;
      message += `📅 Fecha: ${formatDateDisplay(dateValue)}\n`;
      message += `👥 Personas: ${people}`;
      if (notes) {
        message += `\n📝 Notas: ${notes}`;
      }

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* 8. Formulario de búsqueda del hero (si existe en la página, ej. index.html) */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      const origen = document.getElementById('origen').value.trim();
      const destino = document.getElementById('destino').value.trim();
      const fecha = document.getElementById('fecha').value;
      const pax = document.getElementById('pax').value.trim();

      let message = 'Hola, quiero consultar disponibilidad para un tour:\n';
      message += `📍 Origen: ${origen}\n`;
      message += `🗺️ Destino / Tour: ${destino}\n`;
      message += `📅 Fecha: ${formatDateDisplay(fecha)}\n`;
      message += `👥 Pasajeros: ${pax}`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

});
