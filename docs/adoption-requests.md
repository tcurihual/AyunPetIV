# CRUD AdoptionRequests - API Documentation

## **Información del Microservicio**

### **Configuración y puertos**

-   ✅ **Puerto**: 5000 (definido en .env como ENTITIES_PORT)
-   ✅ **Microservicio**: entities
-   ✅ **Tabla de base de datos**: adoption_request
-   ✅ **Estado**: CRUD Completo implementado y funcionando

### **Base URL**

```
http://localhost:5000
```

### **Estado de Implementación**

-   ✅ **CRUD Completo implementado** - Todas las operaciones CREATE, READ, UPDATE, DELETE funcionan
-   🔐 **Autenticación JWT requerida** - Todos los endpoints requieren token Bearer válido
-   🔄 **Timestamps automáticos** - createdat y updatedat se manejan automáticamente
-   ✅ **Validaciones robustas** - Verificación de usuarios, posts y duplicados
-   📝 **Mensajes de error descriptivos** - Respuestas claras para debugging

---

## **Authentication**

**IMPORTANTE:** Todos los endpoints requieren autenticación mediante token JWT.

### **Auth requerido:**

```
Authorization: Bearer <jwt_token>
```

### **Ejemplo:**

```
Pasos para probar:

Inicia sesión y obtén tu token.
En la sección Auth, selecciona "Bearer".
Coloca tu token en el campo correspondiente que dice Bearer Token.
Haz la petición: el servidor validará tu identidad usando ese token.
Esto es esencial para acceder a rutas protegidas de la API.
```

### **Fallback - Headers alternativos:**

Si no tienes token JWT, también puedes usar headers legacy:

```
x-user-id: <user_id>
x-user-role: <user_role>
```

### **Sin autenticación válida, obtendrás:**

```json
{
    "message": "No autenticado",
    "type": "error",
    "data": {}
}
```

---

## Endpoints

### 1. GET /adoption-requests

**Descripción:** Obtiene todas las solicitudes de adopción ordenadas por fecha de creación (más recientes primero).

**Método:** `GET`

**URL:** `/adoption-requests`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Parámetros:** Ninguno

**Respuesta exitosa (200):**

```json
{
    "message": "Solicitudes de adopción obtenidas exitosamente",
    "type": "success",
    "data": [
        {
            "id": 22,
            "postid": 22,
            "userid": 24,
            "message": "Nueva solicitud de prueba",
            "status": "pending",
            "createdat": "2025-10-07T01:15:26.733",
            "updatedat": "2025-10-07T01:15:26.733"
        }
    ]
}
```

**Códigos de error:**

-   `500` - Error interno del servidor

---

### 2. GET /adoption-requests/:id

**Descripción:** Obtiene una solicitud de adopción específica por su ID.

**Método:** `GET`

**URL:** `/adoption-requests/:id`

**Auth:**

```
Authorization: Bearer <jwt_token>
```

**Parámetros:**

-   `id` (number, required): ID de la solicitud de adopción

**Respuesta exitosa (200):**

```json
{
    "message": "Solicitud de adopción obtenida exitosamente",
    "type": "success",
    "data": {
        "id": 22,
        "postid": 22,
        "userid": 24,
        "message": "Nueva solicitud de prueba",
        "status": "pending",
        "createdat": "2025-10-07T01:15:26.733",
        "updatedat": "2025-10-07T01:15:26.733"
    }
}
```

**Códigos de error:**

-   `400` - ID debe ser un número válido
-   `404` - Solicitud de adopción no encontrada
-   `500` - Error interno del servidor

---

### 3. POST /adoption-requests

**Descripción:** Crea una nueva solicitud de adopción.

**Método:** `POST`

**URL:** `/adoption-requests`

**Auth:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body (JSON):**

```json
{
    "userid": 24,
    "postid": 22,
    "message": "Mensaje de la solicitud",
    "status": "pending"
}
```

**Campos requeridos:**

-   `userid` (number): ID del usuario que hace la solicitud
-   `postid` (number): ID del post de la mascota

**Campos opcionales:**

-   `message` (string): Mensaje de la solicitud
-   `status` (string): Estado de la solicitud (default: "pending")

**Respuesta exitosa (201):**

```json
{
    "message": "Solicitud de adopción creada exitosamente",
    "type": "success",
    "data": {
        "id": 22,
        "postid": 22,
        "userid": 24,
        "message": "Mensaje de la solicitud",
        "status": "pending",
        "createdat": "2025-10-07T01:15:26.733",
        "updatedat": "2025-10-07T01:15:26.733"
    }
}
```

**Códigos de error:**

-   `400` - userid y postid son campos requeridos
-   `404` - Usuario no encontrado / Post no encontrado
-   `409` - Ya existe una solicitud pendiente para este post
-   `500` - Error interno del servidor / Error al verificar solicitudes existentes / Error al crear la solicitud de adopción

---

### 4. PUT /adoption-requests/:id

**Descripción:** Actualiza una solicitud de adopción existente.

**Método:** `PUT`

**URL:** `/adoption-requests/:id`

**Auth:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Parámetros:**

