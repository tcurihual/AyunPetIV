# Endpoint de Validación de Cuentas de Dadores

## 📋 Descripción

Endpoint que permite a los **administradores** validar cuentas de dadores de mascotas. Al validar una cuenta, se actualiza el campo `validated` a `true` en la base de datos y se envía automáticamente un correo electrónico de confirmación al usuario.

---

## 🔗 Endpoints

### 1. Listar Solicitudes Pendientes

```http
GET /v1/entities/giverRequests
```

**Descripción:** Obtiene la lista de usuarios con cuentas pendientes de validación (`validated = false`), excluyendo admins y usuarios normales.

**Autenticación:** Requiere token JWT de administrador (rol 19)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Lista de solicitudes de validación",
  "data": [
    {
      "id": 54,
      "email": "shelter@example.com",
      "name": "Refugio Animal",
      "validated": false,
      "rol": 21,
      "rut": "12345678-9",
      "phone": "+56912345678",
      "created_at": "2025-01-15T10:30:00Z",
      "accountRequestFiles": [
        {
          "fileName": "certificado.pdf",
          "fileUrl": "http://localhost:7000/files/account-request/12345678-9"
        }
      ]
    }
  ]
}
```

**Errores:**
- `401` - No autenticado
- `403` - No autorizado (requiere rol admin)
- `500` - Error del servidor

---

### 2. Validar Cuenta de Dador

```http
PATCH /v1/entities/giverRequests/:userId/validate
```

**Descripción:** Valida la cuenta de un dador, cambia `validated` a `true` y envía email de confirmación.

**Autenticación:** Requiere token JWT de administrador (rol 19)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Parámetros de URL:**
- `userId` (number, requerido) - ID del usuario a validar

**Ejemplo de Request:**
```http
PATCH /v1/entities/giverRequests/54/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Cuenta de dador validada exitosamente",
  "data": {
    "userId": 54,
    "validated": true
  }
}
```

**Errores:**
- `400` - ID inválido o cuenta ya validada
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
- `401` - No autenticado
- `403` - No autorizado (requiere rol admin)
- `404` - Usuario no encontrado
  ```json
  {
    "type": "error",
    "message": "Usuario no encontrado",
    "data": null
  }
  ```
- `500` - Error del servidor

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
- **JWT Token requerido** en header `Authorization: Bearer <token>`
- Token debe ser válido y no expirado

### Autorización
- **Solo rol 19 (Admin)** puede acceder a estos endpoints
- El middleware `requireRole(19)` valida el rol automáticamente

### Validaciones
- ✅ ID de usuario debe ser numérico y válido
- ✅ Usuario debe existir en la base de datos
- ✅ Cuenta no debe estar previamente validada
- ✅ Previene validaciones duplicadas

---



## 📊 Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | ID inválido o cuenta ya validada |
| 401 | Unauthorized | Token JWT no proporcionado o inválido |
| 403 | Forbidden | Usuario no tiene rol de administrador |
| 404 | Not Found | Usuario no existe |
| 500 | Internal Server Error | Error en servidor o base de datos |

---
