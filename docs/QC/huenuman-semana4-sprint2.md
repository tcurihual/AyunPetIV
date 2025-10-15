# 📝 Resumen Control de Calidad

---

## 1. Verification Codes
- **Problemas:** Límite insuficiente en campo `code`, validación no actualizaba usuario, validaciones Zod en controlador.
- **Soluciones:** Se aumentó el límite en BD, se actualiza el usuario al validar, y las validaciones Zod se movieron a middlewares.
- **Pruebas:** Creación, validación y obtención de códigos, incluyendo casos positivos y negativos.

## 2. News
- **Problemas:** Verificaciones de role duplicadas, creator_id enviado desde cliente, error 401 por falta de headers en media, nombre de imagen para DELETE no claro.
- **Soluciones:** Roles y autenticación solo en middlewares, creator_id desde usuario autenticado, headers propagados correctamente, y nombre de imagen para DELETE extraído del campo `url`.
- **Pruebas:** CRUD de noticias con imágenes, eliminación selectiva y total, validado con Thunder Client/Postman.

## 3. Adoption Requests
- **Problemas:** Requester y post_owner manipulables desde cliente, sin validación de propiedad en update/delete.
- **Soluciones:** IDs desde usuario autenticado y BD, validaciones de propiedad en update/delete.
- **Pruebas:** Creación, actualización y eliminación de solicitudes, asegurando permisos correctos.

---

Cada módulo incluye análisis de endpoints, problemas detectados, soluciones aplicadas, cambios realizados y pruebas con casos positivos/negativos. Se documentan vulnerabilidades corregidas, mejoras de seguridad y cumplimiento de reglas del proyecto.

---

## API

## 🔍 Análisis de Endpoints

| Método | Ruta | Autenticación | Roles | Descripción |
|--------|------|---------------|-------|-------------|
| POST | `/verification-codes` | Sí | Cualquier usuario autenticado | Crear código de verificación |
| POST | `/verification-codes/validate` | No | Público | Validar código |
| GET | `/verification-codes/user/:userId` | Sí | Admin o propio usuario | Obtener códigos de usuario |

---

## Problemas
### 1. Campo `code` con límite insuficiente en BD

**Ubicación:** Base de datos - Tabla `verification_code`

**Problema:**
El campo `code` en la tabla `verification_code` tenía un límite de `VARCHAR(50)`, pero el controlador guarda códigos hasheheados con bcrypt que generan ~60 caracteres.

**Error obtenido:**
```json
{
  "message": "Error al crear el código de verificación",
  "type": "error",
  "data": {
    "error": {
      "code": "22001",
      "message": "value too long for type character varying(50)"
    }
  }
}
```

**Causa:**
- Código generado: 6 dígitos (ej: "123456")
- Código hasheado con bcrypt: ~60 caracteres
- Límite de BD: 50 caracteres ❌

**Solución aplicada:**
```sql
ALTER TABLE verification_code 
ALTER COLUMN code TYPE VARCHAR(255);
```

Permitiendo asi la creacion de codigos.

### 2. Validación de código no actualiza usuario 

**Ubicación:** `apps/entities/src/controllers/verificationCode.ts` - Función `validateVerificationCode()`

**Problema:**
El endpoint `/validate` verificaba el código correctamente pero NO actualizaba el estado del usuario. Esto significa que aunque el código fuera válido, el usuario permanecía sin verificar en la base de datos.

**Código ANTES:**
```typescript
// Solo marca el código como usado
const { error: updateError } = await supabase
    .from("verification_code")
    .update({ used: true })
    .eq("id", codeRecord.id)

return AppResponse(res, 200, "Código de verificación validado correctamente", {
    id: codeRecord.id,
    type: codeRecord.type,
    user_id: codeRecord.user_id,
    validated_at: new Date().toISOString(),
})
```

**Solución aplicada:**
```typescript
// Marcar el código como usado
const { error: updateError } = await supabase
    .from("verification_code")
    .update({ used: true })
    .eq("id", codeRecord.id)

if (updateError) {
    throw new AppError(500, "Error al marcar el código como usado", { updateError })
}

// Si el tipo es "verify", actualizar el usuario como verificado
if (type === "verify") {
    const { error: userUpdateError } = await supabase
        .from("users")
        .update({ validated: true })
        .eq("id", userId)

    if (userUpdateError) {
        console.error("Error al actualizar usuario como verificado:", userUpdateError)
        throw new AppError(500, "Error al verificar el usuario", { userUpdateError })
    }
}

return AppResponse(res, 200, "Código de verificación validado correctamente", {
    id: codeRecord.id,
    type: codeRecord.type,
    user_id: codeRecord.user_id,
    validated_at: new Date().toISOString(),
    email_verified: type === "verify" ? true : undefined,
})
```

con la solucion aplicada el usuario puede verificar correctamente su cuenta.

### 3. Validaciones Zod en controlador

**Ubicación:** `apps/entities/src/controllers/verificationCode.ts`

