(function () {
  'use strict';

  /* ---------- Diccionario en inglés ---------- */
  const EN = {
    /* ===== Navegación ===== */
    "nav.inicio": "Home",
    "nav.servicios": "Services",
    "nav.cobertura": "Routes & Areas",
    "nav.tarifas": "Rates",
    "nav.tours": "Tours",
    "nav.reservar": "Book",
    "nav.contactar": "Contact",
    "nav.resenas": "Reviews",
    "nav.cotizar": "Get a quote",

    "trust.cancelacion": "Flexible cancellation",
    "trust.chofer": "Trusted local driver",
    "trust.disponibilidad": "24/7 availability across El Salvador",

    /* ===== Index ===== */
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
    "cobertura.playas.5": "Surfer shuttle (<strong>room for boards & luggage</strong>)",

    /* ===== Página de Tours ===== */
    "t.hero.badge": "Private tourist transport · Excursions and trips in El Salvador",
    "t.hero.title": 'Tours in El Salvador &amp; Private Trips <br><span class="text-lime-gradient">from Surf City, El Tunco &amp; the Airport.</span>',
    "t.hero.lead": "Explore El Salvador's most impressive destinations with a local driver and an exclusive vehicle. Custom routes to the Ruta de las Flores, volcano hikes, lakes, colonial architecture and surf beaches, with complete safety and comfort.",
    "t.hero.cta": "Build my Custom Tour",

    "t.ben.1.title": "100% Private Transport",
    "t.ben.1.desc": "Air-conditioned vehicles exclusively for you and your group.",
    "t.ben.2.title": "Flexible Itineraries",
    "t.ben.2.desc": "You decide the schedule, the stops and the time at each attraction.",
    "t.ben.3.title": "Expert Local Drivers",
    "t.ben.3.desc": "Drivers with deep knowledge of the country's best routes and destinations.",

    "t.cat.eyebrow": "Excursion catalog",
    "t.cat.title": "The Best Guided Tours and Excursions in El Salvador",
    "t.cat.desc": "Discover the natural, archaeological and cultural wonders of El Salvador, departing from your accommodation in El Tunco, El Zonte, Surf City or the airport. Choose your excursion and book via WhatsApp.",

    "t.toggle": "View details",
    "t.reserve": "Book",
    "t.includes": "What this tour includes",
    "t.pax": "Up to 4 pax",
    "t.veh": "Private vehicle",
    "t.veh.ac": "Private air-conditioned vehicle",
    "t.cta": "Check availability and prices",
    "t.price.custom": "Custom price",

    "t.dur.full8": "Full day (8-10 hrs)",
    "t.dur.full": "Full day",
    "t.dur.halfOrFull": "Half day / Full day",
    "t.dur.half45": "Half day (4-5 hrs)",
    "t.dur.half": "Half day",
    "t.dur.flex": "Flexible schedule",

    "t.1.title": "Ruta de las Flores Tour from El Tunco",
    "t.1.summary": "Visit the colonial towns of Juayúa, Ataco and Apaneca. Enjoy highland coffee trails, local cuisine, art murals and dreamy waterfalls.",
    "t.1.li1": "Private round-trip transport from your hotel in Surf City or El Tunco",
    "t.1.li2": "Tour of Juayúa, Apaneca (maze and coffee) and Concepción de Ataco",
    "t.1.li3": "Local driver with food and cultural recommendations",
    "t.1.li4": "Free time for handicraft shopping and coffee tasting",

    "t.2.title": "Santa Ana Volcano & Lake Coatepeque Tour",
    "t.2.summary": "Climb El Salvador's highest volcano (Ilamatepec) to see its emerald crater lake, and end the afternoon with lunch and views of Lake Coatepeque.",
    "t.2.li1": "Direct transfer to Los Volcanes National Park (Cerro Verde)",
    "t.2.li2": "Waiting time during the guided hike to the crater",
    "t.2.li3": "Transfer to restaurants and viewpoints at Lake Coatepeque",
    "t.2.li4": "Safe return to your hotel in Surf City or San Salvador",

    "t.3.title": "Colonial Tour of Suchitoto",
    "t.3.summary": "Immerse yourself in Salvadoran history walking cobblestone streets, the iconic Santa Lucía Church, art galleries, indigo looms and Lake Suchitlán.",
    "t.3.li1": "Private round-trip transport from Surf City or San Salvador",
    "t.3.li2": "Walk through the colonial center, historic squares and art galleries",
    "t.3.li3": "Stops at panoramic viewpoints over Lake Suchitlán",
    "t.3.li4": "Flexibility for indigo workshops or a boat ride",

    "t.4.title": "Joya de Cerén Archaeological Tour",
    "t.4.summary": 'Visit the "Pompeii of the Americas", a Maya farming village buried intact under volcanic ash more than 1,400 years ago. UNESCO World Heritage Site.',
    "t.4.li1": "Private round-trip transfer from hotels in El Tunco / Surf City",
    "t.4.li2": "Time to explore the protected structures and the site museum",
    "t.4.li3": "Option to combine with the San Andrés Ruins or El Boquerón",
    "t.4.li4": "Driver at your disposal throughout the itinerary",

    "t.5.title": "El Boquerón National Park Tour",
    "t.5.summary": "Explore the crater of the San Salvador volcano covered in cloud forest, with cool trails and restaurants offering panoramic views of the capital.",
    "t.5.li1": "Private door-to-door transport (ideal for layovers)",
    "t.5.li2": "Easy walk along the viewpoints toward the crater",
    "t.5.li3": "Stops at cafés and landmark viewpoints of the Bálsamo mountain range",
    "t.5.li4": "Schedule coordinated with your departure or flight time",

    "t.6.title": "Surf City Beaches Tour: El Tunco, El Zonte & Mizata",
    "t.6.summary": "Coastal tour of El Salvador's most famous beaches. Perfect for surfing, sea caves, seafood and the best sunsets.",
    "t.6.li1": "Full tour of El Tunco, El Sunzal, El Zonte and Mizata",
    "t.6.li2": "Stops at seaside restaurants and panoramic viewpoints",
    "t.6.li3": "Safe space to carry surfboards and luggage",
    "t.6.li4": "Time set aside to enjoy the sunset on the coast",

    "t.more.text": "Want to visit another destination in El Salvador? We design custom routes: Ruta de la Paz, Gulf of Fonseca, Costa del Sol, Tamanique Waterfalls and more.",
    "t.more.btn": "Request a tour or itinerary made for me",

    "t.form.eyebrow": "Book your experience",
    "t.form.title": "Get a Quote for Your Tour or Trip in El Salvador",
    "t.form.desc": "Tell us your pickup point, preferred destination, date and number of travelers. We'll send you a formal proposal and availability right away.",
    "t.form.pickup": "Pickup location",
    "t.form.pickup.ph": "E.g. Hotel in El Tunco, El Zonte, San Salvador or Airport...",
    "t.form.dest": "Tour or Tourist Destination",
    "t.form.dest.select": "Select your destination",
    "t.form.opt.1": "Ruta de las Flores Tour (Juayúa, Ataco, Apaneca)",
    "t.form.opt.2": "Santa Ana Volcano & Lake Coatepeque Tour",
    "t.form.opt.3": "Colonial Tour Suchitoto & Lake Suchitlán",
    "t.form.opt.4": "Joya de Cerén Archaeological Tour",
    "t.form.opt.5": "El Boquerón National Park Tour",
    "t.form.opt.6": "Surf City Beaches Tour (El Tunco, El Zonte, Mizata)",
    "t.form.opt.7": "Other custom tourist destination",
    "t.form.date": "Planned date",
    "t.form.people": "Number of passengers",
    "t.form.people.ph": "E.g. 2 people",
    "t.form.notes": "Additional details (optional)",
    "t.form.notes.ph": "E.g. We're bringing surfboards, we'd like a lunch stop, kids on board, etc.",
    "t.form.submit": "Request quote via WhatsApp",

    "t.faq.eyebrow": "Common questions",
    "t.faq.title": "Frequently Asked Questions about Trips and Tours in El Salvador",
    "t.faq.desc": "We answer the most common questions about logistics, safety and bookings for your vacation.",
    "t.faq.1.q": "What are the best tours and places to visit in El Salvador?",
    "t.faq.1.a": "El Salvador's top attractions include the <strong>Ruta de las Flores</strong> (colonial towns, coffee plantations and waterfalls), the hike to the <strong>Santa Ana Volcano</strong> crater alongside <strong>Lake Coatepeque</strong>, the colonial historic center of <strong>Suchitoto</strong>, the Maya site <strong>Joya de Cerén</strong> and the internationally renowned beaches of <strong>Surf City</strong>.",
    "t.faq.2.q": "Do tourist tours in El Salvador include private transport?",
    "t.faq.2.a": "Yes. All our services are 100% private: we assign you an exclusive air-conditioned vehicle and a local driver from the moment we leave your hotel in El Tunco, Surf City, San Salvador or the airport until your return. You won't share the vehicle with strangers.",
    "t.faq.3.q": "How long does a full-day excursion or tour last?",
    "t.faq.3.a": "Full-day excursions (like the Ruta de las Flores or the Santa Ana Volcano) usually last between 8 and 10 hours. Since the tour is private, you set the pace of stops, photos and meals.",
    "t.faq.4.q": "Can I book a tour during a layover at El Salvador Airport?",
    "t.faq.4.a": "Yes. If you have a layover of 5 hours or more at San Óscar Arnulfo Romero International Airport (SAL), we can pick you up to visit El Boquerón Volcano, the Historic Center or enjoy seafood at the La Libertad beaches before your next flight.",
    "t.faq.5.q": "How are payment and tour confirmation handled?",
    "t.faq.5.a": "The process is simple and fast via WhatsApp (+503 7640-1181). We send you a quote based on your group and date; once accepted, your booking is scheduled with an assigned driver and vehicle.",

    "t.map.title": 'Base of Operations in <span class="text-lime">Surf City El Salvador</span>',
    "t.map.desc": "A strategic departure point to connect with any tourist attraction in the country.",

    "t.footer.about": "Leading company in private tours, excursions and tourist transport in El Salvador. Service available 24/7 for airport transfers, Surf City beaches and national routes.",
    "t.footer.tours": "Excursions & Tours",
    "t.footer.l1": "Ruta de las Flores Tour",
    "t.footer.l2": "Santa Ana Volcano & Coatepeque Tour",
    "t.footer.l3": "Suchitoto Colonial Tour",
    "t.footer.l4": "Joya de Cerén Archaeological Tour",
    "t.footer.l5": "Surf City Beaches Tour",
    "t.footer.tagline": "Tours and Trips in El Salvador."
  };

  const META = {
    index: {
      es: {
        title: 'Taxi Surfcity Lainez | Aeropuerto SAL y Surf City 24/7',
        description: 'Taxi privado 24/7 en El Salvador: traslados desde el Aeropuerto SAL a San Salvador, Surf City, El Tunco y El Zonte. Reserva por WhatsApp.'
      },
      en: {
        title: 'Taxi Surfcity Lainez | SAL Airport & Surf City 24/7',
        description: 'Private 24/7 taxi in El Salvador: transfers from SAL Airport to San Salvador, Surf City, El Tunco and El Zonte. Book via WhatsApp.'
      }
    },
    tours: {
      es: {
        title: 'Tours en El Salvador y Viajes Privados | Surf City y El Tunco',
        description: 'Descubre los mejores tours y viajes por El Salvador con transporte privado. Excursiones a Ruta de las Flores, Volcán de Santa Ana, Suchitoto y playas. ¡Cotiza!'
      },
      en: {
        title: 'Tours in El Salvador & Private Trips | Surf City & El Tunco',
        description: 'Discover the best tours and trips in El Salvador with private transport. Excursions to Ruta de las Flores, Santa Ana Volcano, Suchitoto and beaches. Get a quote!'
      }
    }
  };

  const STORAGE_KEY = 'lang';
  const btn = document.getElementById('langToggle');
  const label = document.getElementById('langLabel');
  if (!btn) return;
  const page = document.documentElement.dataset.page === 'tours' ? 'tours' : 'index';

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  }

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

    // Estado general y metadatos de la página
    const meta = META[page][lang];
    document.documentElement.lang = lang;
    document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[property="og:locale"]', lang === 'en' ? 'en_US' : 'es_SV');
    setMeta('meta[name="twitter:title"]', meta.title);
    setMeta('meta[name="twitter:description"]', meta.description);
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