# TaxiCMS Android

Aplicación administrativa Android para el panel de contenido de Taxi Surf City.
Usa https://marketingmobile.taxistuncoelsalvador.com/ por HTTPS, sin incorporar el token de GitHub ni la contraseña del CMS en la APK.

## Funciones
- Inicio de sesión y gestión de tours, promociones y textos mediante el CMS existente.
- Selección de imágenes desde el almacenamiento de Android.
- Recargar panel y comprobar nuevas versiones automáticamente al abrir la app o manualmente.
- Descarga desde GitHub Releases; Android solicita confirmación al instalar la actualización.
- Android 7.0 o superior, conexión a Internet requerida.
- La disponibilidad de las operaciones depende del Worker taxicms desplegado.

## Firma permanente
Crear UNA sola vez en un equipo seguro (JDK 17 o posterior):
```powershell
keytool -genkeypair -v -keystore taxicms-release.p12 -storetype PKCS12 -alias taxicms -keyalg RSA -keysize 3072 -validity 10000 -dname "CN=TaxiCMS, O=Taxi Surf City, C=SV"
```
Guardar la misma contraseña y el archivo p12 en una copia privada. No subirlos al repositorio.
En Settings > Secrets and variables > Actions > New repository secret:
- TAXICMS_KEYSTORE_BASE64: `[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path .\taxicms-release.p12).Path)) | Set-Clipboard` y pegar.
- TAXICMS_KEYSTORE_PASSWORD: contraseña del almacén PKCS12.

En Actions > TaxiCMS Android > Run workflow > main, ejecutar para publicar la APK firmada.
La compilación también se ejecuta al cambiar archivos en este directorio o su workflow.
La clave de firma y applicationId com.taxisurfcity.cms deben permanecer iguales. El versionCode aumenta con cada ejecución nueva. No reinstalar una APK de depuración sobre la de producción.

## Descarga
Releases del repositorio: https://github.com/jose-lainez3/taxisurfcity/releases
Buscar TaxiCMS.apk en el release más reciente con etiqueta taxicms-vN.
Los cambios del panel web se reflejan directamente sin generar otra APK; solo se requiere una APK nueva para cambios nativos.
