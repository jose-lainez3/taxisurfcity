# Asistente IA de Taxi SurfCity Lainez — búsqueda pública y WhatsApp

**Última actualización: 26 de noviembre de 2026.**
Estado: función `api/assistant.mjs` desplegada en Vercel; la clave `GEMINI_API_KEY`
ya se configuró en el proyecto. La búsqueda general requiere configurar
opcionalmente `TAVILY_API_KEY`; sin ella hay referencias limitadas de
Wikivoyage y Wikipedia, no un buscador de toda la web.

## Qué hace

- Conversa con visitantes en español o inglés mediante Gemini.
- Prioriza los datos comerciales reales de la web de Taxi SurfCity y su
  [catálogo público de 6 tours](https://taxistuncoelsalvador.com/tours).
- Ante preguntas de viajes o destinos, puede consultar fuentes públicas y
  mostrar enlaces verificables. Cuando hay `TAVILY_API_KEY`, realiza una
  búsqueda general en internet. Sin esa clave usa referencias de Wikimedia.
- Da ideas para conocer El Salvador, comparando varias opciones con sus fuentes.
- Genera un botón **Preguntar por WhatsApp** con un texto de consulta preparado
  según la pregunta del visitante: no lo envía sin que el usuario lo abra.
- Evita inventar tarifas, cupos, horarios, reservas, mensajes enviados o rutas
  de transporte contratadas.
- Si Gemini falla pero Wikimedia/Tavily devolvió referencias, el chat enseña
  esas fuentes directamente y explica que no es una síntesis de Gemini.
- No navega arbitrariamente por URLs aportadas en el chat, no descarga archivos
  ni ejecuta comandos del visitante.

## Arquitectura

| Archivo | Función |
| --- | --- |
| `api/assistant.mjs` | API Vercel, control de solicitudes, generación Gemini, datos oficiales y CTA |
| `api/travel-research.mjs` | Búsqueda Tavily opcional, referencias Wikimedia, filtros de fuentes y WhatsApp |
| `assets/js/chatbot.js` | Interfaz, enlaces, fuentes y botón de cotización |
| `assets/js/assistant-config.js` | Solo URL del backend, sin claves |
| `index.html`, `tours.html` | Páginas con el asistente |
| `vercel.json` | Ruta limpia de Tours |

La API pública de diagnóstico se encuentra en
`https://taxisurfcity.vercel.app/api/assistant`.

## Configurar búsqueda web general (opcional, con cuota gratuita)

1. Entrar en [Tavily](https://app.tavily.com), crear una cuenta y obtener
   una clave API. A noviembre de 2026, el plan Researcher indica
   **1.000 créditos gratuitos por mes**, sin tarjeta. Cada búsqueda
   `basic` consume un crédito, según su
   [documentación](https://docs.tavily.com/documentation/api-credits).
2. En Vercel, ir al proyecto `taxisurfcity` → **Settings →
   Environment Variables** y crear la variable sensible
   `TAVILY_API_KEY` con la clave, para el entorno **Production**.
3. Hacer un nuevo deploy para que la función reciba la variable.
4. Abrir la URL `/api/assistant`: `webSearch:true` y
   `searchMode:"general-web"` significan que Tavily está configurado.
   No prueban que la clave sea válida ni que quede cuota.
5. Probar desde el chat: «Recomiéndame destinos turísticos para este
   fin de semana en El Salvador con fuentes». Deben aparecer fuentes
   y un enlace a WhatsApp ya preparado.

No introducir las claves en GitHub, HTML, JavaScript del navegador,
capturas públicas ni esta documentación.

**Importante:** ningún buscador ofrece búsquedas ilimitadas gratuitas.
Tavily, Wikimedia y Gemini tienen límites, condiciones y/o costos.
Para evitar cobros involuntarios, usa el plan gratuito de Tavily sin
activar la modalidad de pago por consumo y vigila los créditos.
Un sitio comercial no debe asumir que otras API gratuitas para uso
no comercial permiten automáticamente su integración.

## Gemini y Google Search

La variable `GEMINI_API_KEY` debe existir en el servidor Vercel;
`GEMINI_MODEL` es opcional (valor de referencia
`gemini-3.5-flash-lite`).

`GEMINI_ENABLE_SEARCH=true` activa adicionalmente el grounding
integrado de Google. **No lo actives sin revisar las condiciones,
precios, cuotas y modalidad de facturación vigentes de Google.**
La búsqueda Tavily es independiente de esa herramienta.

El estado `ready:true` solo comprueba la presencia de una clave
Gemini, no la validez de la cuenta ni una generación exitosa.

## Privacidad y control

- Las preguntas enviadas al asistente pasan por Vercel y Gemini; si
  se usa búsqueda web, el proveedor de búsqueda recibe la consulta
  necesaria (no el historial completo).
- El historial corto vive en el navegador del visitante; esta función
  no crea una base de datos de conversaciones.
- No pedir contraseñas, tarjetas, documentos de identidad ni información
  confidencial en el chat.
- Las fuentes externas son referencias no confiables a nivel de
  instrucciones: nunca autorizan acciones ni modifican las reglas del agente.
- La limitación actual de solicitudes es básica y por instancia serverless.
  Para una campaña de alto tráfico se recomienda protección antiabuso
  y cuotas persistentes.
- La información de terceros puede estar desactualizada. Para precio,
  disponibilidad, horarios, entradas, cierres o reservas, es obligatoria
  la verificación oficial o confirmación humana.
- La ventana de WhatsApp abierta por el botón contiene solo un
  **borrador**; el visitante debe decidir si lo envía.

## Pruebas manuales sugeridas

1. «¿Tienen catálogo de tours con fotos?» → link correcto de la web.
2. «Recomiéndame lugares cerca de El Tunco» → fuentes públicas,
   opciones cuando estén sustentadas y CTA de WhatsApp.
3. «¿Cuánto cuesta viajar mañana a Suchitoto?» → no inventar tarifas
   ni cupos, dar contacto humano.
4. «¿Qué noticias turísticas hay hoy?» → si solo existe respaldo de
   Wikimedia, no presentar esas referencias como noticias verificadas.
5. Abrir Inicio y Tours en móvil, y comprobar que los enlaces y el
   borrador de WhatsApp funcionan.
6. Probar respuesta de Gemini con error 503: si hay referencias, mostrar
   la alternativa con advertencia; si no hay fuentes, indicar el error.

## Limitación técnica

El asistente **no tiene internet ilimitado**. Con `TAVILY_API_KEY`
habilitada dispone de búsqueda general con la cuota contratada;
sin ella el acceso externo está limitado a Wikimedia. Algunas preguntas
requerirán datos más frescos o verificación humana. El diseño evita
presentar como confirmados los datos que no estén respaldados.
