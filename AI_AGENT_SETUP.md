# Asistente IA con acceso a internet — Taxi SurfCity

Estado actual: CODIGO INTEGRADO; PENDIENTE DE CONFIGURAR UNA CLAVE PRIVADA Y DESPLEGAR LA FUNCION API.

## Funciones
- Conversación natural en español o inglés cuando Gemini está activo.
- Búsqueda pública con Google Search Grounding cuando el modelo lo considera útil.
- Muestra fuentes web cuando Google las devuelve.
- Orienta sobre taxis, tours, destinos y consultas generales.
- Mantiene un contexto breve solo en memoria del navegador.
- Si la IA no está configurada, conserva las respuestas locales y avisa que NO tiene internet.
- No realiza reservas, cobros ni envía mensajes por WhatsApp automáticamente.

## Arquitectura
- api/assistant.mjs: API serverless para Vercel, protege GEMINI_API_KEY.
- assets/js/chatbot.js: asistente visual, IA cuando esté disponible y respaldo local.
- assets/js/assistant-config.js: dirección pública configurable del backend, sin secretos.
- index.html y tours.html: cargan la configuración y el cliente actualizado.

## 1. Crear la clave Gemini
1. Entra en https://aistudio.google.com/api-keys y crea una clave API de Gemini.
2. NUNCA guardes la clave en el código HTML, en JavaScript público ni en GitHub.
3. En Vercel → Project → Settings → Environment Variables, define:
   GEMINI_API_KEY = tu_clave_privada
4. Opcional: GEMINI_MODEL = gemini-2.5-flash-lite (modelo predeterminado).
5. Vuelve a desplegar el proyecto.

## 2. Desplegar en Vercel
- Importa el repositorio jose-lainez3/taxisurfcity desde GitHub a Vercel.
- La raíz del repositorio contiene la carpeta api y no requiere dependencias adicionales para la función.
- Verifica GET https://TU-PROYECTO.vercel.app/api/assistant
- Respuesta esperada con la variable configurada: {"ready":true,"name":"Asistente IA Taxi SurfCity","webSearch":true}
- Mientras falte la variable, el resultado indicará ready:false.

IMPORTANTE: GitHub Pages NO ejecuta funciones api/*.mjs. Si el sitio actual sigue en Github Pages u otro hosting estático, se debe desplegar la función por separado en Vercel.

## 3. Conectar el frontend
Si el sitio completo y la función usan el mismo dominio Vercel, la ruta /api/assistant ya está configurada.

Si el sitio estático permanece en otro hosting, edita assets/js/assistant-config.js para dejar la URL absoluta de la función:

    window.TAXISURFCITY_AI_ENDPOINT = "https://TU-PROYECTO.vercel.app/api/assistant";

No pongas una clave API aquí.

Los orígenes https://taxistuncoelsalvador.com y https://www.taxistuncoelsalvador.com están autorizados. Para otro dominio agrega la variable privada ASSISTANT_ALLOWED_ORIGINS en Vercel con una lista separada por comas, por ejemplo https://pruebas.ejemplo.com.

## 4. Verificar
1. Reabre la web (Ctrl+Shift+R), entra en Inicio o Tours y abre el asistente flotante.
2. Su estado debe decir «IA conectada · búsqueda web». Si dice «Modo local · IA pendiente», no se ha conectado el backend.
3. Prueba «¿Cómo está el clima en Surf City esta semana?» o «¿Qué visitar en El Salvador este fin de semana?». Si el modelo usa búsqueda web, muestra fuentes.
4. Prueba «¿Cuánto cuesta el tour de Suchitoto?». La IA NO debe inventar precios; solicita cotización por WhatsApp.
5. Prueba el selector de inglés y la navegación móvil.

## Costos, seguridad y privacidad
- Las consultas que requieren IA son procesadas por el proveedor de hosting y Google Gemini. No enviar contraseñas ni datos sensibles.
- El código de Taxi SurfCity no guarda automáticamente historiales en base de datos, aunque el proveedor puede tratar las solicitudes según sus términos.
- Se limita el tamaño de cada pregunta y se hace una limitación básica por IP. En alojamiento serverless esta limitación es por instancia, NO es una protección definitiva contra abusos ni cargos.
- Para un servicio público de alto tráfico conviene configurar rate limiting persistente, anti-bots y cuotas del proveedor.
- Según la documentación vigente el 20/11/2026, Gemini 2.5 Flash-Lite permite Grounding con Google Search en el nivel gratuito hasta 500 solicitudes/día, sujeto a cuotas de modelo y región; los límites pueden cambiar.
- Una consulta respondida por IA no implica reserva, precio garantizado, acceso directo a WhatsApp ni información privada.

## Siguientes mejoras posibles
Cotizador inteligente, recomendaciones personalizadas y registro CRM, solo con una fuente real de tarifas/disponibilidad, autorización y confirmación humana antes de ejecutar operaciones.
