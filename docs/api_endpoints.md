# Ayün Pet API

### Microservicio Auth

Prefijo para acceder a cualquier endpoint de este microservicio: `api/auth`

#### Login

Método: <span style="color:yellow">POST</span>\
Endpoint: `/login`\
Request Body:

```json
{
    "email": "email@gmail.com",
    "password": "password"
}
```

Código de respuesta: `200`\
Response Body: Se retorna un user, debe ser **sin password**

```json
{
    "status": 200,
    "message": "Inicio de sesión exitoso",
    "type": "success",
    "values": {
        "user": {
            "id": 1,
            "role": 20,
            "rut": "10101010-1",
            "email": "email@gmail.com",
            "name": "jhon doe",
            "validated": true,
            "address": "",
            "description": "",
            "createdat": "timestamp",
            "updatedat": ""
        },
        "token": "SECRET_TOKEN"
    }
}
```

#### Register

Método: <span style="color:yellow">POST</span>\
Endpoint: `/register`\
Request Body: Campos del usuario sin **id**

```json
{
    "role": 20,
    "rut": "10101010-1",
    "email": "email@gmail.com",
    "name": "jhon doe",
    "password": "password",
    "address": "",
    "description": ""
}
```

Código de respuesta: `201`\
Response Body: Se retorna un user, **sin password**

```json
{
    "status": 201,
    "message": "Registro de usuario exitoso",
    "type": "success",
    "values": {
        "user": {
            "id": 1,
            "role": 20,
            "rut": "10101010-1",
            "email": "email@gmail.com",
            "name": "jhon doe",
            "validated": false,
            "address": "",
            "description": "",
            "createdat": "timestamp",
            "updatedat": ""
        }
    }
}
```

#### Verify Email

_Proceso para usar el endpoint:_

1. Una vez terminado el registro, enviar un correo con un link único creado con un token que redirija a una vista del frontend `https://web-app/verificar-correo?token=TOKEN_UNICO_DEL_EMAIL`
2. El usuario accede al link y el frontend realiza una petición a la api con este endpoint
3. El backend válida el token y verifica el email

Método: <span style="color:yellowgreen">GET</span>\
Endpoint: `/verify-email/:token`\
Request Body: No tiene al ser método GET\
Código de respuesta: `200`\
Reponse Body:

```json
{
    "status": 200,
    "message": "Correo electrónico verificado con éxito",
    "type": "success",
    "values": {}
}
```

#### Reset Password

_Para implementar esta funcionalidad se deben aplicar 2 endpoints:_

##### 1: Request Reset Password

1. El usuario ingresa su email para que el sistema envie un enlace de recuperación
2. Se envia un correo con un link único creado con un token que redirija a una vista del frontend `https://web-app/reestablecer-contrasena?token=TOKEN_UNICO_DEL_EMAIL`

Método: <span style="color:yellow">POST</span>\
Endpoint: `/forgot-password`\
Request Body:

```json
{ "email": "email@gmail.com" }
```

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Se ha enviado un correo para restablecer la contraseña.",
    "type": "success",
    "values": {}
}
```

##### 2: Change Password

1. El usuario accede al link del correo e ingresa una nueva contraseña y la envia con el token en una request al endpoint
2. Si el token es válido se realiza el cambio de contraseña

Método: <span style="color:yellow">POST</span>\
Endpoint: `/reset-password`\
Request Body:

```json
{
    "token": "TOKEN_UNICO_DEL_EMAIL",
    "newPassword": "newPassword"
}
```

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Contraseña actualizada con éxito.",
    "type": "success",
    "values": {}
}
```

#### Check User Exists

_Proceso para usar el endpoint:_

1. Este endpoint se utiliza antes del registro para verificar si un email o RUT ya están registrados
2. Se envía únicamente el email o el rut (también pueden enviarse ambos)
3. El backend verifica si existe algún usuario con ese email o RUT
4. Si existe, retorna error 409. Si no existe, retorna 200

Método: <span style="color:yellow">POST</span>\
Endpoint: `/check-user-exists`\
Request Body (opción 1 - solo email):

```json
{
    "email": "usuario@ejemplo.com"
}
```

Request Body (opción 2 - solo RUT):

```json
{
    "rut": "12.345.678-9"
}
```

Request Body (opción 3 - ambos):

```json
{
    "email": "usuario@ejemplo.com",
    "rut": "12.345.678-9"
}
```

