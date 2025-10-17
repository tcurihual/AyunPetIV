# API de Publicaciones Guardadas

Esta documentación describe los endpoints disponibles para gestionar las publicaciones guardadas por los usuarios en el sistema Ayün Pet.

## Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer token en el header `Authorization`:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Listar Publicaciones Guardadas

```http
GET /v1/adoptions/saved-posts
```

**Descripción:** Obtiene la lista paginada de publicaciones guardadas por el usuario autenticado.

**Parámetros de Query:**

-   `page` (opcional): Número de página (por defecto: 1)
-   `pageSize` (opcional): Tamaño de página (por defecto: 10, máximo: 50)

**Respuesta Exitosa (200):**

```json
{
    "success": true,
    "message": "Listado de publicaciones guardadas",
    "data": {
        "items": [
            {
                "id": 1,
                "post_id": 10,
                "user_id": 5,
                "post": {
                    "id": 10,
                    "title": "Hermoso golden retriever busca hogar",
                    "description": "Max es un perro muy cariñoso...",
                    "status": "ACTIVE",
                    "created_at": "2024-01-15T10:00:00Z",
                    "updated_at": null,
                    "creator_id": 3,
                    "pet_id": 8,
                    "pet": {
                        "id": 8,
                        "name": "Max",
                        "species": "Perro",
                        "gender": "Macho",
                        "age_years": 3,
                        "age_months": 0,
                        "size": "Grande",
                        "sterilized": true,
                        "owner_id": 3,
                        "created_at": "2024-01-15T10:00:00Z",
                        "updated_at": null
                    }
                }
            }
        ],
        "total": 5,
        "page": 1,
        "pageSize": 10,
        "totalPages": 1
    }
}
```

**Errores:**

-   `401`: No autenticado
-   `500`: Error interno del servidor

---

### 2. Obtener Publicación Guardada por ID

```http
GET /v1/adoptions/saved-posts/{id}
```

**Descripción:** Obtiene una publicación guardada específica por su ID.

**Parámetros de Ruta:**

-   `id`: ID de la publicación guardada

**Respuesta Exitosa (200):**

```json
{
    "success": true,
    "message": "Publicación guardada",
    "data": {
        "id": 1,
        "post_id": 10,
        "user_id": 5,
        "post": {
            "id": 10,
            "title": "Hermoso golden retriever busca hogar",
            "description": "Max es un perro muy cariñoso...",
            "status": "ACTIVE",
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": null,
            "creator_id": 3,
            "pet_id": 8,
            "pet": {
                "id": 8,
                "name": "Max",
                "species": "Perro",
                "gender": "Macho",
                "age": 3,
                "size": "Grande",
                "sterilized": true,
                "owner_id": 3,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": null
            }
        }
    }
}
```

**Errores:**

-   `401`: No autenticado
-   `403`: No autorizado para acceder a esta publicación guardada
-   `404`: Publicación guardada no encontrada

---

### 3. Verificar Estado de Publicación Guardada

```http
GET /v1/adoptions/saved-posts/check/{postId}
```

**Descripción:** Verifica si una publicación específica está guardada por el usuario autenticado.

**Parámetros de Ruta:**

-   `postId`: ID de la publicación a verificar

**Respuesta Exitosa (200):**

```json
{
    "success": true,
    "message": "Estado de guardado verificado",
    "data": {
        "is_saved": true,
        "saved_post_id": 1
    }
}
```

**Errores:**

-   `401`: No autenticado
-   `500`: Error interno del servidor

---

### 4. Guardar Publicación

```http
POST /v1/adoptions/saved-posts
```

**Descripción:** Guarda una publicación para el usuario autenticado.

**Cuerpo de la Petición:**

```json
{
    "post_id": 10
}
```

**Respuesta Exitosa (201):**

```json
{
    "success": true,
    "message": "Publicación guardada exitosamente",
    "data": {
        "id": 1,
        "post_id": 10,
        "user_id": 5
    }
}
```

**Errores:**

-   `400`: Datos inválidos o intento de guardar publicación propia
-   `401`: No autenticado
-   `404`: Publicación no encontrada
-   `409`: La publicación ya está guardada

**Validaciones:**

-   El `post_id` debe existir en el sistema
-   Un usuario no puede guardar sus propias publicaciones
-   No se puede guardar la misma publicación dos veces

---

### 5. Eliminar Publicación Guardada por ID

```http
DELETE /v1/adoptions/saved-posts/{id}
```

**Descripción:** Elimina una publicación guardada por su ID único.

**Parámetros de Ruta:**

-   `id`: ID de la publicación guardada

**Respuesta Exitosa (200):**

```json
{
    "success": true,
    "message": "Publicación eliminada de guardados",
    "data": {
        "id": 1,
        "post_id": 10,
        "user_id": 5
    }
}
```

**Errores:**

-   `401`: No autenticado
-   `403`: No autorizado para eliminar esta publicación guardada
-   `404`: Publicación guardada no encontrada

---

### 6. Eliminar Publicación Guardada por Post ID

```http
DELETE /v1/adoptions/saved-posts/post/{postId}
```

**Descripción:** Elimina una publicación guardada usando el ID de la publicación original.

**Parámetros de Ruta:**

-   `postId`: ID de la publicación original

**Respuesta Exitosa (200):**

```json
{
    "success": true,
    "message": "Publicación eliminada de guardados",
    "data": {
        "id": 1,
        "post_id": 10,
        "user_id": 5
    }
}
```

**Errores:**

-   `401`: No autenticado
-   `404`: Publicación guardada no encontrada

---

## Casos de Uso

### Guardar una Publicación

1. El usuario ve una publicación que le interesa
2. Hace clic en "Guardar"
3. La aplicación envía `POST /v1/adoptions/saved-posts` con el `post_id`
4. El sistema valida que la publicación existe y no es del mismo usuario
5. Se crea el registro en la tabla `saved_post`

### Ver Publicaciones Guardadas

1. El usuario accede a su lista de publicaciones guardadas
2. La aplicación solicita `GET /v1/adoptions/saved-posts`
3. El sistema retorna todas las publicaciones guardadas del usuario con información completa

### Verificar si una Publicación está Guardada

1. Al mostrar una publicación, la aplicación verifica si está guardada
2. Envía `GET /v1/adoptions/saved-posts/check/{postId}`
3. Usa la respuesta para mostrar el estado correcto del botón guardar/no guardar

### Quitar de Guardados

1. El usuario decide quitar una publicación de sus guardados
2. La aplicación puede usar cualquiera de los dos endpoints de eliminación:
    - `DELETE /v1/adoptions/saved-posts/{id}` si tiene el ID del saved_post
    - `DELETE /v1/adoptions/saved-posts/post/{postId}` si solo tiene el ID de la publicación

## Seguridad y Permisos

-   **Autenticación requerida**: Todos los endpoints requieren JWT válido
-   **Autorización por propietario**: Los usuarios solo pueden acceder a sus propias publicaciones guardadas
-   **Validación de propiedad**: No se permite guardar publicaciones propias
-   **Roles permitidos**: USER (20), SHELTER (21), ADMIN (19)
-   **Acceso de administrador**: Los administradores pueden acceder a cualquier publicación guardada

## Consideraciones Técnicas

-   **Paginación**: Implementada en el listado con límite máximo de 50 elementos por página
-   **Relaciones**: Los datos incluyen información completa de la publicación y mascota asociada
-   **Índices**: La tabla está optimizada para consultas por `user_id` y `post_id`
-   **Duplicados**: Se previene la creación de registros duplicados mediante validación en el controlador
