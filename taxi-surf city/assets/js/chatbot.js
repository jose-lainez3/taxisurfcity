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
  function waLink(text) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
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
      '<div class="cb-header-title"><span class="cb-header-dot"></span><span>Asistente Taxi Surfcity<span class="cb-header-sub">Responde con la info del sitio</span></span></div>' +
      '<button class="cb-close" aria-label="Cerrar chat">&times;</button>' +
    '</div>' +
    '<div class="cb-body" id="cbBody"></div>' +
    '<div class="cb-chips" id="cbChips"></div>' +
    '<div class="cb-inputrow">' +
      '<input type="text" class="cb-input" id="cbInput" placeholder="Pregúntame lo que quieras..." autocomplete="off">' +
      '<button class="cb-send" id="cbSend" aria-label="Enviar"><i class="bi bi-send-fill"></i></button>' +
    '</div>';

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(win);
    document.body.appendChild(launcher);

    var body = document.getElementById("cbBody");
    var chips = document.getElementById("cbChips");
    var input = document.getElementById("cbInput");
    var sendBtn = document.getElementById("cbSend");

    function addMsg(text, who) {
      var div = document.createElement("div");
      div.className = "cb-msg " + who;
      div.innerHTML = text;
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

    var suggestions = ["Precios", "Traslado aeropuerto", "Tours disponibles", "Zonas que cubren", "Reservar"];
    suggestions.forEach(function (s) {
      var chip = document.createElement("button");
      chip.className = "cb-chip";
      chip.type = "button";
      chip.textContent = s;
      chip.addEventListener("click", function () { handleUserMessage(s); });
      chips.appendChild(chip);
    });

    function handleUserMessage(text) {
      if (!text || !text.trim()) return;
      addMsg(text, "user");
      input.value = "";
      showTyping();

      var delay = 450 + Math.random() * 400;
      setTimeout(function () {
        hideTyping();

        if (isGreeting(text)) {
          addMsg("¡Hola! 👋 Soy el asistente de <strong>Taxi Surfcity Lainez</strong>. Pregúntame sobre traslados, tours, zonas, horarios o precios, con tus propias palabras — te respondo con la información real del sitio.", "bot");
          return;
        }
        if (isThanks(text)) {
          addMsg("¡Con gusto! Si necesitas algo más, aquí estoy. También puedes escribirnos por WhatsApp para atención inmediata.", "bot");
          return;
        }

        var answer = findAnswer(text);
        if (answer) {
          addMsg(answer, "bot");
        } else {
          addMsg("No tengo esa información en el sitio, pero nuestro equipo puede resolver tu duda al instante por WhatsApp 👇", "bot");
          addWhatsappCta("Hola, tengo una pregunta: " + text);
        }
      }, delay);
    }

    sendBtn.addEventListener("click", function () { handleUserMessage(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleUserMessage(input.value);
    });

    launcher.addEventListener("click", function () {
      win.classList.toggle("cb-open");
      if (win.classList.contains("cb-open") && body.children.length === 0) {
        addMsg("¡Hola! 👋 Soy el asistente de <strong>Taxi Surfcity Lainez</strong>. Puedes preguntarme lo que quieras sobre nuestros servicios, tours, zonas, horarios o precios — respondo con la información real del sitio.", "bot");
      }
      if (win.classList.contains("cb-open")) input.focus();
    });
    win.querySelector(".cb-close").addEventListener("click", function () {
      win.classList.remove("cb-open");
    });
  });
})();
