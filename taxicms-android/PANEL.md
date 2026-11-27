# TaxiCMS Android — panel de administración

La aplicación incorpora una interfaz propia para Android, servida dentro del WebView exclusivamente en el documento principal del dominio del CMS. Las llamadas HTTPS a /api/login, /api/state, /api/upload y /api/publish siguen llegando al Worker de Cloudflare. No se guardan contraseñas ni tokens de GitHub en el APK. El panel requiere el Worker corregido con revisiones SHA, mantiene borradores en memoria y exige confirmar la publicación. Las fotos se sirven desde la web pública o se muestran localmente tras la subida.

## Pruebas del propietario
1. Iniciar sesión, comprobar los tours y promociones existentes.
2. Revisar vista previa de un tour, buscar por destino.
3. Crear un tour con fotografía, guardar borrador y publicar. Confirmar en la web.
4. Crear una promoción inactiva; activar y publicar; desactivar y publicar.
5. Editar los textos; comprobar la vista previa y el resultado.
6. Instalar el APK de actualización sobre la versión anterior sin desinstalar.

El APK conserva applicationId com.taxisurfcity.cms y la firma permanente de GitHub Actions. Las mejoras del panel Android requieren nueva versión de APK. El panel web en navegador no se altera.
