# 🔄 Refactorización: URLs de Media a través del API Gateway

## 📋 Resumen
Se centralizaron todas las URLs de archivos media para que pasen a través del API Gateway en lugar de acceder directamente al microservicio de Media.

## ✅ Cambios Realizados

### 1. **Creado archivo centralizado** 
📁 `apps/mobile/utils/mediaUrl.ts`
- Nueva función `toMediaUrl()` que construye URLs hacia el gateway
- Reemplaza puerto `8080` → `3000` (API Gateway)
- Agrega prefijo `/v1/media/` a todas las URLs
- Maneja casos de URLs relativas y absolutas
- Usa `EXPO_PUBLIC_API_GATEWAY` o fallback según plataforma

### 2. **Actualizado servicio de media**
📁 `apps/mobile/services/media.ts`
- ✅ Removida función `getFileUrl()` duplicada (ahora usa `toMediaUrl`)
- ✅ Cambiado import de `mediaHttp` → `http` (cliente único del gateway)
- ✅ Actualizadas rutas de API:
  - `uploadMedia`: `/uploads/...` → `/v1/media/uploads/...`
  - `listMedia`: `/uploads/...` → `/v1/media/uploads/...`
- ✅ Eliminada variable obsoleta `EXPO_PUBLIC_MEDIA_BASE`

### 3. **Refactorizado Home**
📁 `apps/mobile/app/(home)/index.tsx`
- ✅ Removida función `toAbsoluteMediaUrl()` duplicada
- ✅ Importada función centralizada `toMediaUrl`
- ✅ Actualizada llamada en mapeo de pets locales

### 4. **Refactorizado Mis Publicaciones**
📁 `apps/mobile/app/(home)/my-publications.tsx`
- ✅ Removida función `toAbsoluteMediaUrl()` duplicada
- ✅ Importada función centralizada `toMediaUrl`

### 5. **Refactorizado Detalle de Publicación**
📁 `apps/mobile/app/(home)/publication/[id].tsx`
- ✅ Removida función `toAbsoluteMediaUrl()` duplicada
- ✅ Importada función centralizada `toMediaUrl`
- ✅ Actualizada construcción de URL en fetch de pet local

## 🔧 Arquitectura Antes vs Después

### ❌ ANTES (Inconsistente):
```
Mobile App
  ├─ API Calls → Gateway:3000 → Media:7000 ✅
  └─ Image URLs → Direct:8080 (❌ puerto inexistente)
```

### ✅ DESPUÉS (Centralizado):
```
Mobile App
  ├─ API Calls → Gateway:3000 → Media:7000 ✅
  └─ Image URLs → Gateway:3000 → Media:7000 ✅
```

## 📊 Estadísticas

- **Archivos modificados:** 5
- **Archivos creados:** 1
- **Funciones duplicadas eliminadas:** 3 (`toAbsoluteMediaUrl`)
- **Líneas de código reducidas:** ~30
- **Variables obsoletas removidas:** 1 (`EXPO_PUBLIC_MEDIA_BASE`)

## 🎯 Beneficios

1. ✅ **Centralización:** Todo el tráfico pasa por el gateway
2. ✅ **Consistencia:** Misma ruta para API y archivos estáticos
3. ✅ **Autenticación:** Las URLs de imágenes ahora pasan por `verifyAuth`
4. ✅ **Logging:** Todas las requests registradas en el gateway
5. ✅ **Mantenibilidad:** Función única para generar URLs
6. ✅ **DRY:** Eliminado código duplicado en 3 archivos

## 🧪 Testing Recomendado

- [ ] Verificar que las imágenes se carguen correctamente en Home
- [ ] Verificar que las imágenes se carguen en Mis Publicaciones
- [ ] Verificar que las imágenes se carguen en Detalle de Publicación
- [ ] Probar subida de archivos con `uploadMedia()`
- [ ] Probar listado de archivos con `listMedia()`
- [ ] Verificar en Android (emulador con 10.0.2.2)
- [ ] Verificar en iOS (localhost)

## ⚙️ Configuración del Gateway

El gateway ya tiene configurado el proxy para media:
```typescript
// apps/gateway/src/routes/microservices.ts
msRouter.use("/media", verifyAuth, createProxyMiddleware({
  target: `${MEDIA_URL}`,
  pathRewrite: { "^/v1/media": "" }
}))
```

## 🔗 Ejemplo de URL Generada

**Entrada:** `/uploads/pet/123/foto.jpg`  
**Salida:** `http://10.0.2.2:3000/v1/media/uploads/pet/123/foto.jpg`

**Flujo:**
1. Mobile solicita: `http://10.0.2.2:3000/v1/media/uploads/pet/123/foto.jpg`
2. Gateway recibe: `/v1/media/uploads/pet/123/foto.jpg`
3. Gateway reescribe a: `/uploads/pet/123/foto.jpg`
4. Gateway proxy a: `http://localhost:7000/uploads/pet/123/foto.jpg`
5. Media sirve el archivo estático

---

✅ **Refactorización completada exitosamente**  
⏱️ **Tiempo estimado:** 25 minutos  
📅 **Fecha:** 14 de Octubre, 2025
