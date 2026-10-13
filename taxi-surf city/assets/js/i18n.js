<script>
(function () {
  'use strict';

  /* ---------- Diccionario en inglés ---------- */
  const EN = {
    "nav.servicios": "Services",
    "nav.cobertura": "Routes & Areas",
    "nav.tarifas": "Rates",
    "nav.tours": "Tours",
    "nav.reservar": "Book",
    "nav.contactar": "Contact",

    "trust.cancelacion": "Flexible cancellation",
    "trust.chofer": "Trusted local driver",
    "trust.disponibilidad": "24/7 availability across El Salvador",

    "hero.index.title": 'Taxis in El Salvador 24/7: Airport Transfers, <br><span class="text-lime-gradient">Surf City, San Salvador &amp; Tours.</span>',
    "hero.index.lead": 'Your leading <strong>taxi and private transport service in El Salvador</strong>. Ride with <strong>Taxi Surfcity Lainez</strong>: transfers from <strong>El Salvador International Airport (SAL)</strong> to San Salvador, El Tunco, El Zonte, hotels and tourist routes 24/7.',
    "hero.index.cta": "Book my Taxi Now",

    "servicios.eyebrow": "Our 24/7 services",
    "servicios.title": "Taxi Service in El Salvador, Airport & VIP Transport",
    "servicios.subtitle": "Nationwide coverage with modern, air-conditioned vehicles and professional drivers across the country.",

    "servicio.aeropuerto.title": "El Salvador Airport Taxis (SAL)",
    "servicio.aeropuerto.desc": "Punctual pickup at El Salvador International Airport (Comalapa). We take you directly and safely to San Salvador, Surf City, El Tunco, Costa del Sol or anywhere in the country, 24 hours a day.",
    "servicio.aeropuerto.link": "Book airport taxi",

    "servicio.tunco.title": "Taxis in Surf City, El Tunco & San Salvador",
    "servicio.tunco.desc": "Need to get between San Salvador and the La Libertad beaches? We're your trusted taxi in El Tunco, El Zonte, El Sunzal, Santa Tecla and Zona Rosa. Safe rides by day and late at night.",
    "servicio.tunco.link": "Order my taxi now",

    "servicio.tours.title": "Tourist Transport & Guided Tours",
    "servicio.tours.desc": "Explore all of El Salvador with a private driver: Ruta de las Flores, Lake Coatepeque, Ilamatepec Volcano, San Salvador's Historic Center and private trips to Guatemala and Honduras.",
    "servicio.tours.link": "See all tours",

    "tarifas.eyebrow": "Transparency & Safety",
    "tarifas.title": 'Estimated Rates for <span class="text-lime-gradient">Popular Transfers</span>',
    "tarifas.subtitle": "Fair prices with no hidden fees. Rates may vary slightly depending on night hours or number of passengers."
    // ...agrega aquí el resto de tus claves data-i18n
  };

  const STORAGE_KEY = 'lang';
  const btn = document.getElementById('langToggle');
  const label = document.getElementById('langLabel');
  if (!btn) return;

  /* ---------- Guardar el español original desde el HTML ---------- */
  const ES = {};
  const ES_PLACEHOLDER = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    ES[el.dataset.i18n] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    ES_PLACEHOLDER[el.dataset.i18nPlaceholder] = el.getAttribute('placeholder');
  });

  /* ---------- Funciones ---------- */
  function getLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch (e) {}
    // Primera visita: usar el idioma del navegador
    return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  }

  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function translate(key, lang) {
    return lang === 'en' ? EN[key] : ES[key];
  }

  function applyLang(lang) {
    // Textos
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const txt = translate(el.dataset.i18n, lang);
      if (txt !== undefined) el.innerHTML = txt; // si falta la clave, se deja como está
    });

    // Placeholders de formularios (opcional: data-i18n-placeholder="form.nombre")
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const txt = lang === 'en' ? EN[key] : ES_PLACEHOLDER[key];
      if (txt !== undefined) el.setAttribute('placeholder', txt);
    });

    // Estado general
    document.documentElement.lang = lang;
    label.textContent = lang === 'en' ? 'ES' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    saveLang(lang);

    // Evento por si otros scripts necesitan reaccionar
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  function toggleLang() {
    applyLang(document.documentElement.lang === 'en' ? 'es' : 'en');
  }

  /* ---------- Inicio ---------- */
  btn.addEventListener('click', toggleLang);
  if (getLang() === 'en') applyLang('en');
})();
</script>