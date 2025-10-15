# API - Endpoints de Noticias (News)

## Descripción General

Este documento describe los endpoints disponibles para la gestión de noticias en el sistema AyunPet. Las noticias permiten a los refugios y administradores compartir información sobre eventos, campañas y actualizaciones importantes con la comunidad.

**Base URL**: `http://localhost:5000/news`

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Endpoints Públicos](#endpoints-públicos)
   - [Obtener todas las noticias](#1-obtener-todas-las-noticias)
   - [Obtener noticia por ID](#2-obtener-noticia-por-id)
3. [Endpoints Protegidos](#endpoints-protegidos)
   - [Crear noticia](#3-crear-noticia)
   - [Actualizar noticia](#4-actualizar-noticia)
   - [Eliminar noticia](#5-eliminar-noticia)
   - [Eliminar imágenes de noticia](#6-eliminar-imágenes-de-noticia)
4. [Códigos de Estado](#códigos-de-estado)
5. [Tipos de Datos](#tipos-de-datos)

---

## Autenticación

Los endpoints protegidos requieren un token JWT válido en el header `Authorization`:

```
Authorization: Bearer <token>
```

### Permisos por Rol

- **Admin (rol 19)**: Acceso total a todos los endpoints
- **Shelter (rol 21)**: Puede crear, actualizar y eliminar sus propias noticias
- **User (rol 20)**: Solo puede ver noticias (endpoints públicos)

---

## Endpoints Públicos

### 1. Obtener todas las noticias

Obtiene una lista de todas las noticias ordenadas por fecha de creación (más recientes primero).

**Endpoint**: `GET /news`

**Autenticación**: No requerida

**Headers**:
```
Content-Type: application/json
```

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "success",
  "message": "Noticias obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "title": "Gran Evento de Adopción 2025",
      "description": "Únete a nuestro evento anual de adopción donde más de 100 mascotas buscan un hogar.",
      "creator_id": 2,
      "date": "2025-12-15",
      "start_time": "10:00:00",
      "end_time": "18:00:00",
      "status": "active",
      "created_at": "2025-10-14T10:30:00.000Z",
      "updated_at": "2025-10-14T10:30:00.000Z",
      "images": [
        "/uploads/news/1/image1.jpg",
        "/uploads/news/1/image2.jpg"
      ]
    },
    {
      "id": 2,
      "title": "Campaña de Vacunación Gratuita",
      "description": "Vacunación gratuita para todas las mascotas adoptadas en el último mes.",
      "creator_id": 2,
      "date": "2025-11-20",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "status": "active",
      "created_at": "2025-10-14T11:00:00.000Z",
      "updated_at": "2025-10-14T11:00:00.000Z",
      "images": []
    }
  ]
}
```

**Ejemplo de uso**:
```bash
curl -X GET "http://localhost:5000/news" \
  -H "Content-Type: application/json"
```

---

### 2. Obtener noticia por ID

Obtiene los detalles de una noticia específica.

**Endpoint**: `GET /news/:id`

**Autenticación**: No requerida

**Parámetros de URL**:
| Parámetro | Tipo    | Descripción                |
|-----------|---------|----------------------------|
| id        | integer | ID de la noticia a obtener |

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "success",
  "message": "Noticia obtenida exitosamente",
  "data": {
    "id": 1,
    "title": "Gran Evento de Adopción 2025",
    "description": "Únete a nuestro evento anual de adopción donde más de 100 mascotas buscan un hogar. Habrá actividades para toda la familia.",
    "creator_id": 2,
    "date": "2025-12-15",
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "status": "active",
    "created_at": "2025-10-14T10:30:00.000Z",
    "updated_at": "2025-10-14T10:30:00.000Z",
    "images": [
      "/uploads/news/1/image1.jpg",
      "/uploads/news/1/image2.jpg"
    ]
  }
}
```

**Respuesta de Error** (404 Not Found):
```json
{
  "status": "error",
  "message": "Noticia no encontrada",
  "data": {}
}
```

**Ejemplo de uso**:
```bash
curl -X GET "http://localhost:5000/news/1" \
  -H "Content-Type: application/json"
```

---

## Endpoints Protegidos

### 3. Crear noticia

Crea una nueva noticia con imágenes opcionales. Solo disponible para administradores y refugios.

**Endpoint**: `POST /news`

**Autenticación**: Requerida (Admin o Shelter)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parámetros de Form Data**:
| Parámetro   | Tipo     | Requerido | Descripción                                    |
|-------------|----------|-----------|------------------------------------------------|
| title       | string   | Sí        | Título de la noticia                           |
| description | string   | Sí        | Descripción detallada de la noticia            |
| creator_id  | integer  | Sí        | ID del usuario creador                         |
| date        | string   | No        | Fecha del evento (formato: YYYY-MM-DD)         |
| start_time  | string   | No        | Hora de inicio (formato: HH:MM:SS)             |
| end_time    | string   | No        | Hora de finalización (formato: HH:MM:SS)       |
| status      | string   | No        | Estado: "active", "inactive", "closed" (default: "active") |
| files       | file[]   | No        | Array de imágenes (máximo 10, 10MB cada una)   |

**Respuesta Exitosa** (201 Created):
```json
{
  "status": "success",
  "message": "Noticia creada exitosamente",
  "data": {
    "id": 3,
    "title": "Gran Evento de Adopción 2025",
    "description": "Únete a nuestro evento anual de adopción donde más de 100 mascotas buscan un hogar.",
    "creator_id": 2,
    "date": "2025-12-15",
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "status": "active",
    "created_at": "2025-10-14T12:00:00.000Z",
    "updated_at": "2025-10-14T12:00:00.000Z",
    "images": [
      {
        "url": "/uploads/news/3/1697280000000-image1.jpg",
        "fileName": "1697280000000-image1.jpg",
        "size": 245678,
        "mime": "image/jpeg"
      },
      {
        "url": "/uploads/news/3/1697280000001-image2.jpg",
        "fileName": "1697280000001-image2.jpg",
        "size": 198234,
        "mime": "image/jpeg"
      }
    ]
  }
}
```

**Respuesta de Error** (400 Bad Request):
```json
{
  "status": "error",
  "message": "title y description son campos requeridos",
  "data": {}
}
```

**Respuesta de Error** (403 Forbidden):
```json
{
  "status": "error",
  "message": "No tienes los permisos necesarios para acceder a este recurso",
  "data": {}
}
```

**Ejemplo de uso**:
```bash
curl -X POST "http://localhost:5000/news" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Gran Evento de Adopción 2025" \
  -F "description=Únete a nuestro evento anual de adopción" \
  -F "creator_id=2" \
  -F "date=2025-12-15" \
  -F "start_time=10:00:00" \
  -F "end_time=18:00:00" \
  -F "status=active" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

---

### 4. Actualizar noticia

Actualiza los datos de una noticia existente. Opcionalmente puede agregar nuevas imágenes.

**Endpoint**: `PUT /news/:id`

**Autenticación**: Requerida (Admin o Creador de la noticia)

**Parámetros de URL**:
| Parámetro | Tipo    | Descripción                   |
|-----------|---------|-------------------------------|
| id        | integer | ID de la noticia a actualizar |

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (si se envían imágenes)
Content-Type: application/json (si solo se actualizan datos)
```

**Parámetros del Body (JSON o Form Data)**:
| Parámetro   | Tipo    | Descripción                                    |
|-------------|---------|------------------------------------------------|
| title       | string  | Nuevo título de la noticia                     |
| description | string  | Nueva descripción                              |
| date        | string  | Nueva fecha del evento                         |
| start_time  | string  | Nueva hora de inicio                           |
| end_time    | string  | Nueva hora de finalización                     |
| status      | string  | Nuevo estado                                   |
| files       | file[]  | Nuevas imágenes a agregar (opcional)           |

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "success",
  "message": "Noticia actualizada exitosamente",
  "data": {
    "id": 1,
    "title": "Gran Evento de Adopción 2025 - ACTUALIZADO",
    "description": "Únete a nuestro evento anual de adopción ACTUALIZADO.",
    "creator_id": 2,
    "date": "2025-12-15",
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "status": "active",
    "created_at": "2025-10-14T10:30:00.000Z",
    "updated_at": "2025-10-14T13:00:00.000Z",
    "images": [
      "/uploads/news/1/image1.jpg",
      "/uploads/news/1/image2.jpg"
    ],
    "newImages": [
      {
        "url": "/uploads/news/1/1697284800000-newimage.jpg",
        "fileName": "1697284800000-newimage.jpg",
        "size": 156789,
        "mime": "image/jpeg"
      }
    ]
  }
}
```

**Respuesta de Error** (403 Forbidden):
```json
{
  "status": "error",
  "message": "No tienes permiso para actualizar esta noticia",
  "data": {}
}
```

**Respuesta de Error** (404 Not Found):
```json
{
  "status": "error",
  "message": "Noticia no encontrada",
  "data": {}
}
```

**Ejemplo de uso (JSON)**:
```bash
curl -X PUT "http://localhost:5000/news/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gran Evento de Adopción 2025 - ACTUALIZADO",
    "description": "Nueva descripción actualizada",
    "status": "active"
  }'
```

**Ejemplo de uso (con imágenes)**:
```bash
curl -X PUT "http://localhost:5000/news/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Evento Actualizado" \
  -F "files=@/path/to/newimage.jpg"
```

---

### 5. Eliminar noticia

Elimina una noticia y todas sus imágenes asociadas.

**Endpoint**: `DELETE /news/:id`

**Autenticación**: Requerida (Admin o Creador de la noticia)

**Parámetros de URL**:
| Parámetro | Tipo    | Descripción                 |
|-----------|---------|----------------------------|
| id        | integer | ID de la noticia a eliminar |

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "success",
  "message": "Noticia eliminada exitosamente",
  "data": {
    "id": 1,
    "deletedImages": 3
  }
}
```

**Respuesta de Error** (403 Forbidden):
```json
{
  "status": "error",
  "message": "No tienes permiso para eliminar esta noticia",
  "data": {}
}
```

**Respuesta de Error** (404 Not Found):
```json
{
  "status": "error",
  "message": "Noticia no encontrada",
  "data": {}
}
```

**Ejemplo de uso**:
```bash
curl -X DELETE "http://localhost:5000/news/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Eliminar imágenes de noticia

Elimina imágenes específicas de una noticia sin eliminar la noticia completa.

**Endpoint**: `DELETE /news/:id/images`

**Autenticación**: Requerida (Admin o Creador de la noticia)

**Parámetros de URL**:
| Parámetro | Tipo    | Descripción           |
|-----------|---------|----------------------|
| id        | integer | ID de la noticia     |

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros del Body**:
```json
{
  "fileNamesArray": ["1697280000000-image1.jpg", "1697280000001-image2.jpg"]
}
```

| Parámetro      | Tipo     | Descripción                                 |
|----------------|----------|---------------------------------------------|
| fileNamesArray | string[] | Array de nombres de archivos a eliminar     |

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "success",
  "message": "Imágenes eliminadas exitosamente",
  "data": {
    "deleted": ["1697280000000-image1.jpg", "1697280000001-image2.jpg"],
    "notFound": []
  }
}
```

**Respuesta de Error** (400 Bad Request):
```json
{
  "status": "error",
  "message": "fileNamesArray debe ser un array con al menos un elemento",
  "data": {}
}
```

**Respuesta de Error** (403 Forbidden):
```json
{
  "status": "error",
  "message": "No tienes permiso para eliminar imágenes de esta noticia",
  "data": {}
}
```

**Ejemplo de uso**:
```bash
curl -X DELETE "http://localhost:5000/news/1/images" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileNamesArray": ["1697280000000-image1.jpg"]
  }'
```

---

## Códigos de Estado

| Código | Descripción                                           |
|--------|-------------------------------------------------------|
| 200    | OK - Operación exitosa                                |
| 201    | Created - Recurso creado exitosamente                 |
| 400    | Bad Request - Error en los parámetros de la petición  |
| 401    | Unauthorized - Token inválido o no proporcionado      |
| 403    | Forbidden - No tienes permisos para esta operación    |
| 404    | Not Found - Recurso no encontrado                     |
| 500    | Internal Server Error - Error del servidor            |

---

## Tipos de Datos

### News Object

```typescript
{
  id: number
  title: string | null
  description: string | null
  creator_id: number | null
  date: string | null          // Formato: YYYY-MM-DD
  start_time: string | null    // Formato: HH:MM:SS
  end_time: string | null      // Formato: HH:MM:SS
  status: "active" | "inactive" | "closed" | null
  created_at: string | null    // Formato ISO 8601
  updated_at: string | null    // Formato ISO 8601
  images?: string[]            // Array de URLs de imágenes
}
```

### Status Enum

- `active`: Noticia activa y visible
- `inactive`: Noticia inactiva (no visible públicamente)
- `closed`: Evento finalizado

---

## Integración con Media Service

Las imágenes de las noticias se almacenan en el servicio de Media (`http://localhost:7000`) y se pueden acceder directamente:

**Obtener imágenes de una noticia**:
```bash
GET http://localhost:7000/uploads/news/:newsId
```

**Eliminar imágenes**:
```bash
DELETE http://localhost:7000/uploads/news/:newsId
Content-Type: application/json
{
  "fileNamesArray": ["filename1.jpg", "filename2.jpg"]
}
```

---

## Notas Importantes

1. **Límites de Imágenes**:
   - Máximo 10 imágenes por petición
   - Tamaño máximo por imagen: 10MB
   - Solo se aceptan archivos de tipo `image/*`

2. **Control de Acceso**:
   - Los usuarios normales (rol 20) solo pueden ver noticias
   - Los refugios (rol 21) pueden crear y gestionar sus propias noticias
   - Los administradores (rol 19) tienen acceso total

3. **Eliminación en Cascada**:
   - Al eliminar una noticia, todas sus imágenes se eliminan automáticamente del servicio de media

4. **Actualización de Imágenes**:
   - Para reemplazar imágenes, primero elimínalas con `DELETE /news/:id/images` y luego agrega nuevas con `PUT /news/:id`

---

## Ejemplos de Flujo Completo

### Crear una noticia completa con imágenes

```bash
# 1. Login para obtener token
TOKEN=$(curl -s -X POST "http://localhost:4000/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# 2. Crear noticia con imágenes
curl -X POST "http://localhost:5000/news" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Evento de Adopción Masiva" \
  -F "description=Más de 100 mascotas buscan hogar" \
  -F "creator_id=1" \
  -F "date=2025-12-15" \
  -F "start_time=10:00:00" \
  -F "end_time=18:00:00" \
  -F "status=active" \
  -F "files=@./imagen1.jpg" \
  -F "files=@./imagen2.jpg"
```

### Actualizar y gestionar imágenes

```bash
# 1. Actualizar información de la noticia
curl -X PUT "http://localhost:5000/news/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evento de Adopción - ACTUALIZADO",
    "description": "Nueva descripción con más detalles"
  }'

# 2. Eliminar una imagen específica
curl -X DELETE "http://localhost:5000/news/1/images" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileNamesArray": ["old-image.jpg"]}'

# 3. Agregar nuevas imágenes
curl -X PUT "http://localhost:5000/news/1" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@./new-image.jpg"
```

---

## Contacto y Soporte

Para más información sobre la API, consulta la documentación principal en `/docs/api.md`.