Código de respuesta exitoso: `200`\
Response Body (cuando el email/RUT están disponibles):

```json
{
    "status": 200,
    "message": "El email o RUT están disponibles",
    "type": "success",
    "data": {
        "available": true
    }
}
```

Código de respuesta error: `409`\
Response Body (cuando el email ya existe):

```json
{
    "status": 409,
    "message": "El email ya está registrado",
    "type": "error"
}
```

Response Body (cuando el RUT ya existe):

```json
{
    "status": 409,
    "message": "El RUT ya está registrado",
    "type": "error"
}
```

Response Body (cuando se envían ambos y alguno existe):

```json
{
    "status": 409,
    "message": "El email o RUT ya están registrados",
    "type": "error"
}
```

Código de respuesta error: `400`\
Response Body (cuando no se proporciona ni email ni RUT):

```json
{
    "status": 400,
    "message": "Debe proporcionar email o rut",
    "type": "error"
}
```

### Microservicio Adoptions

Prefijo para acceder a cualquier endpoint de este microservicio: `api/adoptions`

#### Create Post

Método: <span style="color:yellow">POST</span>\
Endpoint: `/posts`\
Middleware: `validateToken`, `verifyRole(20, 21)`\

Descripción: Permite a un usuario crear una nueva publicación de adopción. Internamente, crea la mascota y luego la publicación asociada. Si alguna de las dos operaciones falla, se revierte la transacción para no dejar datos inconsistentes.\

Request Body:

```json
{
    "pet": {
        "species": "dog",
        "name": "pepe",
        "gender": "male",
        "age": 2,
        "size": "medium",
        "sterilized": true
    },
    "post": {
        "title": "Doy en adopción a pepe",
        "description": "pepe es un perro muy juguetón y amigable"
    }
}
```

Código de respuesta: `201`
Markdown

### Microservicio Adoptions

Prefijo para acceder a cualquier endpoint de este microservicio: `api/adoptions`

#### Create Post

Método: <span style="color:yellow">POST</span>\
Endpoint: `/posts`\
Middleware: `validateToken`, `verifyRole(20, 21)`

Descripción: Permite a un usuario crear una nueva publicación de adopción. Internamente, crea la mascota y luego la publicación asociada. Si alguna de las dos operaciones falla, se revierte la transacción para no dejar datos inconsistentes.

Request Body:

```json
{
    "pet": {
        "species": "dog",
        "name": "pepe",
        "gender": "male",
        "age": 2,
        "size": "medium",
        "sterilized": true
    },
    "post": {
        "title": "Doy en adopción a pepe",
        "description": "pepe es un perro muy juguetón"
    }
}
```

Código de respuesta: `201`\
Response Body:

```json
{
    "status": 201,
    "message": "Publicación creada con éxito",
    "type": "success",
    "values": {
        "post": {
            "id": 1,
            "creatorid": 1,
            "petid": 1,
            "title": "Doy en adopción a pepe",
            "description": "pepe es un perro muy juguetón",
            "status": "active",
            "createdat": "timestamp",
            "updatedat": "timestamp"
        },
        "pet": {
            "id": 1,
            "ownerid": 1,
            "species": "dog",
            "name": "pepe",
            "gender": "male",
            "age": 2,
            "size": "medium",
            "sterilized": true,
            "adopted": false,
            "createdat": "timestamp",
            "updatedat": "timestamp"
        }
    }
}
```

#### Create Adoption Request

Método: <span style="color:yellow">POST</span>\
Endpoint: `/requests`\
Middleware: `validateToken`

Descripción: Permite a un usuario autenticado enviar una solicitud de adopción para una publicación específica.\
Request Body:

```json
{
    "postid": 123,
    "message": "Hola, estoy muy interesado en adoptar a pepe"
}
```

Código de respuesta: `201`\
Response Body:

```json
{
    "status": 201,
    "message": "Solicitud de adopción enviada con éxito",
    "type": "success",
    "values": {
        "adoption_request": {
            "id": 1,
            "postid": 123,
            "userid": 45,
            "message": "Hola, estoy muy interesado en adoptar a pepe",
            "status": "pending",
            "createdat": "timestamp",
            "updatedat": null
        }
    }
}
```

### Middlewares

Estos son utilizados en los endpoints para conceder o denegar acceso a elementos privados, ejemplo:

```ts
const router = Router()
router.delete("/", verifyOwnership(), posts.delete)
```

#### validateToken