**Problema:**
El controlador tenía validaciones con Zod directamente en el código, lo cual va contra la regla del proyecto: **"evitar implementar validaciones con zod en los controladores"**.

**Schemas encontrados en el controlador:**
```typescript
// ❌ ANTES - Schemas Zod DENTRO del controlador
const CreateVerificationCodeSchema = z.object({...})
const ValidateVerificationCodeSchema = z.object({...})
const UserIdParamSchema = z.object({...})

// Uso directo en las funciones del controlador
const validatedBody = CreateVerificationCodeSchema.parse(req.body)
```

**Solución aplicada:**
Movidas las validaciones Zod a middlewares usando el sistema de validación existente:

**1. Creado archivo de schemas separado:**
```typescript
// ✅ apps/entities/src/middleware/verificationCode.ts
import { z } from "zod"

export const createVerificationCodeR = z.object({
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number().optional(),
    duration: z.number().min(1).max(1440).optional(),
})

export const validateVerificationCodeR = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos"),
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number(),
})

export const userIdParamR = z.object({
    userId: z.string().transform((val) => parseInt(val, 10)),
})
```

**2. Actualizado el controlador (limpio, sin validaciones):**
```typescript
// ✅ DESPUÉS - Controlador SIN validaciones Zod
export const createVerificationCode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { type, userId, duration } = req.body
        const targetUserId = userId || req.user.id
        // ... lógica de negocio solamente
    }
}

export const validateVerificationCode = async (req: Request, res: Response) => {
    try {
        const { code, type, userId } = req.body
        // ... lógica de negocio solamente
    }
}
```

**3. Aplicados middlewares en las rutas:**
```typescript
// ✅ apps/entities/src/routes/verificationCode.ts
import { validateBody, validateParams } from "../middleware/validation"
import {
    createVerificationCodeR,
    validateVerificationCodeR,
    userIdParamR,
} from "../middleware/verificationCode"

// Middlewares aplicados ANTES de los controladores
router.post("/", requireAuth, validateBody(createVerificationCodeR), createVerificationCode)
router.post("/validate", validateBody(validateVerificationCodeR), validateVerificationCode)
router.get("/user/:userId", requireAuth, validateParams(userIdParamR), getUserVerificationCodes)
```

**Resultado:**
- ✅ Schemas Zod movidos a archivo separado
- ✅ Controladores limpios, solo lógica de negocio
- ✅ Validaciones aplicadas en middlewares (capa correcta)
- ✅ Cumple con la regla del proyecto


---

## ✅ Validaciones Realizadas

### Middlewares Aplicados
✅ **requireAuth:** Aplicado en POST crear y GET user/:userId  
✅ **Endpoint público:** POST /validate no requiere autenticación (correcto)  
✅ **validateBody:** Aplicado en POST crear y POST validate  
✅ **validateParams:** Aplicado en GET user/:userId

### Validaciones con Middlewares (Zod fuera de controladores)
✅ **Schemas Zod movidos a archivo separado:** `middleware/verificationCode.ts`  
✅ **Controladores limpios:** Sin validaciones, solo lógica de negocio  
✅ **Validaciones en capa correcta:** Aplicadas como middlewares en rutas  
✅ **Uso del sistema existente:** `validateBody()` y `validateParams()`

### Seguridad
✅ Códigos hasheados con bcrypt antes de guardar  
✅ Comparación segura con `comparePassword()`  
✅ Códigos de 6 dígitos numéricos aleatorios  
✅ Expiración por tipo (verify: 30min, reset: 15min, adoption: 24h)  
✅ Invalidación automática de códigos anteriores al crear uno nuevo  
✅ Marcado como usado después de validar

---

## 🔧 Cambios Realizados

### Base de Datos
1. **Tabla `verification_code`**
   - ✅ Campo `code` aumentado de VARCHAR(50) a VARCHAR(255)

### Archivos Modificados
1. **`apps/entities/src/controllers/verificationCode.ts`**
   - ✅ Agregada actualización de usuario a `validated: true` cuando type="verify"
   - ✅ Agregado campo `email_verified` en respuesta de validación
   - ✅ **Eliminadas todas las validaciones Zod del controlador**
   - ✅ Controlador simplificado, solo lógica de negocio

2. **`apps/entities/src/middleware/verificationCode.ts`** (NUEVO)
   - ✅ Creado archivo con los 3 schemas de validación Zod
   - ✅ Schemas exportados: `createVerificationCodeR`, `validateVerificationCodeR`, `userIdParamR`

3. **`apps/entities/src/routes/verificationCode.ts`**
   - ✅ Importados middlewares `validateBody` y `validateParams`
   - ✅ Importados schemas desde `middleware/verificationCode`
   - ✅ Aplicados middlewares de validación en cada ruta

---

## 🧪 Pruebas Realizadas con Thunder Client

### ✅ Casos Positivos Probados

