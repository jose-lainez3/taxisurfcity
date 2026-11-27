# TaxiCMS — tarifas, publicaciones y administración

## Worker taxicms
Cloudflare → Workers & Pages → taxicms → Settings → Variables and Secrets:
- MARKETING_PASSWORD: contraseña de marketing. Si no existe, se usa ADMIN_PASSWORD anterior como compatibilidad (no da privilegios de administrador).
- SITE_ADMIN_PASSWORD: contraseña nueva y distinta de marketing.
- SESSION_SECRET: valor aleatorio de al menos 32 caracteres. En PowerShell: `$b = New-Object byte[] 32; $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($b); $rng.Dispose(); [Convert]::ToBase64String($b) | Set-Clipboard`
- GITHUB_TOKEN: mantener como Secret; conservar las variables de repositorio y rutas existentes.
En Edit code, sustituir el código por worker.mjs de esta carpeta (copiar todo). Deploy. Cerrar las sesiones anteriores y entrar nuevamente.

## Mantenimiento
Crear namespace Workers KV TAXISURFCITY_CONTROL. Vincularla a los dos Workers taxicms y taxisurfcity con el mismo nombre SITE_CONTROL y el mismo ID.
Para despliegues Git persistentes, añadir en wrangler.jsonc raíz la propiedad `"kv_namespaces": [{"binding":"SITE_CONTROL","id":"ID_REAL_DE_LA_NAMESPACE"}]`. No utilizar un ID ficticio. Una vinculación manual puede perderse en despliegues posteriores.
La API pública /api/site-status expone hashes SHA-256 de los archivos HTML servidos y estado de mantenimiento, sin secretos. KV puede demorar en propagar cambios. El sitio devuelve 503 y Retry-After; el CMS permanece accesible. Si KV falla, la web permanece en línea. La activación se bloquea si el Worker público no está configurado. Verificar que ambos Workers compartan la misma namespace. Configurar rate limiting de /api/login en Cloudflare.

## APK
Instalar versión taxicms-v8 o superior encima de la anterior, sin desinstalar. Conserva package y firma.
Las imágenes muestran porcentaje real de transferencia y confirmación GitHub; las publicaciones usan un commit atómico y control de concurrencia. El seguimiento compara los hashes del sitio servido por Cloudflare y recarga datos. No mide un porcentaje interno de Cloudflare ni verifica todos sus centros de datos.
Historial/restauración de versiones no incluidos en esta entrega.
