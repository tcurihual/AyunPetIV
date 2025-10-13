# API Documentation - Entities Microservice

## Adoption Requests CRUD

### Base URL

```
http://localhost:5000
```

### Authentication

El microservicio entities utiliza el mismo patrón de autenticación que el resto de los microservicios.

---

## Endpoints

### 1. GET /adoption-requests

**Descripción:** Obtiene todas las solicitudes de adopción ordenadas por fecha de creación (más recientes primero).

**Método:** `GET`

**URL:** `/adoption-requests`

**Headers:**

```
Content-Type: application/json
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

**Headers:**

```
Content-Type: application/json
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

**Headers:**

```
Content-Type: application/json
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

**Headers:**

```
Content-Type: application/json
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

**Headers:**

```
Content-Type: application/json
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

-   `pending`: Solicitud pendiente de revisión
-   `approved`: Solicitud aprobada
-   `rejected`: Solicitud rechazada

---

## Ejemplos de uso

### Crear una solicitud

```bash
curl -X POST http://localhost:5000/adoption-requests \
  -H "Content-Type: application/json" \
  -d '{"userid": 24, "postid": 22, "message": "Me interesa adoptar esta mascota", "status": "pending"}'
```

### Obtener todas las solicitudes

```bash
curl -X GET http://localhost:5000/adoption-requests
```

### Obtener solicitud por ID

```bash
curl -X GET http://localhost:5000/adoption-requests/22
```

### Actualizar una solicitud

```bash
curl -X PUT http://localhost:5000/adoption-requests/22 \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "message": "Solicitud aprobada"}'
```

### Eliminar una solicitud

```bash
curl -X DELETE http://localhost:5000/adoption-requests/22
```
