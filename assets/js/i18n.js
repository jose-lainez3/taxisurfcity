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
    "nav.resenas": "Reviews",

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
    "tarifas.subtitle": "Fair prices with no hidden fees. Rates may vary slightly depending on night hours or number of passengers.",

    "destacados.eyebrow": "Tourism & Excursions",
    "destacados.title": 'Discover El Salvador: <span class="text-lime-gradient">Private Tourist Transport</span>',
    "destacados.subtitle": "More than a taxi in El Salvador, we're your travel partner with custom routes to the country's most visited destinations.",
    "destacado.flores.title": "Ruta de las Flores Tour",
    "destacado.flores.desc": "Private transport to Juayúa, Ataco, Apaneca and Nahuizalco. Enjoy the best highland coffee, local food and waterfalls without worrying about driving.",
    "destacado.volcanes.title": "Volcanoes & Lake Coatepeque",
    "destacado.volcanes.desc": "Travel comfortably to Cerro Verde National Park, Santa Ana Volcano (Ilamatepec), San Salvador Volcano (El Boquerón) and Lake Coatepeque.",
    "destacado.ciudad.title": "San Salvador City Tour & Mayan Ruins",
    "destacado.ciudad.desc": "Tours of San Salvador's Historic Center, the National Library (BINAES), Puerta del Diablo and the archaeological sites of Joya de Cerén, Tazumal and San Andrés.",
    "destacados.cta": "See All Our Tours",

    "resenas.title": 'What our passengers say on <span class="text-lime-gradient">Google</span>',
    "resenas.subtitle": "Read real experiences from local and international travelers who trust our taxis and tours in El Salvador.",
    "resenas.cta.title": "Did you ride with us?",
    "resenas.cta.desc": "Your feedback helps us keep offering the best private transport and excursions in El Salvador. Rate us on Google!",
    "resenas.cta.btn": "Rate us",

    "ubicacion.index.title": 'Our Base of Operations in <span class="text-lime">Surf City, El Salvador</span>',
    "ubicacion.index.subtitle": "Strategically located in La Libertad with vehicles ready to travel to the International Airport (SAL), San Salvador and the whole country.",

    "footer.about": "24/7 taxi service in El Salvador, executive transport to the International Airport (SAL) and private tour agency in Surf City, San Salvador and across the country.",
    "footer.contacto": "Direct Contact 24/7",
    "footer.tours": "Tours & Destinations",
    "footer.tour.flores": "Ruta de las Flores",
    "footer.tour.volcan": "Coatepeque Volcano & Lake",
    "footer.tour.suchitoto": "Suchitoto",
    "footer.tour.ceren": "Joya de Cerén",
    "footer.siguenos": "Follow us",
    "footer.rights": "All rights reserved.",

    "cobertura.eyebrow": "Coverage nationwide",
    "cobertura.title": 'Main Routes for <span class="text-lime-gradient">Taxis in El Salvador</span>',
    "cobertura.subtitle": "We connect the International Airport (SAL), the capital and all the beaches with clear rates and instant booking.",

    "cobertura.aero.title": "Airport (SAL) Connections",
    "cobertura.aero.1": "Airport Taxi to <strong>San Salvador</strong> (Zona Rosa, Escalón, Historic Center)",
    "cobertura.aero.2": "Airport Taxi to <strong>El Tunco Beach & Surf City</strong>",
    "cobertura.aero.3": "Airport Taxi to <strong>El Zonte, El Sunzal & Mizata</strong>",
    "cobertura.aero.4": "Airport Taxi to <strong>Costa del Sol & La Herradura</strong>",
    "cobertura.aero.5": "Airport Taxi to <strong>Santa Ana, San Miguel & the East</strong>",

    "cobertura.playas.title": "Executive Taxis & Beaches",
    "cobertura.playas.1": "24-hour taxis in <strong>La Libertad & Surf City</strong>",
    "cobertura.playas.2": "Transfers from <strong>San Salvador to El Tunco Beach</strong>",
    "cobertura.playas.3": "Private transport to <strong>Hotels, Airbnbs & Resorts</strong>",
    "cobertura.playas.4": "Designated driver for <strong>events, dinners & nightlife</strong>",
    "cobertura.playas.5": "Surfer shuttle (<strong>room for boards & luggage</strong>)"
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

    // Placeholders de formularios
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