**1. POST /verification-codes - Crear código**
- ✅ Request con type="verify" → Código creado correctamente
- ✅ Respuesta incluye código sin hashear (solo desarrollo)
- ✅ Duración personalizada funciona correctamente

**2. POST /verification-codes/validate - Validar código**
- ✅ Código válido → Validación exitosa
- ✅ Usuario actualizado a `validated: true` ✨ (nuevo)
- ✅ Código marcado como `used: true`

**3. GET /verification-codes/user/:userId - Obtener códigos**
- ✅ Obtiene lista de códigos del usuario
- ✅ Muestra estado `used` (true/false)
- ✅ Incluye fechas de creación y expiración
- ✅ NO expone el código hasheado (seguro)

### ❌ Casos Negativos Probados

- ✅ Código incorrecto → 400 "Código de verificación inválido"
- ✅ Código expirado → 400 "El código de verificación ha expirado"
- ✅ Tipo inválido → 400 "Tipo de verificación inválido"
- ✅ Sin autenticación en crear → 401 Unauthorized

---

# 📰 Módulo NEWS

## 🔍 Análisis de Endpoints

| Método | Ruta | Autenticación | Roles | Descripción |
|--------|------|---------------|-------|-------------|
| GET | `/news` | No | Público | Obtener todas las noticias |
| GET | `/news/:id` | No | Público | Obtener noticia específica |
| POST | `/news` | Sí | 19 (Admin), 21 (Shelter) | Crear noticia con imágenes |
| PUT | `/news/:id` | Sí | 19 (Admin), 21 (Shelter) | Actualizar noticia |
| DELETE | `/news/:id` | Sí | 19 (Admin), 21 (Shelter) | Eliminar noticia |
| DELETE | `/news/:id/images` | Sí | Solo creador | Eliminar imágenes específicas |

---

## Problemas

### 1. Verificaciones de role duplicadas en controlador

**Ubicación:** `apps/entities/src/controllers/news.ts`

**Problema:**
El controlador tenía validaciones manuales de role (líneas 189, 280, 355) que duplicaban la funcionalidad de los middlewares. Esto va contra la regla del proyecto: **"si en algún controlador se verifica role, eliminar el fragmento del código"**.

**Código ANTES (3 ubicaciones):**
```typescript
// ❌ updateNews (línea ~189)
if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para actualizar esta noticia")
}

// ❌ deleteNews (línea ~280)
if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para eliminar esta noticia")
}

// ❌ deleteNewsImages (línea ~355)
if (req.user.role !== 19 && existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para eliminar imágenes de esta noticia")
}
```

**Problemas identificados:**
- ✗ Lógica de roles mezclada con lógica de negocio
- ✗ Hardcoded role ID (19 = Admin)
- ✗ Duplicación de código en 3 lugares
- ✗ No considera role 21 (Shelter) que también debe tener permisos

**Solución aplicada:**

**1. Eliminadas verificaciones de role del controlador:**
```typescript
// ✅ updateNews - Solo verifica propiedad
if (existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para actualizar esta noticia")
}

// ✅ deleteNews - Solo verifica propiedad
if (existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para eliminar esta noticia")
}

// ✅ deleteNewsImages - Solo verifica propiedad
if (existingNews.creator_id !== req.user.id) {
    throw new AppError(403, "No tienes permiso para eliminar imágenes de esta noticia")
}
```

**2. Agregados middlewares en las rutas:**
```typescript
// ✅ apps/entities/src/routes/news.ts
import { requireAuth, requireRole } from "@repo/utils"

// Rutas con requireRole aplicado
router.put("/:id", requireAuth, requireRole(19, 21), upload.array("files", 10), updateNews)
router.delete("/:id", requireAuth, requireRole(19, 21), deleteNews)
router.delete("/:id/images", requireAuth, requireRole(19, 21), deleteNewsImages)
```

**Resultado:**
- ✅ Separación de responsabilidades (middlewares = roles, controlador = lógica negocio)
- ✅ Código DRY (no duplicación)
- ✅ Soporte para Admin (19) y Shelter (21)
- ✅ Verificación de propiedad permanece en controlador (lógica de negocio)

---

### 2. Creator ID enviado desde cliente (vulnerabilidad)

**Ubicación:** `apps/entities/src/controllers/news.ts` - Función `createNews()`

**Problema:**
El endpoint POST `/news` requería que el cliente enviara el `creator_id` en el body de la petición. Esto es una **vulnerabilidad de seguridad** porque un usuario malicioso podría crear noticias haciéndose pasar por otro usuario.

**Código ANTES:**
```typescript
// ❌ Toma creator_id del body (inseguro)
const newsData: Omit<News, "id" | "created_at"> = req.body

const { data: newNews, error: insertError } = await supabase
    .from("new")
    .insert([{
        title: newsData.title,
        content: newsData.content,
        creator_id: newsData.creator_id, // ❌ Viene del cliente
        // ...
    }])
```

