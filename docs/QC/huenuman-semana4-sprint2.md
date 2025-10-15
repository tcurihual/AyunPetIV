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
El campo `code` en la tabla `verification_code` tenía un límite de `VARCHAR(50)`, pero el controlador guarda códigos hasheados con bcrypt que generan ~60 caracteres.

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


