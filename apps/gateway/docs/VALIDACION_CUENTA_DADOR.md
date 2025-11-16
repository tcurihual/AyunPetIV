# Endpoint de Validación de Cuentas de Dadores

## 📋 Descripción

Este sistema permite gestionar solicitudes de usuarios que quieren convertirse en dadores de mascotas. El sistema maneja **dos flujos diferentes**:

### Flujo 1: Registro Inicial (Shelter/Dador)
- Usuario se registra directamente como **shelter (rol 21)** o **dador (rol 22)**
- Cuenta creada con `validated=false`
- Al ser aprobado: `validated` cambia a `true`, rol se mantiene igual

### Flujo 2: Escalamiento de Rol (Adoptante → Dador)
- Usuario **adoptante (rol 20)** ya validado solicita convertirse en dador
- Usuario envía documentos pero **mantiene acceso como adoptante** (validated sigue siendo true)
- Al ser aprobado: `role` cambia de 20 a 22, `validated` se mantiene sin cambios
- Si es rechazado: Usuario sigue siendo adoptante sin restricciones

**IMPORTANTE:** Los adoptantes (rol 20) con `validated=false` son **registros normales**, NO solicitudes de escalamiento, y no deben aparecer en el listado de solicitudes de giver.

**Funcionalidades incluidas:**

1. **Solicitud de conversión**: Usuarios normales (adoptantes) pueden enviar documentos para solicitar convertirse en dadores
2. **Listado de solicitudes**: Administradores pueden ver todas las solicitudes pendientes (ambos tipos)
3. **Validación de cuentas**: Administradores pueden aprobar cuentas, actualizando permisos según el tipo de solicitud
4. **Rechazo de solicitudes**: Administradores pueden rechazar solicitudes sin afectar el acceso del usuario

---

## 🔗 Endpoints

### 1. Enviar Solicitud para Ser Dador (Usuarios Normales)

```http
POST /v1/entities/giver-request/submit
```

**Descripción:** Permite a un usuario normal (rol 20) enviar documentos para solicitar convertirse en dador de adopción.

**⚠️ IMPORTANTE:** El usuario **mantiene su acceso completo como adoptante** mientras la solicitud está pendiente. El campo `validated` **NO cambia** durante el proceso de solicitud. Solo cambia el `role` cuando el admin aprueba la solicitud.

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
    "message": "Solicitud enviada exitosamente. Podrás seguir usando la app como adoptante mientras la revisamos.",
    "data": {
        "id": 123,
        "email": "usuario@example.com",
        "status": "pending_validation",
        "message": "Recibirás un correo cuando sea validada. Puedes seguir usando la app normalmente."
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
3. � **El usuario mantiene su estado actual** (validated no cambia)
4. 📧 Envía correo al usuario notificando que puede seguir usando la app normalmente

---

### 2. Listar Solicitudes Pendientes

```http
GET /v1/entities/giver-request
```

**Descripción:** Obtiene la lista de solicitudes pendientes de validación. Incluye dos tipos:

1. **Nuevos registros**: Usuarios que se registraron como shelter (rol 21) o dador (rol 22) con `validated=false` y tienen documentos
2. **Escalamiento**: Usuarios adoptantes (rol 20) validados que solicitan convertirse en dadores y tienen documentos

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

**Descripción:** Valida una solicitud pendiente. El comportamiento varía según el tipo de solicitud:

#### Tipo 1: Nuevo registro (shelter/dador)
- Usuario con rol 21 (shelter) o 22 (dador) y `validated=false`
- **Acción:** Cambia `validated` de false a true
- El rol se mantiene sin cambios

#### Tipo 2: Escalamiento de adoptante a dador
- Usuario con rol 20 (adoptante) y `validated=true`
- **Acción:** Cambia `role` de 20 a 22 (adoptante → dador)
- El campo `validated` se mantiene sin cambios

**IMPORTANTE:** Los adoptantes (rol 20) con `validated=false` son registros normales de usuarios que recién se registraron. NO son solicitudes de escalamiento y NO deben ser validados a través de este endpoint. La validación de adoptantes se hace automáticamente al confirmar su email.

**En todos los casos:**
- Se eliminan los documentos del servidor Media
- Se envía correo de confirmación al usuario

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

**Para escalamiento de rol (adoptante → dador):**
```json
{
    "type": "success",
    "message": "Solicitud aprobada. Usuario escalado a dador exitosamente.",
    "data": {
        "id": 54,
        "email": "usuario@example.com",
        "previousRole": 20,
        "newRole": 22
    }
}
```

**Para validación de registro inicial:**
```json
{
    "type": "success",
    "message": "Cuenta validada exitosamente",
    "data": {
        "id": 54,
        "email": "shelter@example.com",
        "validated": true,
        "role": 21
    }
}
```

**Errores:**

-   `400` - ID inválido o sin solicitud pendiente
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
        "message": "No hay solicitud pendiente para este usuario",
        "data": null
    }
    ```
    ```json
    {
        "type": "error",
        "message": "Usuario no tiene solicitud pendiente de validación",
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

1. ✅ Actualiza la base de datos según el tipo de solicitud:
   - **Escalamiento:** Cambia `role` de 20 a 22
   - **Registro inicial:** Cambia `validated` a true
2. 📧 Envía un correo electrónico al usuario con:
    - Confirmación de validación/aprobación
    - Lista de permisos desbloqueados
    - Botón para iniciar sesión (o instrucción de reiniciar sesión)
    - Diseño profesional con colores de marca (#FFD24C)

**Importante:** Si el envío del email falla, la validación de la cuenta **se completa igual**. El email es un proceso secundario no-bloqueante.

**Logs en consola:**

Para escalamiento:
```
✅ Usuario 54 escalado de rol 20 (adoptante) a 22 (dador)
📧 Correo de aprobación enviado correctamente a: usuario@example.com
```

Para registro inicial:
```
✅ Usuario 54 con rol 21 validado exitosamente
📧 Correo de aprobación enviado correctamente a: shelter@example.com
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
