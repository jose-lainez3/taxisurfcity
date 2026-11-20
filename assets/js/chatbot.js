/* ==========================================================================
   Taxi Surfcity Lainez - Chatbot "estilo IA" (100% local, sin API de pago)
   - No usa reglas fijas de palabras clave exactas: busca en una base de
     conocimiento extraída del contenido real del sitio, con un motor de
     coincidencia por relevancia (tipo mini buscador semántico por texto).
   - Redacta respuestas combinando fragmentos relevantes, no solo une un
     texto fijo — se siente más flexible y natural.
   - Si no hay nada suficientemente relevante, ofrece WhatsApp.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "50376401181";
  var INSTAGRAM_URL = "https://www.instagram.com/transportes_lainezsurfcity/";
  var TIKTOK_URL = "https://www.tiktok.com/@taxi.surf.city.la";
  var GOOGLE_REVIEW_URL = "https://g.page/r/Cfq3QpLNeP75EBM/review";

  function waLink(text) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function extLink(url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener" style="color:#25D366;font-weight:600;text-decoration:underline;">' + label + '</a>';
  }

  var KB = [
    {
      topic: "Presentación general",
      text: "Taxi Surfcity Lainez es un servicio de transporte ejecutivo privado y seguro en El Salvador, con disponibilidad 24/7 para traslados al aeropuerto, playas y rutas turísticas. Ofrecemos taxi ejecutivo y tours guiados en Surf City.",
      keys: ["quienes son", "que es", "empresa", "servicio", "sobre ustedes", "taxi surfcity", "lainez", "presentacion"]
    },
    {
      topic: "Traslados al aeropuerto",
      text: "Hacemos traslados al Aeropuerto Internacional de El Salvador (SAL, Comalapa) hacia El Tunco, Surf City, La Libertad y San Salvador, y viceversa. Es un servicio puntual y ejecutivo, disponible las 24 horas.",
      keys: ["aeropuerto", "comalapa", "sal", "vuelo", "avion", "llegada", "salida de vuelo", "recogida aeropuerto"]
    },
    {
      topic: "Taxi en El Tunco y La Libertad",
      text: "Somos el conductor designado de confianza en Surf City, El Tunco, El Zonte y alrededores de La Libertad, ya sea para ir a cenar, de fiesta o a explorar las playas. Disponibilidad a cualquier hora.",
      keys: ["el tunco", "surf city", "el zonte", "la libertad", "playa", "taxi local", "moverme", "de fiesta", "cenar"]
    },
    {
      topic: "Tours turísticos guiados",
      text: "Ofrecemos tours privados guiados por El Salvador: Ruta de las Flores, Volcán y Lago de Coatepeque, Suchitoto, Joya de Cerén, Parque Nacional El Boquerón, y recorridos costeros por Surf City. También armamos rutas personalizadas por la Ruta de las Flores, Ruta de Paz, Costa del Sol y otros destinos que no estén en la lista.",
      keys: ["tour", "tours", "excursion", "paseo", "que hacer", "actividades", "turismo", "conocer el salvador"]
    },
    {
      topic: "Tour Ruta de las Flores",
      text: "El tour a la Ruta de las Flores recorre los pueblos de Juayúa, Ataco y Apaneca: casas coloridas, murales, café de altura y mercados de artesanías, con salida desde Surf City o El Tunco.",
      keys: ["ruta de las flores", "juayua", "ataco", "apaneca", "cafe de altura", "pueblos coloridos"]
    },
    {
      topic: "Tour Volcán y Lago de Coatepeque",
      text: "Este tour lleva hasta el punto de salida de la caminata al volcán activo más alto del país (Santa Ana) y cierra el día frente al Lago de Coatepeque. Ideal desde Surf City o El Tunco.",
      keys: ["volcan", "santa ana", "coatepeque", "lago", "caminata", "hiking", "senderismo"]
    },
    {
      topic: "Tour Suchitoto",
      text: "El tour a Suchitoto incluye calles empedradas, galerías de arte, iglesias coloniales y vistas al Lago Suchitlán. Ideal para historia, arte y buen café.",
      keys: ["suchitoto", "pueblo colonial", "lago suchitlan", "arte", "galerias"]
    },
    {
      topic: "Tour Joya de Cerén",
      text: "Joya de Cerén es conocida como la 'Pompeya de América': una aldea maya que quedó sepultada por ceniza volcánica hace más de 1,400 años. Es uno de nuestros destinos de tour.",
      keys: ["joya de ceren", "pompeya de america", "maya", "arqueologico", "ruinas"]
    },
    {
      topic: "Tour Parque Nacional El Boquerón",
      text: "A minutos de la capital, el Parque Nacional El Boquerón es un cráter cubierto de bosque nuboso con miradores hacia San Salvador. Ideal como escala desde o hacia el aeropuerto.",
      keys: ["boqueron", "crater", "bosque nuboso", "mirador", "san salvador vista"]
    },
    {
      topic: "Recorrido costero Surf City",
      text: "El recorrido costero por Surf City incluye El Tunco, El Zonte y Mizata: las playas más buscadas de la zona, con paradas para surfear, comer mariscos o ver el atardecer.",
      keys: ["surf", "playas", "mizata", "mariscos", "atardecer", "surfear"]
    },
    {
      topic: "Horarios",
      text: "Estamos disponibles las 24 horas, los 7 días de la semana, para traslados y tours.",
      keys: ["horario", "hora", "abierto", "24 horas", "disponibilidad", "domingo", "madrugada"]
    },
    {
      topic: "Reservas",
      text: "Puedes reservar directamente por WhatsApp indicando fecha, hora, punto de recogida y destino. Confirmamos disponibilidad al momento.",
      keys: ["reserva", "reservar", "agendar", "apartar", "como reservo"]
    },
    {
      topic: "Precios",
      text: "Las tarifas varían según distancia, horario y tipo de vehículo. El sitio no publica una lista de precios fija porque cada viaje se cotiza según el trayecto exacto; lo mejor es escribir por WhatsApp con el origen y destino para recibir un precio inmediato.",
      keys: ["precio", "precios", "cuanto cuesta", "tarifa", "costo", "vale", "cotizacion"]
    },
    {
      topic: "Confianza y garantías",
      text: "Ofrecemos cancelación flexible, chofer local de confianza y disponibilidad 24/7, según se destaca en el sitio.",
      keys: ["confianza", "seguridad", "cancelacion", "chofer", "conductor", "garantia"]
    },
    {
      topic: "Contacto",
      text: "Puedes contactarnos por WhatsApp al +503 7640-1181, o seguirnos en Instagram como transportes_lainezsurfcity.",
      keys: ["contacto", "telefono", "numero", "whatsapp", "instagram", "redes sociales", "escribir"]
    },
    {
      topic: "Rutas personalizadas",
      text: "Si buscas un destino que no aparece en la lista de tours, también armamos rutas personalizadas por toda la Ruta de las Flores, Ruta de Paz, Costa del Sol y más.",
      keys: ["ruta personalizada", "otro destino", "no esta en la lista", "ruta de paz", "costa del sol"]
    },
    {
      topic: "Instagram",
      text: "¡Sí! Puedes ver fotos y videos de nuestros tours y traslados en Instagram: " + extLink(INSTAGRAM_URL, "@transportes_lainezsurfcity") + ". Ahí subimos contenido de las playas, rutas y viajes con nuestros pasajeros.",
      keys: ["instagram", "ig", "insta", "fotos", "publicaciones", "redes"]
    },
    {
      topic: "TikTok",
      text: "Claro, síguenos en TikTok como " + extLink(TIKTOK_URL, "@taxi.surf.city.la") + " para ver videos de los tours, las playas de Surf City y clips de nuestros viajes.",
      keys: ["tiktok", "tik tok", "videos", "video"]
    },
    {
      topic: "Reseñas en Google",
      text: "Puedes leer las opiniones reales de nuestros pasajeros en nuestra ficha de Google, y si ya viajaste con nosotros nos encantaría que nos " + extLink(GOOGLE_REVIEW_URL, "dejaras tu reseña aquí") + ".",
      keys: ["resenas", "opiniones", "reviews", "calificacion", "comentarios", "referencias"]
    },
    {
      topic: "Vehículos y capacidad",
      text: "Contamos con vehículos cómodos y en buen estado para grupos pequeños y familias; contanos cuántas personas y maletas llevan para asignarte el vehículo adecuado. Escríbenos por WhatsApp con el número de pasajeros y equipaje.",
      keys: ["vehiculo", "carro", "auto", "van", "capacidad", "cuantas personas caben", "maletas", "equipaje", "grupo grande"]
    },
    {
      topic: "Idiomas",
      text: "Nuestros choferes pueden atenderte en español, y también nos manejamos en inglés básico para turistas extranjeros. / Our drivers can assist you in Spanish and basic English.",
      keys: ["idioma", "ingles", "english", "hablan ingles", "speak english"]
    },
    {
      topic: "Formas de pago",
      text: "Aceptamos pago en efectivo (dólares) y, según el destino, también coordinamos otras formas de pago; confírmalo directamente por WhatsApp al reservar tu viaje o tour.",
      keys: ["pago", "efectivo", "tarjeta", "dolares", "como pago", "metodo de pago"]
    },
    {
      topic: "Seguridad del viaje",
      text: "La seguridad es prioridad: choferes locales de confianza, vehículos revisados y comunicación constante por WhatsApp antes y durante el viaje para que sepas siempre con quién viajas.",
      keys: ["seguro", "seguridad", "confiable", "peligro", "es seguro"]
    },
    {
      topic: "Ubicación / base de operaciones",
      text: "Nuestra base está en Playa El Tunco, La Libertad, El Salvador. Desde ahí salimos para recogidas en hoteles de Surf City, El Tunco, El Zonte y traslados hacia el aeropuerto o cualquier tour.",
      keys: ["ubicacion", "donde estan", "direccion", "base", "punto de recogida", "donde los encuentro"]
    },
    {
      topic: "Despedida",
      text: "¡Gracias por escribirnos! Cuando quieras reservar, escríbenos por WhatsApp y con gusto te ayudamos a organizar tu viaje o tour. 🚕🌴",
      keys: ["adios", "hasta luego", "nos vemos", "chao", "bye"]
    }
  ];

  var STOPWORDS = ["el","la","los","las","de","del","un","una","unos","unas",
    "y","o","a","en","que","es","son","para","por","con","se","su","sus",
    "como","cuando","donde","cual","cuales","hay","tiene","tienen","me",
    "mi","tu","al","lo","le","les","este","esta","estos","estas","mas",
    "muy","si","no","ya","pero","porque","cuanto","cuanta","cuantos"];

  function normalize(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function tokenize(s) {
    return normalize(s)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (t) { return t.length > 1 && STOPWORDS.indexOf(t) === -1; });
  }

  function scoreEntry(entry, tokens, rawNorm) {
    var score = 0;
    var haystackKeys = entry.keys.map(normalize);
    var haystackText = normalize(entry.text + " " + entry.topic);

    haystackKeys.forEach(function (k) {
      if (rawNorm.indexOf(k) !== -1) score += k.split(" ").length * 4;
    });

    tokens.forEach(function (t) {
      haystackKeys.forEach(function (k) {
        if (k.indexOf(t) !== -1) score += 2;
      });
      if (haystackText.indexOf(t) !== -1) score += 1;
    });

    return score;
  }

  function findAnswer(msg) {
    var rawNorm = normalize(msg);
    var tokens = tokenize(msg);
    if (tokens.length === 0) return null;

    var scored = KB.map(function (entry) {
      return { entry: entry, score: scoreEntry(entry, tokens, rawNorm) };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    if (scored.length === 0) return null;

    var top = scored.slice(0, 2).map(function (x) { return x.entry; });

    if (top.length === 1) {
      return top[0].text;
    }
    return top[0].text + " Además, " + top[1].text.charAt(0).toLowerCase() + top[1].text.slice(1);
  }

  function isGreeting(msg) {
    var n = normalize(msg);
    var greetKeys = ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "que tal", "saludos"];
    return greetKeys.some(function (g) { return n.indexOf(g) !== -1; }) && n.length < 30;
  }

  function isThanks(msg) {
    var n = normalize(msg);
    return n.indexOf("gracias") !== -1;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var GREETING_REPLIES = [
    "¡Hola! 👋 Soy el asistente de <strong>Taxi Surfcity Lainez</strong>. Pregúntame sobre traslados, tours, zonas, horarios, precios o nuestras redes sociales, con tus propias palabras — te respondo con la información real del sitio.",
    "¡Buenas! 🚕 Aquí el asistente de <strong>Taxi Surfcity Lainez</strong>. Puedo contarte sobre traslados al aeropuerto, tours por El Salvador, precios o cómo seguirnos en Instagram y TikTok. ¿Qué necesitas?",
    "¡Hola, bienvenido! 🌴 Con gusto te ayudo con info sobre nuestros traslados, tours, horarios o redes sociales. Escribe tu pregunta cuando quieras."
  ];

  var THANKS_REPLIES = [
    "¡Con gusto! Si necesitas algo más, aquí estoy. También puedes escribirnos por WhatsApp para atención inmediata.",
    "¡Para eso estamos! Cualquier otra duda sobre tours, traslados o redes sociales, aquí sigo. 😊",
    "¡Gracias a ti por escribirnos! Si quieres reservar o cotizar, avísame y te paso el enlace de WhatsApp."
  ];

  var FALLBACK_REPLIES = [
    "No tengo esa información en el sitio, pero nuestro equipo puede resolver tu duda al instante por WhatsApp 👇",
    "Esa pregunta no la tengo en mi base de datos del sitio, pero te la responden al momento por WhatsApp 👇",
    "No estoy seguro de esa parte, mejor te conecto directo con el equipo por WhatsApp para que te confirmen 👇"
  ];

  var css = ""
    + ".cb-launcher{position:fixed;right:22px;bottom:92px;z-index:1199;width:56px;height:56px;border-radius:50%;"
    + "background:linear-gradient(145deg,var(--lime-green,#25D366),var(--lime-dark,#1ebe57));border:none;cursor:pointer;"
    + "box-shadow:0 10px 25px rgba(0,0,0,.5),0 0 0 rgba(37,211,102,.6);display:flex;align-items:center;justify-content:center;"
    + "color:#050505;font-size:26px;transition:transform .2s ease;animation:cbPulse 2.4s ease-in-out infinite;}"
    + ".cb-launcher:hover{transform:scale(1.08);}"
    + "@keyframes cbPulse{0%,100%{box-shadow:0 10px 25px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,.5);}50%{box-shadow:0 10px 25px rgba(0,0,0,.5),0 0 0 10px rgba(37,211,102,0);}}"
    + ".cb-window{position:fixed;right:22px;bottom:158px;z-index:1199;width:350px;max-width:calc(100vw - 32px);"
    + "height:480px;max-height:calc(100vh - 200px);background:linear-gradient(180deg,#121212,#0a0a0a);"
    + "border:1px solid #222;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.7);display:none;flex-direction:column;overflow:hidden;"
    + "font-family:'Poppins',sans-serif;}"
    + ".cb-window.cb-open{display:flex;}"
    + ".cb-header{background:linear-gradient(135deg,#25D366,#1ebe57);color:#050505;padding:14px 16px;display:flex;"
    + "align-items:center;justify-content:space-between;font-weight:600;}"
    + ".cb-header-title{display:flex;align-items:center;gap:8px;font-size:14px;}"
    + ".cb-header-sub{font-size:10.5px;font-weight:500;opacity:.75;display:block;margin-top:1px;}"
    + ".cb-header-dot{width:8px;height:8px;border-radius:50%;background:#050505;display:inline-block;flex-shrink:0;}"
    + ".cb-close{background:none;border:none;color:#050505;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;}"
    + ".cb-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#0a0a0a;}"
    + ".cb-msg{max-width:85%;padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.5;word-wrap:break-word;}"
    + ".cb-msg.bot{align-self:flex-start;background:#161616;color:#f8f9fa;border:1px solid #222;border-bottom-left-radius:4px;}"
    + ".cb-msg.user{align-self:flex-end;background:linear-gradient(135deg,#25D366,#1ebe57);color:#050505;border-bottom-right-radius:4px;}"
    + ".cb-typing{align-self:flex-start;display:flex;gap:4px;padding:10px 14px;background:#161616;border:1px solid #222;border-radius:14px;border-bottom-left-radius:4px;}"
    + ".cb-typing span{width:6px;height:6px;border-radius:50%;background:#25D366;animation:cbBlink 1.2s infinite ease-in-out;}"
    + ".cb-typing span:nth-child(2){animation-delay:.2s;}.cb-typing span:nth-child(3){animation-delay:.4s;}"
    + "@keyframes cbBlink{0%,80%,100%{opacity:.25;}40%{opacity:1;}}"
    + ".cb-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#0a0a0a;}"
    + ".cb-chip{background:#161616;border:1px solid #222;color:#e8c98a;font-size:11.5px;padding:6px 10px;border-radius:999px;cursor:pointer;transition:.15s;}"
    + ".cb-chip:hover{border-color:#25D366;color:#f8f9fa;}"
    + ".cb-inputrow{display:flex;gap:8px;padding:10px;border-top:1px solid #222;background:#121212;}"
    + ".cb-input{flex:1;background:#0a0a0a;border:1px solid #222;border-radius:999px;padding:9px 14px;color:#f8f9fa;font-size:13px;outline:none;}"
    + ".cb-input:focus{border-color:#25D366;}"
    + ".cb-send{background:linear-gradient(135deg,#25D366,#1ebe57);border:none;color:#050505;width:38px;height:38px;"
    + "border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}"
    + ".cb-wa-cta{display:inline-flex;align-items:center;gap:6px;margin-top:2px;align-self:flex-start;font-size:12px;"
    + "color:#050505;background:linear-gradient(135deg,#25D366,#1ebe57);padding:7px 12px;border-radius:999px;text-decoration:none;font-weight:600;}"
    + "@media (max-width:480px){.cb-window{right:12px;bottom:150px;width:calc(100vw - 24px);}.cb-launcher{right:14px;bottom:86px;}}";


  /* Integración IA: colores acordes al tema navideño; fuentes verificables. */
  css += ".cb-window{background:#0b2118;border:1px solid rgba(242,208,149,.35);box-shadow:0 20px 50px rgba(0,0,0,.48);}"
    + ".cb-header{background:linear-gradient(130deg,#143a29,#1b4531);color:#fff4e1;border-bottom:1px solid rgba(242,208,149,.3);}"
    + ".cb-header-dot{background:#f2d095;box-shadow:0 0 9px rgba(242,208,149,.3);}"
    + ".cb-close{color:#f7e7ce;}"
    + ".cb-body,.cb-chips{background:#0a2118;}"
    + ".cb-msg.bot,.cb-typing{background:#153528;color:#f6f1e8;border-color:rgba(242,208,149,.16);}"
    + ".cb-msg.bot{white-space:pre-wrap;}"
    + ".cb-msg.bot a{color:#f2d095;}"
    + ".cb-inputrow{background:#102c20;border-top-color:rgba(242,208,149,.22);}"
    + ".cb-input{background:#071c13;color:#fff6e8;border-color:rgba(242,208,149,.3);min-width:0;}"
    + ".cb-input:focus{border-color:#f2d095;}"
    + ".cb-chip{background:#163729;color:#f5d9a8;border-color:rgba(242,208,149,.24);}"
    + ".cb-chip:hover{border-color:#f2d095;}"
    + ".cb-sources{align-self:flex-start;max-width:92%;display:flex;gap:5px;flex-wrap:wrap;font-size:11px;margin-top:-2px;}"
    + ".cb-sources-label{width:100%;color:#ddcfaf;font-weight:650;}"
    + ".cb-source{display:inline-flex;padding:5px 8px;border:1px solid rgba(242,208,149,.32);border-radius:9px;color:#f7dfad;text-decoration:none;max-width:100%;word-break:break-word;}"
    + ".cb-disclosure{font-size:10px;padding:0 12px 9px;color:#c1d2c6;background:#102c20;line-height:1.4;}"
    + ".cb-header-actions{display:flex;align-items:center;gap:10px;}"
    + ".cb-retry,.cb-close{background:none;border:1px solid rgba(242,208,149,.28);color:#f7e7ce;border-radius:8px;cursor:pointer;min-height:28px;}"
    + ".cb-retry{font-size:13px;padding:2px 8px;}"
    + ".cb-retry:disabled{opacity:.5;cursor:wait;}"
    + ".cb-mode-detail{font-size:11px;line-height:1.4;color:#ffe7bc;background:#183529;padding:8px 13px;border-bottom:1px solid rgba(242,208,149,.18);}"
    + ".cb-mode-detail[hidden]{display:none!important;}"
    + ".cb-send:disabled{opacity:.55;cursor:wait;}"
    + "@media(prefers-reduced-motion:reduce){.cb-launcher,.cb-typing span{animation:none!important;}}";

  var styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  var launcher = document.createElement("button");
  launcher.className = "cb-launcher";
  launcher.setAttribute("aria-label", "Abrir chat de ayuda");
  launcher.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';

  var win = document.createElement("div");
  win.className = "cb-window";
  win.innerHTML =
    '<div class="cb-header">' +
      '<div class="cb-header-title"><span class="cb-header-dot"></span><span>Asistente Taxi SurfCity<span class="cb-header-sub" id="cbMode">Comprobando conexión IA...</span></span></div>' +
      '<div class="cb-header-actions"><button class="cb-retry" type="button" aria-label="Reintentar conexión de IA" title="Reintentar conexión IA">↻</button><button class="cb-close" aria-label="Cerrar chat">&times;</button></div>' +
    '</div>' +
    '<div class="cb-mode-detail" id="cbModeDetail" role="status" aria-live="polite" hidden></div>' +
    '<div class="cb-body" id="cbBody"></div>' +
    '<div class="cb-chips" id="cbChips"></div>' +
    '<div class="cb-inputrow">' +
      '<input type="text" class="cb-input" id="cbInput" placeholder="Pregúntame lo que quieras..." autocomplete="off">' +
      '<button class="cb-send" id="cbSend" aria-label="Enviar"><i class="bi bi-send-fill"></i></button>' +
    '</div>' +
    '<div class="cb-disclosure">Asistente virtual. No compartas información sensible. Las noticias y el clima en tiempo real requieren búsqueda web habilitada.</div>';

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(win);
    document.body.appendChild(launcher);

    var body = document.getElementById("cbBody");
    var chips = document.getElementById("cbChips");
    var input = document.getElementById("cbInput");
    var sendBtn = document.getElementById("cbSend");
    var modeEl = document.getElementById("cbMode");
    var aiEndpoint = typeof window.TAXISURFCITY_AI_ENDPOINT === "string" &&
      /^https:\/\//.test(window.TAXISURFCITY_AI_ENDPOINT)
        ? window.TAXISURFCITY_AI_ENDPOINT : "/api/assistant";
    var aiReady = false;
    var aiSearchEnabled = false;
    var aiCheckedAt = 0;
    var aiChecking = null;
    var aiDetail = "Verificando servicio Gemini...";
    var modeDetail = document.getElementById("cbModeDetail");
    var retryButton = win.querySelector(".cb-retry");
    var conversation = [];
    var pending = false;
    var offlineNoticeShown = false;

    function updateAIStatus(message) {
      aiDetail = message || "";
      modeEl.textContent = aiReady ? (aiSearchEnabled ? "IA conectada · búsqueda web" : "IA conectada · consultas generales") : "Modo local · sin conexión IA";
      modeDetail.hidden = aiReady;
      modeDetail.textContent = aiReady ? "" : aiDetail + " Pulsa ↻ para volver a comprobar.";
    }

    async function checkAI(force) {
      if (aiChecking) return aiChecking;
      // Renovar el diagnóstico cada 30 segundos; no dejar cacheado un fallo para siempre.
      if (!force && aiCheckedAt && Date.now() - aiCheckedAt < 30000) return aiReady;
      aiChecking = (async function() {
        retryButton.disabled = true;
        modeEl.textContent = "Comprobando Gemini...";
        var controller = new AbortController();
        var timeout = setTimeout(function() { controller.abort(); }, 10000);
        try {
          var response = await fetch(aiEndpoint, {
            method: "GET", cache: "no-store", signal: controller.signal
          });
          aiReady = false;
          if (response.status === 401 || response.status === 403) {
            aiDetail = "El servidor bloquea el acceso (HTTP " + response.status + "). Revisa Deployment Protection y permisos de Vercel.";
          } else if (response.status === 404) {
            aiDetail = "La función /api/assistant no está publicada (HTTP 404). Revisa Root Directory y Deployments en Vercel.";
          } else if (!response.ok) {
            aiDetail = "El servidor respondió con HTTP " + response.status + ". Revisa los logs de Vercel.";
          } else if (!(response.headers.get("content-type") || "").includes("application/json")) {
            aiDetail = "La dirección devuelve una página HTML en vez de la API JSON. Revisa el proyecto y sus rutas en Vercel.";
          } else {
            var result = await response.json();
            aiReady = result.ready === true;
            aiSearchEnabled = result.webSearch === true;
            aiDetail = aiReady
              ? ""
              : "La API responde, pero GEMINI_API_KEY no está configurada. Añádela a Vercel (Production) y vuelve a desplegar.";
          }
        } catch (error) {
          aiReady = false;
          aiDetail = error && error.name === "AbortError"
            ? "La API tardó demasiado en responder. Revisa que el despliegue esté en Ready."
            : "No se pudo contactar la API. Comprueba la dirección y que Vercel permita llamadas CORS desde este dominio.";
        } finally {
          clearTimeout(timeout);
          aiCheckedAt = Date.now();
          aiChecking = null;
          retryButton.disabled = false;
          updateAIStatus(aiDetail);
        }
        return aiReady;
      })();
      return aiChecking;
    }

    retryButton.addEventListener("click", function() {
      checkAI(true);
    });

    function addSources(sources) {
      if (!Array.isArray(sources) || !sources.length) return;
      var holder = document.createElement("div");
      holder.className = "cb-sources";
      var title = document.createElement("span");
      title.className = "cb-sources-label";
      title.textContent = "Fuentes consultadas:";
      holder.appendChild(title);
      sources.slice(0, 5).forEach(function(source) {
        try {
          var address = new URL(source.url);
          if (address.protocol !== "https:") return;
          var link = document.createElement("a");
          link.href = address.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "cb-source";
          link.textContent = String(source.title || address.hostname).slice(0, 60);
          holder.appendChild(link);
        } catch (_) { /* Enlace no válido. */ }
      });
      if (holder.querySelector("a")) {
        body.appendChild(holder);
        body.scrollTop = body.scrollHeight;
      }
    }

    async function askAI(message) {
      var response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: message, history: conversation.slice(-10)})
      });
      var payload = await response.json();
      if (!response.ok) {
        var error = new Error(payload.error || "El servicio no respondió.");
        error.status = response.status;
        throw error;
      }
      if (!payload.answer || typeof payload.answer !== "string") {
        throw new Error("La IA no devolvió una respuesta.");
      }
      return payload;
    }


    // Renderiza Markdown mínimo de Gemini sin insertar HTML no confiable.
    // Texto, negritas, saltos de línea, enlaces Markdown y enlaces https.
    function renderAIText(container, raw) {
      var text = String(raw || "");
      var pattern = /(\*\*[^*\n]{1,200}\*\*|\[[^\]\n]{1,120}\]\(https:\/\/[^)\s]+\)|https:\/\/[^\s<)]+|\n)/g;
      var index = 0;
      var hit;

      function addSafeLink(address, label) {
        try {
          var url = new URL(address);
          if (url.protocol !== "https:") {
            container.appendChild(document.createTextNode(label));
            return;
          }
          var link = document.createElement("a");
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = label;
          container.appendChild(link);
        } catch (error) {
          container.appendChild(document.createTextNode(label));
        }
      }

      while ((hit = pattern.exec(text)) !== null) {
        if (hit.index > index) {
          container.appendChild(document.createTextNode(text.slice(index, hit.index)));
        }
        var token = hit[0];
        if (token === "\n") {
          container.appendChild(document.createElement("br"));
        } else if (token.slice(0, 2) === "**") {
          var strong = document.createElement("strong");
          strong.textContent = token.slice(2, -2);
          container.appendChild(strong);
        } else if (token.charAt(0) === "[") {
          var split = token.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
          if (split) addSafeLink(split[2], split[1]);
          else container.appendChild(document.createTextNode(token));
        } else {
          addSafeLink(token, token);
        }
        index = hit.index + token.length;
      }
      if (index < text.length) {
        container.appendChild(document.createTextNode(text.slice(index)));
      }
    }

    function addMsg(text, who, fromAI) {
      var div = document.createElement("div");
      div.className = "cb-msg " + who;
      if (fromAI) renderAIText(div, text);
      else if (who === "user") div.textContent = text;
      else div.innerHTML = text; // Únicamente respuestas estáticas conocidas del sitio.
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }

    function showTyping() {
      var div = document.createElement("div");
      div.className = "cb-typing";
      div.id = "cbTypingIndicator";
      div.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function hideTyping() {
      var t = document.getElementById("cbTypingIndicator");
      if (t) t.remove();
    }

    function addWhatsappCta(message) {
      var a = document.createElement("a");
      a.className = "cb-wa-cta";
      a.href = waLink(message);
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = '<i class="bi bi-whatsapp"></i> Continuar por WhatsApp';
      body.appendChild(a);
      body.scrollTop = body.scrollHeight;
    }

    var suggestions = ["Tours disponibles", "Traslado aeropuerto", "¿Qué clima hace en Surf City?", "¿Qué puedo visitar en El Salvador?", "Cotizar taxi"];
    suggestions.forEach(function (s) {
      var chip = document.createElement("button");
      chip.className = "cb-chip";
      chip.type = "button";
      chip.textContent = s;
      chip.addEventListener("click", function () { handleUserMessage(s); });
      chips.appendChild(chip);
    });


    async function handleUserMessage(text) {
      if (pending || !text || !text.trim()) return;
      text = text.trim().slice(0, 1400);
      pending = true;
      sendBtn.disabled = true;
      addMsg(text, "user");
      input.value = "";
      showTyping();
      try {
        var enabled = await checkAI(false);
        if (enabled) {
          try {
            var result = await askAI(text);
            hideTyping();
            addMsg(result.answer, "bot", true);
            addSources(result.sources);
            if (!result.searchedWeb && /\b(hoy|mañana|esta semana|últimas|recientes?|noticias?|clima|pronóstico|actualmente|today|tomorrow|latest|news|weather|forecast)\b/i.test(text)) {
              addMsg("Nota: esta respuesta se generó sin consultar fuentes actuales de internet. Verifica la información antes de organizar el viaje.", "bot", true);
            }
            conversation.push({role:"user",text:text},{role:"assistant",text:result.answer.slice(0,1400)});
            conversation = conversation.slice(-10);
            return;
          } catch(error) {
            hideTyping();
            if (error.status === 429) {
              addMsg("El servicio de IA alcanzó su límite temporal de consultas. Puedes contactar al equipo por WhatsApp.", "bot", true);
              addWhatsappCta("Hola, necesito información sobre: " + text);
              return;
            }
            var statusText = error.status ? " (HTTP " + error.status + ")" : "";
            addMsg("No pude obtener respuesta de Gemini" + statusText + ": " + String(error.message || "Error de conexión") + ". No voy a presentar respuestas locales como si fueran resultados de IA. Puedes reintentar con ↻ o contactar al equipo.", "bot", true);
            addWhatsappCta("Hola, necesito ayuda con: " + text);
            return;
          }
        } else {
          hideTyping();
          if (!offlineNoticeShown) {
            addMsg("Estoy usando respuestas locales porque Gemini no está disponible: " + aiDetail + " Puedes volver a probar con el botón ↻ del encabezado.", "bot", true);
            offlineNoticeShown = true;
          }
        }
        if (isGreeting(text)) addMsg(pick(GREETING_REPLIES), "bot");
        else if (isThanks(text)) addMsg(pick(THANKS_REPLIES), "bot");
        else {
          var answer = findAnswer(text);
          if (answer) addMsg(answer, "bot");
          else {
            addMsg(pick(FALLBACK_REPLIES), "bot");
            addWhatsappCta("Hola, tengo una consulta: " + text);
          }
        }
      } catch(error) {
        hideTyping();
        addMsg("Ocurrió un problema con el asistente. Puedes escribirnos por WhatsApp.", "bot", true);
        addWhatsappCta("Hola, tengo una consulta: " + text);
      } finally {
        pending = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }

    sendBtn.addEventListener("click", function () { handleUserMessage(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleUserMessage(input.value);
    });

    launcher.addEventListener("click", function () {
      win.classList.toggle("cb-open");
      if (win.classList.contains("cb-open") && body.children.length === 0) {
        addMsg("¡Hola! Soy el asistente de Taxi SurfCity Lainez. Puedo ayudarte con taxis, tours y preguntas generales. Las consultas de internet se habilitan cuando la búsqueda web esté disponible.", "bot", true);
      }
      if (win.classList.contains("cb-open")) {
        checkAI(false);
        input.focus();
      }
    });
    win.querySelector(".cb-close").addEventListener("click", function () {
      win.classList.remove("cb-open");
    });
  });
})();