-   `id` (number, required): ID de la solicitud de adopción a actualizar

**Body (JSON):**

```json
{
    "message": "Mensaje actualizado",
    "status": "approved"
}
```

**Campos opcionales:**

-   `userid` (number): ID del usuario
-   `postid` (number): ID del post
-   `message` (string): Mensaje de la solicitud
-   `status` (string): Estado de la solicitud

**Respuesta exitosa (200):**

```json
{
    "message": "Solicitud de adopción actualizada exitosamente",
    "type": "success",
    "data": {
        "id": 22,
        "postid": 22,
        "userid": 24,
        "message": "Mensaje actualizado",
        "status": "approved",
        "createdat": "2025-10-07T01:15:26.733",
        "updatedat": "2025-10-07T01:15:56.432"
    }
}
```

**Códigos de error:**

-   `400` - ID debe ser un número válido
-   `404` - Solicitud de adopción no encontrada / Usuario no encontrado / Post no encontrado
-   `500` - Error interno del servidor / Error al actualizar la solicitud de adopción

---

### 5. DELETE /adoption-requests/:id

**Descripción:** Elimina una solicitud de adopción.

**Método:** `DELETE`

**URL:** `/adoption-requests/:id`

**Auth:**

```
Authorization: Bearer <jwt_token>
```

**Parámetros:**

-   `id` (number, required): ID de la solicitud de adopción a eliminar

**Body:** Ninguno

**Respuesta exitosa (200):**

```json
{
    "message": "Solicitud de adopción eliminada exitosamente",
    "type": "success",
    "data": {}
}
```

**Códigos de error:**

-   `400` - ID debe ser un número válido
-   `404` - Solicitud de adopción no encontrada
-   `500` - Error interno del servidor / Error al eliminar la solicitud de adopción

---

## Esquema de datos

### AdoptionRequest

```typescript
{
    id: number // ID único de la solicitud
    postid: number | null // ID del post relacionado
    userid: number | null // ID del usuario que hace la solicitud
    message: string | null // Mensaje de la solicitud
    status: string | null // Estado: pending, approved, rejected
    createdat: string | null // Fecha de creación (ISO 8601)
    updatedat: string | null // Fecha de última actualización (ISO 8601)
}
```

### Estados válidos

-   `pending`: Solicitud pendiente de revisión (por defecto)
-   `approved`: Solicitud aprobada
-   `rejected`: Solicitud rechazada
-   `completed`: Solicitud completada (adopción finalizada)

---

## Validaciones y reglas de negocio

### Validaciones de creación (POST)

1. **userid y postid son obligatorios** - Sin estos campos obtienes error 400
2. **Usuario debe existir** - Si el userid no existe en la tabla users, obtienes error 404
3. **Post debe existir** - Si el postid no existe en la tabla post, obtienes error 404
4. **No duplicados pendientes** - No puedes crear múltiples solicitudes pendientes para el mismo post/usuario

### Validaciones de actualización (PUT)

1. **ID debe ser numérico** - IDs no numéricos retornan error 400
2. **Solicitud debe existir** - Si no existe la solicitud, obtienes error 404
3. **Usuario/Post válidos** - Si actualizas userid o postid, deben existir

### Validaciones de eliminación (DELETE)

1. **ID debe ser numérico** - IDs no numéricos retornan error 400
2. **Solicitud debe existir** - Si no existe la solicitud, obtienes error 404

---

## Errores comunes

### Error 401 - No autenticado (sin token)

```json
{
    "message": "No autenticado",
    "type": "error",
    "data": null
}
```

**Causa:** Token `Authorization: Bearer <token>` faltante o inválido.

### Error 401 - Token inválido

```json
{
    "message": "Token inválido",
    "type": "error",
    "data": null
}
```

**Causa:** El token JWT proporcionado no es válido o ha expirado.

### Error 404 - Usuario no encontrado

```json
{
    "message": "Usuario no encontrado",
    "type": "error",
    "data": {}
}
```

**Causa:** El `userid` especificado no existe en la base de datos.

### Error 404 - Post no encontrado

```json
{
    "message": "Post no encontrado",
    "type": "error",
    "data": {}
}
```

**Causa:** El `postid` especificado no existe en la base de datos.

### Error 409 - Solicitud duplicada

```json
{
    "message": "Ya existe una solicitud pendiente para este post",
    "type": "error",
    "data": {}
}
```

**Causa:** Ya existe una solicitud con estado "pending" para la misma combinación usuario/post.

---

## Ejemplos de uso

### Crear una solicitud

**POST http://localhost:5000/adoption-requests**

```json
{
    "userid": 24,
    "postid": 22,
    "message": "Me interesa adoptar esta mascota",
    "status": "pending"
}
```

### Obtener todas las solicitudes

**GET http://localhost:5000/adoption-requests**

### Obtener solicitud por ID

**GET http://localhost:5000/adoption-requests/22**

### Actualizar una solicitud

**PUT http://localhost:5000/adoption-requests/22**

```json
{
    "status": "approved",
    "message": "Solicitud aprobada"
}
```

### Eliminar una solicitud

**DELETE http://localhost:5000/adoption-requests/22**