_Middleware que verifica si el token que es enviado a través de `Authorization: Bearer Token` en la request es valido y que ademas no haya expirado_

```ts
export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    // si es valido el token, importante obtener el user desde el payload del token y adjuntarlo para ser usado despues
    req.user = user
    next()
    // si no es valido o expiró, código 401 quiere decir forbidden
    throw new Error(401)
}
```

#### verifyRole

_Middleware que verifica si el rol del usuario es valido, este middleware se debe configurar en sus props para poder definir en cada endpoint que rol será valido_

```ts
// ejemplo con un endpoint
router.get("/", verifyRole(20, 21), requests.getAll) // pueden acceder usuarios y organizaciones
```

#### verifyOwnserhip

```ts
export const verifyOwnserhip = (req: Request, res: Response, next: NextFunction) => {
    // verificar que la entidad a modificar contiene la id del usuario en sus elementos
    next()
    // si no la contiene, código 401 quiere decir forbidden
    throw new Error(401)
}
```

_Middleware que verifica si el elemento a listar, modificar, eliminar le pertenece al usuario que envia la request_

---

### Microservicio Entities

Prefijo para acceder a cualquier endpoint de este microservicio: `api/entities`

#### Obtener Historial de Adopciones

Método: <span style="color:green">GET</span>\
Endpoint: `/adoption-history`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin`, `shelter`\
Request Body: No requiere

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Historial de adopciones obtenido exitosamente",
    "type": "success",
    "data": [
        {
            "id": 1,
            "petid": 123,
            "fromownerid": 456,
            "toownerid": 789,
            "postid": 101,
            "createdat": "2025-10-05T12:00:00.000Z"
        }
    ]
}
```

**Códigos de error:**

-   `401`: Token inválido o ausente
-   `403`: Permisos insuficientes
-   `500`: Error interno del servidor

#### Obtener Historial de Adopción por ID

Método: <span style="color:green">GET</span>\
Endpoint: `/adoption-history/:id`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin`, `shelter`\
Parámetros: `id` (número) - ID del registro de historial\
Request Body: No requiere

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Historial de adopción obtenido exitosamente",
    "type": "success",
    "data": {
        "id": 1,
        "petid": 123,
        "fromownerid": 456,
        "toownerid": 789,
        "postid": 101,
        "createdat": "2025-10-05T12:00:00.000Z"
    }
}
```

**Códigos de error:**

-   `400`: ID inválido (no es un número)
-   `401`: Token inválido o ausente
-   `403`: Permisos insuficientes
-   `404`: Historial de adopción no encontrado
-   `500`: Error interno del servidor

#### Crear Historial de Adopción

Método: <span style="color:yellow">POST</span>\
Endpoint: `/adoption-history`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin`, `shelter`\
Request Body:

```json
{
    "petid": 123,
    "fromownerid": 456,
    "toownerid": 789,
    "postid": 101
}
```

**Campos requeridos:**

-   `petid`: ID de la mascota (requerido)

**Campos opcionales:**

-   `fromownerid`: ID del propietario anterior
-   `toownerid`: ID del nuevo propietario
-   `postid`: ID del post relacionado
-   `createdat`: Fecha de creación (se asigna automáticamente si no se proporciona)

Código de respuesta: `201`\
Response Body:

```json
{
    "status": 201,
    "message": "Historial de adopción creado exitosamente",
    "type": "success",
    "data": {
        "id": 1,
        "petid": 123,
        "fromownerid": 456,
        "toownerid": 789,
        "postid": 101,
        "createdat": "2025-10-05T12:00:00.000Z"
    }
}
```

**Códigos de error:**

-   `400`: Datos requeridos ausentes (petid)
-   `401`: Token inválido o ausente
-   `403`: Permisos insuficientes
-   `404`: Usuario o mascota o post no encontrados
-   `500`: Error interno del servidor

#### Actualizar Historial de Adopción

Método: <span style="color:blue">PUT</span>\
Endpoint: `/adoption-history/:id`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin`, `shelter`\
Parámetros: `id` (número) - ID del registro a actualizar\
Request Body:

```json
{
    "petid": 123,
    "fromownerid": 456,
    "toownerid": 789,
    "postid": 101
}
```

