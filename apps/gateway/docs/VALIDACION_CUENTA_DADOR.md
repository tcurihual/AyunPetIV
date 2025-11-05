# Endpoint de Validación de Cuentas de Dadores

## 📋 Descripción

Este sistema permite gestionar solicitudes de usuarios que quieren convertirse en dadores de mascotas. Incluye:

1. **Solicitud de conversión**: Usuarios normales (adoptantes) pueden enviar documentos para solicitar convertirse en dadores
2. **Listado de solicitudes**: Administradores pueden ver todas las solicitudes pendientes
3. **Validación de cuentas**: Administradores pueden validar cuentas, lo que actualiza permisos y envía correo de confirmación

Al validar una cuenta, se actualiza el campo `validated` a `true` en la base de datos, se cambia el rol si es necesario, y se envía automáticamente un correo electrónico de confirmación al usuario.

---

## 🔗 Endpoints

### 1. Enviar Solicitud para Ser Dador (Usuarios Normales)

```http
POST /v1/entities/giver-request/submit
```

**Descripción:** Permite a un usuario normal (rol 20) enviar documentos para solicitar convertirse en dador de adopción.

**Autenticación:** Requiere token JWT de usuario normal (rol 20)

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**

-   `documents` (archivos, requerido) - Array de archivos (imágenes JPEG/PNG/WEBP o PDFs, máximo 10 archivos, 10MB cada uno)

**Ejemplo de Request (usando FormData):**

```javascript
const formData = new FormData()
formData.append("documents", file1)
formData.append("documents", file2)

fetch("/v1/entities/giver-request/submit", {
    method: "POST",
    headers: {
        Authorization: "Bearer <user_token>",
    },
    body: formData,
})
```

**Respuesta Exitosa (200):**

```json
{
    "type": "success",
    "message": "Solicitud enviada exitosamente. Recibirás un correo cuando sea validada.",
    "data": {
        "id": 123,
        "email": "usuario@example.com",
        "status": "pending_validation"
    }
}
```

**Errores:**

-   `400` - Sin documentos adjuntos o solicitud ya existe
    ```json
    {
        "type": "error",
        "message": "Debes adjuntar al menos un documento",
        "data": null
    }
    ```
    ```json
    {
        "type": "error",
        "message": "Ya tienes una solicitud pendiente de validación",
        "data": null
    }
    ```
-   `401` - No autenticado
-   `404` - Usuario no encontrado
-   `502` - Error al guardar documentos en Media
-   `500` - Error del servidor

**Proceso automático:**

1. ✅ Recibe y valida los documentos
2. 📤 Envía documentos al microservicio de Media
3. 🔄 Marca la cuenta como `validated = false`
4. 📧 Envía correo al usuario notificando que debe esperar la validación

---

### 2. Listar Solicitudes Pendientes

```http
GET /v1/entities/giver-request
```

**Descripción:** Obtiene la lista de usuarios con cuentas pendientes de validación (`validated = false`). Incluye tanto usuarios que se registraron directamente como dadores (rol 21) como usuarios normales (rol 20) que enviaron solicitud.

**Autenticación:** Requiere token JWT de administrador (rol 19)

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Respuesta Exitosa (200):**

```json
{
    "type": "success",
    "message": "Listado de solicitudes de creación de cuentas",
    "data": [
        {
            "id": 54,
            "email": "shelter@example.com",
            "name": "Refugio Animal",
            "role": 21,
            "rut": "12345678-9",
            "files": [
                "http://localhost:7000/uploads/account-request/12345678-9/certificado.pdf",
                "http://localhost:7000/uploads/account-request/12345678-9/foto.jpg"
            ]
        },
        {
            "id": 123,
            "email": "usuario@example.com",
            "name": "Juan Pérez",
            "role": 20,
            "rut": "98765432-1",
            "files": ["http://localhost:7000/uploads/account-request/98765432-1/documento.pdf"]
        }
    ]
}
```

**Errores:**

-   `401` - No autenticado
-   `403` - No autorizado (requiere rol admin)
-   `500` - Error del servidor

---

### 3. Validar Cuenta de Dador

```http
PATCH /v1/entities/giver-request/:userId/validate
```

**Descripción:** Valida la cuenta de un dador. Funciona para:

-   Usuarios que se registraron directamente como giver (rol 21)
-   Usuarios normales (rol 20) que solicitaron convertirse en dadores

Al validar, marca `validated=true`, actualiza el rol a 21 si es necesario, y envía email de confirmación.

**Autenticación:** Requiere token JWT de administrador (rol 19)

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Parámetros de URL:**

-   `userId` (number, requerido) - ID del usuario a validar

**Ejemplo de Request:**

```http
PATCH /v1/entities/giver-request/54/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**

```json
{
    "type": "success",
    "message": "Cuenta de dador validada exitosamente",
    "data": {
        "userId": 54,
        "validated": true
    }
}
```

**Errores:**

-   `400` - ID inválido o cuenta ya validada
    ```json
    {
        "type": "error",
        "message": "ID de usuario inválido",
        "data": null
    }
    ```
    ```json
    {
        "type": "error",
        "message": "La cuenta ya está validada",
        "data": null
    }
    ```
-   `401` - No autenticado
-   `403` - No autorizado (requiere rol admin)
-   `404` - Usuario no encontrado
    ```json
    {
        "type": "error",
        "message": "Usuario no encontrado",
        "data": null
    }
    ```
-   `500` - Error del servidor

---

## 📧 Notificación por Email

Cuando se valida una cuenta exitosamente, el sistema **automáticamente**:

1. ✅ Actualiza `validated = true` en la base de datos
2. 📧 Envía un correo electrónico al usuario con:
    - Confirmación de validación
    - Lista de permisos desbloqueados
    - Botón para iniciar sesión
    - Diseño profesional con colores de marca (#FFD24C)

**Importante:** Si el envío del email falla, la validación de la cuenta **se completa igual**. El email es un proceso secundario no-bloqueante.

**Logs en consola:**

```
✅ Cuenta de dador validada: userId=54
📧 Correo de validación enviado a: shelter@example.com
```

---

## 🔒 Seguridad

### Autenticación

-   **JWT Token requerido** en header `Authorization: Bearer <token>`
-   Token debe ser válido y no expirado

### Autorización

-   **Solo rol 19 (Admin)** puede acceder a estos endpoints
-   El middleware `requireRole(19)` valida el rol automáticamente

### Validaciones

-   ✅ ID de usuario debe ser numérico y válido
-   ✅ Usuario debe existir en la base de datos
-   ✅ Cuenta no debe estar previamente validada
-   ✅ Previene validaciones duplicadas

---

## 📊 Códigos de Estado HTTP

| Código | Significado           | Cuándo ocurre                         |
| ------ | --------------------- | ------------------------------------- |
| 200    | OK                    | Operación exitosa                     |
| 400    | Bad Request           | ID inválido o cuenta ya validada      |
| 401    | Unauthorized          | Token JWT no proporcionado o inválido |
| 403    | Forbidden             | Usuario no tiene rol de administrador |
| 404    | Not Found             | Usuario no existe                     |
| 500    | Internal Server Error | Error en servidor o base de datos     |

---
