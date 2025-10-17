# Resumen del Control de Calidad - Semana 4 Sprint 2

**Fecha:** 15 de Octubre 2025  
**Estado:** ✅ Completado

## Errores Encontrados y Soluciones (7)

1. **Error 401 en GET /users**  
   Problema: Endpoint protegido sin middleware de autenticación.  
   Solución: Agregado `requireAuth` middleware en rutas de users.  
   Resultado: Endpoint requiere token JWT válido.

2. **Error 500 en POST /news**  
   Problema: Campo `files` no coincidía con configuración de Multer.  
   Solución: Verificado campo Multer y agregado headers de autenticación para comunicación inter-servicio.  
   Resultado: Subida de imágenes funciona correctamente.

3. **Error 500 en GET /adoption-history**  
   Problema: Campo de BD incorrecto (`createdat` en lugar de `created_at`).  
   Solución: Corregido campo en controlador de adoption history.  
   Resultado: Endpoint devuelve datos correctamente.

4. **Error 401 en GET /giverRequests**  
   Problema: Servicio entities no enviaba credenciales al servicio media.  
   Solución: Agregado headers `x-user-id` y `x-user-role` en llamadas axios.  
   Resultado: Comunicación inter-servicio autenticada.

5. **URLs de imágenes duplicadas en Postman**  
   Problema: URLs relativas causaban duplicación al concatenar con URL base.  
   Solución: Cambiado generador de URLs a absolutas (`http://localhost:7000/uploads/...`).  
   Resultado: URLs correctas sin duplicación.

6. **Imágenes no accesibles directamente**  
   Problema: Servicio media no servía archivos estáticos individuales.  
   Solución: Agregada ruta específica `/uploads/:entityType/:entityId/:filename` y reordenada configuración estática.  
   Resultado: Imágenes accesibles en navegador.

7. **Documentación OpenAPI incompleta**  
   Problema: Endpoints de questions y news no documentados.  
   Solución: Agregadas funciones de documentación completas en gateway y registradas.  
   Resultado: Documentación completa en `/v1/docs`.

## Cambios Realizados

### Servicio Entities
- Agregado middleware de autenticación en rutas.
- Corregido campo de BD en controlador.
- Agregado headers de autenticación en llamadas al media service.
- Verificado configuración de Multer.

### Servicio Media
- Agregada ruta específica para servir archivos individuales.
- Reordenada configuración estática.
- Cambiado generador de URLs a absolutas.
- Actualizado en controladores de imágenes.

### Servicio Gateway
- Agregada documentación OpenAPI completa para questions y news.
- Registradas nuevas funciones en openapi.ts.