**Nota:** Todos los campos son opcionales. Solo se actualizarán los campos proporcionados.

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Historial de adopción actualizado exitosamente",
    "type": "success",
    "data": {
        "id": 1,
        "petid": 123,
        "fromownerid": 456,
        "toownerid": 789,
        "postid": 101,
        "createdat": "2025-10-05T12:00:00.000Z"
    }
}
```

**Códigos de error:**

-   `400`: ID inválido (no es un número)
-   `401`: Token inválido o ausente
-   `403`: Permisos insuficientes
-   `404`: Historial de adopción, usuario, mascota o post no encontrados
-   `500`: Error interno del servidor

#### Eliminar Historial de Adopción

Método: <span style="color:red">DELETE</span>\
Endpoint: `/adoption-history/:id`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin`\
Parámetros: `id` (número) - ID del registro a eliminar\
Request Body: No requiere

Código de respuesta: `200`\
Response Body:

```json
{
    "status": 200,
    "message": "Historial de adopción eliminado exitosamente",
    "type": "success",
    "data": {
        "id": 1
    }
}
```

**Códigos de error:**

-   `400`: ID inválido (no es un número)
-   `401`: Token inválido o ausente
-   `403`: Permisos insuficientes (solo admin puede eliminar)
-   `404`: Historial de adopción no encontrado
-   `500`: Error interno del servidor

---

### Códigos de Verificación

Prefijo: `api/entities`

#### Crear Código de Verificación

Método: <span style="color:yellow">POST</span>\
Endpoint: `/verification-codes`\
Headers: `Authorization: Bearer <token>`\
Request Body:

```json
{
    "type": "verify" | "reset" | "adoption",
    "userId": 123,
    "duration": 30
}
```

**Campos:**

-   `type` (requerido): Tipo de código (`verify`, `reset`, `adoption`)
-   `userId` (opcional): ID del usuario (usa el del token si no se proporciona)
-   `duration` (opcional): Duración en minutos (1-1440)

**Duraciones por defecto:**

-   `verify`: 30 minutos
-   `reset`: 15 minutos
-   `adoption`: 24 horas

Código de respuesta: `201`\
Response Body:

```json
{
    "type": "success",
    "message": "Código de verificación creado exitosamente",
    "data": {
        "id": 123,
        "code": "123456",
        "type": "verify",
        "expires_at": "2025-10-14T15:30:00Z",
        "user_id": 1
    }
}
```

**Códigos de error:**

-   `400`: Datos inválidos (tipo incorrecto, duración fuera de rango)
-   `401`: Token inválido o ausente
-   `404`: Usuario no encontrado
-   `500`: Error interno del servidor

#### Validar Código de Verificación

Método: <span style="color:yellow">POST</span>\
Endpoint: `/verification-codes/validate`\
Request Body:

```json
{
    "code": "123456",
    "type": "verify",
    "userId": 1
}
```

**Campos:**

-   `code` (requerido): Código de 6 dígitos
-   `type` (requerido): Tipo de código
-   `userId` (requerido): ID del usuario

Código de respuesta: `200`\
Response Body:

```json
{
    "type": "success",
    "message": "Código de verificación validado correctamente",
    "data": {
        "id": 123,
        "type": "verify",
        "user_id": 1,
        "validated_at": "2025-10-14T14:45:00Z"
    }
}
```

**Códigos de error:**

-   `400`: Código inválido, expirado o ya usado
-   `404`: Código no encontrado
-   `500`: Error interno del servidor

#### Obtener Códigos de Usuario

Método: <span style="color:green">GET</span>\
Endpoint: `/verification-codes/user/:userId`\
Headers: `Authorization: Bearer <token>`\
Roles permitidos: `admin` o el mismo usuario\
Parámetros: `userId` (número) - ID del usuario

Código de respuesta: `200`\
Response Body:

```json
{
    "type": "success",
    "message": "Códigos de verificación obtenidos correctamente",
    "data": [
        {
            "id": 123,
            "type": "verify",
            "used": false,
            "created_at": "2025-10-14T14:00:00Z",
            "expires_at": "2025-10-14T14:30:00Z"
        }
    ]
}
```

**Códigos de error:**

-   `400`: Parámetros inválidos
-   `401`: Token inválido o ausente
-   `403`: Sin permisos para ver códigos de otro usuario
-   `500`: Error interno del servidor

**Nota de seguridad:** Los códigos se almacenan hasheados con bcrypt en la base de datos. El campo `code` solo se devuelve al crear el código (para desarrollo). En producción, este código debe enviarse por email/SMS.

**Ver documentación completa:** [Códigos de Verificación](/docs/verification-codes.md)

```

```
