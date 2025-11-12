# CRUD Reports - Resumen de Implementación

## **Tareas Completadas**

### **Estructura Creada**

-   ✅ **Controlador**: `apps/adoptions/src/controllers/reports.ts`
-   ✅ **Rutas**: `apps/adoptions/src/routes/reports.ts`
-   ✅ **Integración**: Agregado al archivo principal `apps/adoptions/src/index.ts`

### **Funcionalidades Implementadas**

#### 1. **GET - Obtener Reportes**

-   ✅ **GET /v1/adoptions/reports**: Obtener todos los reportes
-   ✅ **GET /v1/adoptions/reports/:id**: Obtener un reporte específico
-   ✅ **Validación**: ID numérico y existencia
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Manejo de errores**: AppError y AppResponse
-   ✅ **Soporte**: getById dentro del mismo método o por parámetro

#### 2. **POST - Crear Reporte**

-   ✅ **Endpoint**: `POST /v1/adoptions/reports`
-   ✅ **Validaciones**:
    -   `userId` requerido y debe existir en `users`
    -   `postId` o `messageId` requerido (pero no ambos)
    -   `postId` opcional o `null` (FK -> `post.id`)
    -   `messageId` opcional o `null` (FK -> `message.id`)
    -   `description` requerido
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Inserción**: Conversión camelCase → snake_case (`userId` → `userid`, `postId` → `postid`, `messageId` → `messageid`)
-   ✅ **Manejo de errores**: AppError 400 con detalle Supabase
-   ✅ **Soporte**: Reportes de publicaciones Y comentarios/mensajes

#### 3. **PUT - Actualizar Reporte**

-   ✅ **Endpoint**: `PUT /v1/adoptions/reports/:id`
-   ✅ **Validaciones**:
    -   ID debe ser numérico y existir
    -   Campos opcionales: `description`, `resolved`
    -   Actualiza `updatedat` automáticamente
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Respuesta estandarizada**: AppResponse con registro actualizado

#### 4. **DELETE - Eliminar Reporte**

-   ✅ **Endpoint**: `DELETE /v1/adoptions/reports/:id`
-   ✅ **Validaciones**:
    -   ID debe ser numérico y existir
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Manejo de errores**: Retorna 400 si Supabase lanza error
-   ✅ **Respuesta**: `Report eliminado correctamente`

---

### **Estructura de Base de Datos Utilizada**

```typescript
// Tabla: report
{
    id: number                // PK, auto-increment
    userid: number | null     // FK -> users.id
    postid: number | null     // FK -> post.id
    description: string | null
    resolved: boolean | null
    createdat: string | null
    updatedat: string | null
}