**Riesgo:**
Un usuario con role 21 (Shelter) podría enviar:
```json
{
  "title": "Noticia falsa",
  "content": "...",
  "creator_id": 123  // ⚠️ ID de otro usuario
}
```

**Solución aplicada:**
```typescript
// ✅ Usa el ID del usuario autenticado
const creator_id = req.user.id

const { data: newNews, error: insertError } = await supabase
    .from("new")
    .insert([{
        title: newsData.title,
        content: newsData.content,
        creator_id, // ✅ Viene del token JWT (seguro)
        // ...
    }])
```

**Resultado:**
- ✅ Imposible falsificar el creador de una noticia
- ✅ Creator ID viene del token JWT (verificado y firmado)
- ✅ Cliente no puede manipular este campo

---

### 3. Error 401 al subir imágenes a servicio Media

**Ubicación:** Comunicación entre `apps/entities` y `apps/media`

**Problema:**
Al crear o actualizar noticias con imágenes, el servicio de **entities** hacía peticiones HTTP al servicio de **media**, pero estas fallaban con error **401 Unauthorized**.

**Error obtenido:**
```bash
media:dev: POST /uploads/news/7 401 0.218 ms - 51
entities:dev: ❌ Error al subir imágenes: {
  message: 'Request failed with status code 401',
  response: { message: 'Unauthorized', type: 'error', data: {} },
  status: 401,
  url: 'http://localhost:7000/uploads/news/7'
}
```

**Causa raíz:**
El servicio de **media** tiene un middleware global `getHeaders` que requiere los headers:
- `x-user-id`
- `x-user-role`

```typescript
// apps/media/src/index.ts
app.use(getHeaders) // ⚠️ Middleware global

// packages/utils/src/middlewares/headers.ts
export const getHeaders = (req, res, next) => {
    const userId = req.headers["x-user-id"]
    const role = req.headers["x-user-role"]

    if (userId && role) {
        req.user = { id: Number(userId), role: Number(role) }
    } else {
        throw new AppError(401, "Unauthorized") // ❌ Faltaban estos headers
    }
    next()
}
```

**Código ANTES (8 llamadas sin headers):**
```typescript
// ❌ Sin headers de autenticación
const mediaResponse = await axios.post(
    `${MEDIA_SERVICE_URL}/uploads/news/${newNews.id}`,
    formData,
    {
        headers: {
            ...formData.getHeaders(),
            // ❌ Faltan x-user-id y x-user-role
        },
    }
)
```

**Solución aplicada:**
Agregados los headers `x-user-id` y `x-user-role` en **todas las llamadas axios** al servicio media (8 ubicaciones):

```typescript
// ✅ 1. POST - Crear noticia con imágenes
const mediaResponse = await axios.post(
    `${MEDIA_SERVICE_URL}/uploads/news/${newNews.id}`,
    formData,
    {
        headers: {
            ...formData.getHeaders(),
            "x-user-id": String(req.user.id),
            "x-user-role": String(req.user.role || ""),
        },
    }
)

// ✅ 2. GET - Obtener imágenes de noticia individual
const mediaResponse = await axios.get(
    `${MEDIA_SERVICE_URL}/uploads/news/${numericId}`,
    {
        headers: {
            "x-user-id": String(req.user?.id || 0),
            "x-user-role": String(req.user?.role || ""),
        },
    }
)

// ✅ 3. GET - Obtener imágenes para lista de noticias
const mediaResponse = await axios.get(
    `${MEDIA_SERVICE_URL}/uploads/news/${news.id}`,
    {
        headers: {
            "x-user-id": String(req.user?.id || 0),
            "x-user-role": String(req.user?.role || ""),
        },
    }
)

// ✅ 4. POST - Agregar imágenes en update
// (igual que #1)

// ✅ 5. GET - Obtener imágenes en update
// (igual que #2)

// ✅ 6. GET - Obtener imágenes antes de delete
// (igual que #2)

// ✅ 7. DELETE - Eliminar imágenes en delete noticia
await axios.delete(`${MEDIA_SERVICE_URL}/uploads/news/${numericId}`, {
    data: { fileNamesArray: imagesToDelete },
    headers: {
        "Content-Type": "application/json",
        "x-user-id": String(req.user.id),
        "x-user-role": String(req.user.role || ""),
    },
})

// ✅ 8. DELETE - Eliminar imágenes específicas
// (igual que #7)
```

**Mejora adicional - Logging detallado:**
```typescript
// ✅ Mejor manejo de errores
catch (mediaError: any) {
    console.error("❌ Error al subir imágenes:", {
        message: mediaError.message,
        response: mediaError.response?.data,
        status: mediaError.response?.status,
        url: `${MEDIA_SERVICE_URL}/uploads/news/${newNews.id}`,
    })
    // ...
}
```

**Resultado:**
- ✅ Todas las peticiones a media incluyen autenticación
- ✅ Headers propagados desde el usuario autenticado
- ✅ Upload de imágenes funcionando correctamente
- ✅ Logging mejorado para debugging

