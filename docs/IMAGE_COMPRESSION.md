# Image compression strategy and size estimation

Resumen breve:

-   Se implementó compresión en la app móvil (usando `expo-image-manipulator`) antes de subir.
-   En el backend (microservicio `apps/media`) el límite por archivo se aumentó de 5 MB a 10 MB.

Decisiones y parámetros por defecto

-   Calidad (compress): 0.75 (75%)
-   Max width: 1920px (se redimensiona solo si la imagen es más grande)

¿Por qué aumentar el límite a 10MB?

-   Aunque la app comprimirá la mayoría de imágenes, no siempre será posible reducir imágenes muy grandes
    (por ejemplo RAW, imágenes de cámara de alta resolución) por debajo de 5MB sin pérdida severa.
-   10MB da margen para archivos que no pudieron comprimirse lo suficiente desde el dispositivo.

Estimación del tamaño final (modelo simple)

-   Si la imagen original es `S_original` y la app aplica una compresión con factor `q` (por ejemplo 0.75),
    un estimador conservador del tamaño final es:

    S_final ≈ S_original _ q _ r

    Donde `r` es un factor de reducción por redimensionado (0 < r ≤ 1). Si no se redimensiona, r ≈ 1.

Ejemplos:

-   Imagen original 12 MB, q = 0.75, no resize (r=1): S_final ≈ 9 MB → supera 5MB, entra en 10MB
-   Imagen 12 MB, q = 0.6, resize -> r = 0.5: S_final ≈ 3.6 MB → entra en 5MB

Recomendación práctica

-   En mobile: usar calidad 0.7-0.8 y maxWidth 1280-1920 para balancear calidad/tamaño.
-   Mantener el límite del backend en 10 MB para casos extremos.
-   Loggear en server el tamaño original y final cuando haya rechazos por tamaño para ajustar parámetros.

Cómo probar localmente

1. Instalar dependencia en `apps/mobile`: `pnpm install` o `npm install` dentro de esa carpeta.
2. Levantar la app y seleccionar imágenes grandes; la app comprimirá antes de enviar.
3. En el backend, revisar `apps/media/uploads` y logs para confirmar tamaños y rechazos.

Notas de implementación

-   Mobile: `apps/mobile/services/media.ts` usa `expo-image-manipulator` y `expo-file-system`.
-   Backend: `apps/media/src/middleware/upload.ts` aumentó `MAX_FILE_SIZE` a 10MB.

Si queréis, puedo:

-   Ajustar la calidad por entidad (por ejemplo fotos de perfil diferente a publicaciones).
-   Implementar una estimación previa en el cliente (calcular tamaño aproximado antes de subir y mostrar aviso).

Fin.
