# Mejoras SEO y diseño navideño — Tours
Fecha: 2026-11-20

## Objetivos
Mejorar la relevancia y presentación de la página `/tours` en búsquedas, facilitar la elección de los seis recorridos y refinar el tema navideño sin cambiar precios ni reservas.

## Comprobaciones tras publicar
- Search Console → Rendimiento → Página exacta `https://taxistuncoelsalvador.com/tours`: comparar impresiones, clics, CTR y posición media antes y después.
- Search Console → Inspección de URL: comprobar versión indexada y solicitar rastreo si corresponde.
- GA4 → Páginas y pantallas / Realtime: revisar tráfico a `/tours` y eventos `tour_whatsapp_click` (clic, no reserva).
- Probar dispositivos móviles y escritorio; verificar los anclajes a cada tour.
- Usar PageSpeed Insights y Rich Results Test para validar rendimiento y JSON-LD.

Estas mejoras técnicas no garantizan posiciones ni clics; optimizar a partir de las consultas y métricas reales es esencial.

## Script Python incluido en el repositorio
El archivo [`aplicar_mejoras.py`](./aplicar_mejoras.py) permite sincronizar desde la rama `main` los cuatro archivos optimizados. Antes de reemplazar una versión local crea respaldos en `.taxisurfcity-backups/`; no altera otros archivos.

Desde PowerShell, en la raíz del proyecto:

```powershell
py aplicar_mejoras.py --check
py aplicar_mejoras.py --dry-run
py aplicar_mejoras.py
```

`--check` comprueba el proyecto local sin internet; `--dry-run` compara con GitHub sin sobrescribir; sin argumentos actualiza archivos y conserva respaldos. Si la página ya coincide con `main`, no cambia nada.

Los cambios de este paquete **ya están en la rama `main`**; no es necesario ejecutar el script para activarlos en GitHub. El despliegue del sitio depende del hosting.


## Diseño de Navidad unificado — Inicio, Tours y 404
- Las tres páginas usan la clase `site-christmas` y cargan `assets/css/christmas-unified.css` **después** de `assets/css/styllees.css`.
- La hoja adicional define los acabados verde pino/dorado/crema, botones, tarjetas, reseñas, FAQ, formularios, mapa y pie de página. Las personalizaciones específicas de Tours se conservan.
- La portada incorpora un acceso directo a Tours, traducido en `assets/js/i18n.js`.
- El script `aplicar_mejoras.py` ya incluye `index.html`, `404.html` y la nueva hoja de estilos, además de los archivos previos. Admite copiar la nueva hoja de estilos incluso si no existía antes en el proyecto local.
- Conserva los enlaces a WhatsApp, los recorridos, el CMS existente y los estilos para pantallas pequeñas.
- Verificación después del despliegue: abrir `/`, `/tours` y una ruta inexistente en escritorio y móvil, comprobar que se descarga `assets/css/christmas-unified.css?v=20261120-sitewide-1` y forzar recarga con Ctrl+Shift+R si el navegador usa caché.