---

## ✅ Validaciones Realizadas

### Middlewares Aplicados
✅ **requireAuth:** Aplicado en POST, PUT, DELETE  
✅ **requireRole(19, 21):** Aplicado en PUT /:id, DELETE /:id, DELETE /:id/images  
✅ **Endpoints públicos:** GET /news y GET /news/:id sin autenticación (correcto)  
✅ **Multer upload:** Configurado para máximo 10 imágenes por petición

### Validaciones con Middlewares
✅ **Sin validaciones Zod en controlador:** Cumple regla del proyecto  
✅ **Verificación de role en middlewares:** Separación correcta de responsabilidades  
✅ **Verificación de propiedad en controlador:** Solo lógica de negocio

### Seguridad
✅ Creator ID automático desde token JWT (no manipulable por cliente)  
✅ Headers de autenticación propagados a servicio media  
✅ Validación de propiedad antes de modificar/eliminar  
✅ Rollback automático si falla subida de imágenes (transacción)  
✅ Multer configurado con límite de tamaño (10MB por archivo)  
✅ Solo tipos MIME permitidos: image/jpeg, image/png, application/pdf

### Manejo de Imágenes
✅ Upload a servicio media separado (microservicio)  
✅ Rollback de noticia si falla upload de imágenes  
✅ Eliminación automática de imágenes al borrar noticia  
✅ Soporte para eliminar imágenes específicas  
✅ URLs de imágenes devueltas en todas las respuestas

---

## 🔧 Cambios Realizados

### Archivos Modificados

**1. `apps/entities/src/controllers/news.ts`**
   - ✅ Eliminadas 3 verificaciones manuales de role (líneas 189, 280, 355)
   - ✅ Cambiado `creator_id` para usar `req.user.id` automáticamente
   - ✅ Agregados headers `x-user-id` y `x-user-role` en 8 llamadas axios
   - ✅ Mejorado logging de errores con detalles completos

**2. `apps/entities/src/routes/news.ts`**
   - ✅ Agregado `requireRole(19, 21)` en PUT /:id
   - ✅ Agregado `requireRole(19, 21)` en DELETE /:id  
   - ✅ Agregado `requireRole(19, 21)` en DELETE /:id/images

**3. Sin cambios en base de datos**
   - ✅ Estructura de tabla `new` (noticias) correcta
   - ✅ No se requirieron migraciones

---

## 🧪 Pruebas Realizadas con Postman

### ✅ Casos Positivos Probados

**1. POST /news - Crear noticia con imágenes**
- ✅ Request con title, content y files → Noticia creada correctamente
- ✅ Imágenes subidas al servicio media exitosamente
- ✅ URLs de imágenes retornadas en respuesta
- ✅ creator_id asignado automáticamente desde token

### 🔜 Pendiente de Prueba

**2. GET /news - Obtener todas las noticias**
- Verificar que devuelve lista completa
- Verificar que incluye URLs de imágenes

**3. GET /news/:id - Obtener noticia específica**
- Verificar que devuelve noticia individual
- Verificar que incluye URLs de imágenes

**4. PUT /news/:id - Actualizar noticia**
- Con nuevas imágenes
- Solo actualizar texto
- Verificar restricción de propiedad

**5. DELETE /news/:id - Eliminar noticia**
- Verificar que elimina noticia de BD
- Verificar que elimina imágenes de media
- Verificar restricción de propiedad

**6. DELETE /news/:id/images - Eliminar imágenes específicas**
- Verificar eliminación selectiva
- Verificar restricción de propiedad

### ❌ Casos Negativos a Probar

- Sin autenticación en endpoints protegidos → 401
- Usuario sin role adecuado → 403
- Intentar modificar noticia de otro usuario → 403
- ID de noticia inexistente → 404

---

# 🤝 Módulo ADOPTION REQUESTS

## 🔍 Análisis de Endpoints

| Método | Ruta | Autenticación | Roles | Descripción |
|--------|------|---------------|-------|-------------|
| GET | `/adoption-requests` | Sí | Cualquier usuario autenticado | Obtener todas las solicitudes |
| GET | `/adoption-requests/:id` | Sí | Cualquier usuario autenticado | Obtener solicitud específica |
| POST | `/adoption-requests` | Sí | Cualquier usuario autenticado | Crear solicitud de adopción |
| PUT | `/adoption-requests/:id` | Sí | Requester o Post Owner | Actualizar solicitud |
| DELETE | `/adoption-requests/:id` | Sí | Solo Requester | Eliminar solicitud |

---

## Problemas

### 1. Requester ID manipulable desde cliente (VULNERABILIDAD CRÍTICA)

**Ubicación:** `apps/entities/src/controllers/adoptionRequest.ts` - Función `createAdoptionRequest()`

**Problema:**
El endpoint POST `/adoption-requests` permitía que el cliente enviara el `requester_id` en el body de la petición. Esto es una **vulnerabilidad de seguridad crítica** porque un usuario malicioso podría crear solicitudes de adopción haciéndose pasar por otro usuario.

