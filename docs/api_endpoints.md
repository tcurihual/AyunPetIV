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
