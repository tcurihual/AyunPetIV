# CRUD Messages - Resumen de Implementación

## **Tareas Completadas**

### **Estructura Creada**

-   ✅ **Controlador**: `apps/adoptions/src/controllers/messages.ts`
-   ✅ **Rutas**: `apps/adoptions/src/routes/messages.ts`
-   ✅ **Integración**: Agregado al archivo principal `apps/adoptions/src/index.ts`

### **Funcionalidades Implementadas**

#### 1. **GET - Obtener Mensajes**

-   ✅ **GET /v1/adoptions/messages**: Obtener todos los mensajes
-   ✅ **GET /v1/adoptions/messages/:id**: Obtener un mensaje específico por ID
-   ✅ **Validación**: ID debe ser numérico y existente
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Manejo de errores**: Control con `AppError` y respuesta con `AppResponse`
-   ✅ **Soporte**: Lectura de todos los mensajes o de uno en particular

#### 2. **POST - Crear Mensaje**

-   ✅ **Endpoint**: `POST /v1/adoptions/messages`
-   ✅ **Validaciones**:
    -   `creatorId` es requerido (FK → `users.id`)
    -   `description` es requerido
    -   `postId` es opcional (FK → `post.id`)
    -   `status` opcional (por defecto `"active"`)
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Inserción**: Conversión de camelCase a snake_case (`creatorId` → `creatorid`, `postId` → `postid`)
-   ✅ **Manejo de errores**: Mensajes claros ante FK inexistente o campos vacíos
-   ✅ **Respuesta**: Devuelve el mensaje recién creado con `AppResponse`

#### 3. **PUT - Actualizar Mensaje**

-   ✅ **Endpoint**: `PUT /v1/adoptions/messages/:id`
-   ✅ **Validaciones**:
    -   ID debe ser numérico y existir
    -   Campos opcionales: `description`, `status`
    -   Actualización parcial (solo se modifican los campos enviados)
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Actualización automática** del campo `updatedat`
-   ✅ **Respuesta estandarizada** con `AppResponse`

#### 4. **DELETE - Eliminar Mensaje**

-   ✅ **Endpoint**: `DELETE /v1/adoptions/messages/:id`
-   ✅ **Validaciones**:
    -   ID debe ser numérico y existir
-   ✅ **Autenticación**: Token JWT requerido
-   ✅ **Respuesta**: `Mensaje eliminado correctamente`
-   ✅ **Manejo de errores**: AppError 400 si el mensaje no existe o hay error en Supabase

---

### **Estructura de Base de Datos Utilizada**

```typescript
// Tabla: message
{
    id: number                 // PK, auto-increment
    creatorid: number | null   // FK → users.id
    postid: number | null      // FK → post.id
    description: string        // Contenido del mensaje
    status: string | null      // Estado ("active", "read", "archived", etc.)
    createdat: string | null   // Timestamp de creación
    updatedat: string | null   // Timestamp de última modificación
}