**Código ANTES:**
```typescript
// ❌ Toma requester_id del body (inseguro)
const adoptionRequestData: AdoptionRequest["Insert"] = req.body

if (
    !adoptionRequestData.requester_id ||
    !adoptionRequestData.post_id ||
    !adoptionRequestData.post_owner_id
) {
    throw new AppError(400, "userid y postid son campos requeridos")
}

const payload: AdoptionRequest["Insert"] = {
    requester_id: adoptionRequestData.requester_id, // ❌ Viene del cliente
    post_id: adoptionRequestData.post_id,
    post_owner_id: adoptionRequestData.post_owner_id, // ❌ También del cliente
    status: adoptionRequestData.status || "pending",
}
```

**Riesgo:**
Un usuario malicioso podría enviar:
```json
{
  "requester_id": 123,  // ⚠️ ID de otro usuario
  "post_id": 45,
  "post_owner_id": 67
}
```

**Solución aplicada:**
```typescript
// ✅ Solo requiere post_id del cliente
const { post_id, status } = req.body

if (!post_id) {
    throw new AppError(400, "post_id es un campo requerido")
}

// ✅ Obtener el post y su owner desde la BD (no confiar en el cliente)
const { data: post, error: postError } = await supabase
    .from("post")
    .select("*")
    .eq("id", post_id)
    .single()

if (postError || !post) {
    throw new AppError(404, "Post no encontrado")
}

// ✅ Usar el ID del usuario autenticado (no confiar en el cliente)
const requester_id = req.user.id
// ✅ Obtener owner desde la BD
const post_owner_id = post.user_id || post.giver_id || post.owner_id
```

**Mejora adicional - Validación lógica:**
```typescript
// ✅ Verificar que el usuario no esté solicitando su propio post
if (requester_id === post_owner_id) {
    throw new AppError(400, "No puedes solicitar adopción de tu propio post")
}
```

**Resultado:**
- ✅ Imposible falsificar el solicitante de una adopción
- ✅ Requester ID viene del token JWT (verificado y firmado)
- ✅ Post Owner ID viene de la base de datos (confiable)
- ✅ Cliente solo envía post_id (no manipulable)
- ✅ Previene solicitudes ilógicas (auto-adopción)

---

### 2. Post Owner ID manipulable desde cliente (VULNERABILIDAD)

**Ubicación:** `apps/entities/src/controllers/adoptionRequest.ts` - Función `createAdoptionRequest()`

**Problema:**
Similar al problema anterior, el `post_owner_id` venía del cliente en lugar de consultarse desde la base de datos. Esto permitía manipulación de datos y podría causar inconsistencias.

**Código ANTES:**
```typescript
// ❌ Confía en que el cliente envíe el owner correcto
const payload: AdoptionRequest["Insert"] = {
    requester_id: adoptionRequestData.requester_id,
    post_id: adoptionRequestData.post_id,
    post_owner_id: adoptionRequestData.post_owner_id, // ❌ Del cliente
    status: adoptionRequestData.status || "pending",
}
```

**Riesgo:**
- Cliente podría enviar `post_owner_id` incorrecto
- Datos inconsistentes en la base de datos
- Notificaciones enviadas al usuario equivocado
- Estadísticas de adopción incorrectas

**Solución aplicada:**
```typescript
// ✅ Consultar el post completo desde la BD
const { data: post, error: postError } = await supabase
    .from("post")
    .select("*")
    .eq("id", post_id)
    .single()

if (postError || !post) {
    throw new AppError(404, "Post no encontrado")
}

// ✅ Extraer el owner_id del post (fuente confiable)
// Nota: Se usa fallback porque el nombre del campo puede variar
const post_owner_id = post.user_id || post.giver_id || post.owner_id

const payload: AdoptionRequest["Insert"] = {
    requester_id,
    post_id,
    post_owner_id, // ✅ Viene de la BD
    status: status || "pending",
}
```

**Resultado:**
- ✅ Post Owner ID siempre correcto (viene de la BD)
- ✅ Datos consistentes garantizados
- ✅ Notificaciones enviadas al dueño real del post
- ✅ Cliente no puede manipular este campo

---

### 3. Sin validación de propiedad en UPDATE y DELETE (VULNERABILIDAD)

**Ubicación:** `apps/entities/src/controllers/adoptionRequest.ts` - Funciones `updateAdoptionRequest()` y `deleteAdoptionRequest()`

**Problema:**
Los endpoints PUT y DELETE no verificaban si el usuario autenticado tenía permiso para modificar o eliminar la solicitud. Esto permitía que **cualquier usuario autenticado** pudiera modificar solicitudes de adopción de otros usuarios.

**Código ANTES (UPDATE):**
```typescript
// ❌ Sin validación de propiedad
export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const updateData: AdoptionRequest["Update"] = req.body

    const { data: existingRequest, error: findError } = await supabase
        .from("adoption_request")
        .select("*")
        .eq("id", numericId)
        .single()

    if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

    // ❌ No verifica si el usuario tiene permiso
    const { data: updatedRequest, error: updateError } = await supabase
        .from("adoption_request")
        .update(updateData) // ❌ Acepta cualquier campo del cliente
        .eq("id", numericId)
        .select()
        .single()
    // ...
}
```

**Código ANTES (DELETE):**
```typescript
// ❌ Sin validación de propiedad
export const deleteAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const { data: existingRequest, error: findError } = await supabase
        .from("adoption_request")
        .select("id") // ❌ Solo consulta ID, no los campos necesarios
        .eq("id", numericId)
        .single()

    if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

    // ❌ No verifica si el usuario tiene permiso
    const { error: deleteError } = await supabase
        .from("adoption_request")
        .delete()
        .eq("id", numericId)
    // ...
}
```

**Riesgo:**
- Cualquier usuario podría cambiar el estado de solicitudes ajenas
- Usuarios podrían eliminar solicitudes de otros
- Modificación de campos críticos (requester_id, post_id, etc.)

**Solución aplicada (UPDATE):**
```typescript
// ✅ Con validación de propiedad
export const updateAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { status } = req.body // ✅ Solo acepta status

    const { data: existingRequest, error: findError } = await supabase
        .from("adoption_request")
        .select("*") // ✅ Consulta todos los campos
        .eq("id", numericId)
        .single()

    if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

    // ✅ Verificar propiedad: solo el solicitante o el dueño del post pueden modificar
    if (
        existingRequest.requester_id !== req.user.id &&
        existingRequest.post_owner_id !== req.user.id
    ) {
        throw new AppError(
            403,
            "No tienes permiso para actualizar esta solicitud de adopción"
        )
    }

    // ✅ Solo actualiza campos permitidos
    const payload: AdoptionRequest["Update"] = {
        status: status || existingRequest.status,
        updated_at: new Date().toISOString(),
    }

    const { data: updatedRequest, error: updateError } = await supabase
        .from("adoption_request")
        .update(payload)
        .eq("id", numericId)
        .select()
        .single()
    // ...
}
```

**Solución aplicada (DELETE):**
```typescript
// ✅ Con validación de propiedad
export const deleteAdoptionRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const { data: existingRequest, error: findError } = await supabase
        .from("adoption_request")
        .select("*") // ✅ Consulta todos los campos
        .eq("id", numericId)
        .single()

    if (findError) throw new AppError(404, "Solicitud de adopción no encontrada")

    // ✅ Verificar propiedad: solo el solicitante puede eliminar su solicitud
    if (existingRequest.requester_id !== req.user.id) {
        throw new AppError(
            403,
            "No tienes permiso para eliminar esta solicitud de adopción"
        )
    }

    const { error: deleteError } = await supabase
        .from("adoption_request")
        .delete()
        .eq("id", numericId)
    // ...
}
```

**Reglas de permiso implementadas:**

**UPDATE:**
- ✅ Requester puede actualizar su solicitud
- ✅ Post owner puede actualizar (aprobar/rechazar solicitud)
- ❌ Otros usuarios no pueden modificar

**DELETE:**
- ✅ Solo el Requester puede eliminar su propia solicitud
- ❌ Post Owner NO puede eliminar (debe rechazar, no borrar)
- ❌ Otros usuarios no pueden eliminar

**Resultado:**
- ✅ Solo usuarios autorizados pueden modificar solicitudes
- ✅ Solo requester puede eliminar su solicitud
- ✅ Owner del post puede aprobar/rechazar pero no borrar
- ✅ Previene manipulación de solicitudes ajenas
- ✅ Solo se permite actualizar el campo `status`

---

## ✅ Validaciones Realizadas

### Middlewares Aplicados
✅ **requireAuth:** Aplicado globalmente a todas las rutas (router.use)  
✅ **Sin requireRole:** Cualquier usuario autenticado puede crear solicitudes  
✅ **Validación de propiedad en controlador:** UPDATE (requester o owner), DELETE (solo requester)

### Validaciones con Middlewares
✅ **Sin validaciones Zod en controlador:** Cumple regla del proyecto  
✅ **Sin validaciones Zod necesarias:** Endpoints simples, solo requieren post_id

### Seguridad
✅ Requester ID automático desde token JWT (no manipulable)  
✅ Post Owner ID obtenido desde BD (no manipulable)  
✅ Validación de propiedad antes de modificar/eliminar  
✅ Prevención de auto-adopción (no puedes solicitar tu propio post)  
✅ Verificación de duplicados (no múltiples solicitudes pendientes)  
✅ Validación de ID numérico en parámetros  
✅ Imágenes del post incluidas en respuestas GET

---

## 🔧 Cambios Realizados

### Archivos Modificados

**1. `apps/entities/src/controllers/adoptionRequest.ts`**

**createAdoptionRequest():**
   - ✅ Eliminado `requester_id` del body (ahora usa `req.user.id`)
   - ✅ Eliminado `post_owner_id` del body (ahora consulta desde BD)
   - ✅ Agregada consulta a tabla `post` para obtener owner
   - ✅ Agregada validación de auto-adopción
   - ✅ Solo requiere `post_id` y opcionalmente `status` del cliente

**updateAdoptionRequest():**
   - ✅ Agregada validación de propiedad (requester o post_owner)
   - ✅ Solo permite actualizar campo `status`
   - ✅ Eliminadas validaciones innecesarias de user/post existence
   - ✅ Consulta `select("*")` para obtener todos los campos necesarios

**deleteAdoptionRequest():**
   - ✅ Agregada validación de propiedad (solo requester)
   - ✅ Consulta `select("*")` en lugar de solo `select("id")`
   - ✅ Error 403 si usuario no es el solicitante

**2. `apps/entities/src/routes/adoptionRequest.ts`**
   - ✅ Sin cambios necesarios (requireAuth ya estaba aplicado globalmente)

**3. Sin cambios en base de datos**
   - ✅ Estructura de tabla `adoption_request` correcta
   - ✅ No se requirieron migraciones

---

## 🧪 Pruebas Realizadas con Postman

### ✅ Casos Positivos Probados

**1. POST /adoption-requests - Crear solicitud** ✅
- ✅ Usuario autenticado crea solicitud para un post ajeno
- ✅ Verificado que requester_id es automático (desde token JWT)
- ✅ Verificado que post_owner_id es correcto (desde BD, campo creator_id)
- ✅ Solo requiere `post_id` en el body

**2. GET /adoption-requests - Obtener todas** ✅
- ✅ Devuelve lista completa de solicitudes
- ✅ Incluye imágenes de posts asociados

**3. GET /adoption-requests/:id - Obtener específica** ✅
- ✅ Devuelve solicitud individual correctamente
- ✅ Incluye imágenes del post asociado

**4. PUT /adoption-requests/:id - Actualizar** ✅
- ✅ Requester puede actualizar su solicitud
- ✅ Post owner puede actualizar (aprobar/rechazar)
- ✅ Solo se modifica el campo status
- ✅ Validación de propiedad funcionando correctamente

**5. DELETE /adoption-requests/:id - Eliminar** ✅
- ✅ Requester puede eliminar su propia solicitud
- ✅ Validación de propiedad funcionando correctamente

### ❌ Casos Negativos a Probar

- Sin autenticación en endpoints protegidos → 401
- Usuario sin role adecuado → 403
- Intentar modificar solicitud de otro usuario → 403
- ID de solicitud inexistente → 404

---

## Pruebas y solución de endpoints News con imágenes

### 4. CRUD de Noticias con Imágenes (News)

**Ubicación:** `apps/entities/src/controllers/news.ts` y microservicio media

#### Cambios y pruebas realizadas:
- Se corrigió la propagación de headers `x-user-id` y `x-user-role` en todas las llamadas de entities a media.
- Se agregó autenticación obligatoria en las rutas GET `/news` y `/news/:id` para asegurar que el usuario esté presente y los headers sean válidos.
- Se verificó que cualquier usuario autenticado puede ver imágenes asociadas a una noticia.
- Se probó exitosamente la creación, obtención y actualización de noticias con imágenes.
- Se validó que el nombre de imagen para DELETE debe ser el nombre final guardado en el servidor (extraído del campo `url`).

#### Endpoints DELETE probados:
- **DELETE /news/:id**: Elimina la noticia y todas sus imágenes asociadas en el microservicio media.
- **DELETE /news/:id/images**: Elimina selectivamente imágenes de una noticia usando el array `fileNamesArray` con los nombres de archivo correctos.

#### Resultado:
- Todas las operaciones CRUD y de imágenes funcionan correctamente.
- Se documentó el proceso y se agregaron logs para depuración de headers en media.
- Se validó el flujo completo con Thunder Client/Postman.

### Resumen de problemas y soluciones

**Problemas encontrados:**
- Las imágenes no se mostraban al obtener noticias porque los headers de usuario no se enviaban correctamente en las peticiones GET a media.
- El middleware de media exigía los headers `x-user-id` y `x-user-role`, pero las rutas GET en entities eran públicas y no tenían usuario autenticado.
- El nombre de imagen para eliminar no era claro; debía usarse el nombre final guardado en el servidor, no el original.

**Soluciones aplicadas:**
- Se corrigió la propagación de headers en todas las llamadas a media.
- Se agregó autenticación obligatoria en las rutas GET `/news` y `/news/:id`.
- Se documentó que el nombre de imagen para DELETE debe extraerse del campo `url`.
- Se agregaron logs en el middleware de media para depuración de headers.
- Se validó todo el flujo con Thunder Client/Postman, confirmando que las imágenes se muestran y eliminan correctamente.




