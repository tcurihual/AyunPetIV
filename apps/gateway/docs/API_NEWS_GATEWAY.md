# API Gateway - Endpoints de Noticias

## Acceso a través del API Gateway

Todos los endpoints de noticias están disponibles a través del API Gateway en:

**Base URL**: `http://localhost:3000/v1/entities/news`

## Rutas Disponibles

### Rutas Públicas (sin autenticación)

- **GET** `/v1/entities/news` - Obtener todas las noticias
- **GET** `/v1/entities/news/:id` - Obtener una noticia específica

### Rutas Protegidas (requieren autenticación)

- **POST** `/v1/entities/news` - Crear nueva noticia (Admin/Shelter)
- **PUT** `/v1/entities/news/:id` - Actualizar noticia (Admin/Creador)
- **DELETE** `/v1/entities/news/:id` - Eliminar noticia (Admin/Creador)
- **DELETE** `/v1/entities/news/:id/images` - Eliminar imágenes específicas (Admin/Creador)

## Ejemplos de Uso

### 1. Obtener todas las noticias

```bash
curl -X GET "http://localhost:3000/v1/entities/news" \
  -H "Content-Type: application/json"
```

### 2. Crear nueva noticia con imágenes

```bash
# Primero obtener token
TOKEN=$(curl -s -X POST "http://localhost:3000/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# Crear noticia
curl -X POST "http://localhost:3000/v1/entities/news" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Gran Evento de Adopción 2025" \
  -F "description=Únete a nuestro evento anual" \
  -F "creator_id=1" \
  -F "date=2025-12-15" \
  -F "start_time=10:00:00" \
  -F "end_time=18:00:00" \
  -F "status=active" \
  -F "files=@./image1.jpg" \
  -F "files=@./image2.jpg"
```

### 3. Actualizar noticia

```bash
curl -X PUT "http://localhost:3000/v1/entities/news/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evento Actualizado",
    "description": "Nueva descripción",
    "status": "active"
  }'
```

### 4. Eliminar noticia

```bash
curl -X DELETE "http://localhost:3000/v1/entities/news/1" \
  -H "Authorization: Bearer $TOKEN"
```

## Permisos por Rol

- **Admin (rol 19)**: Acceso total
- **Shelter (rol 21)**: Puede crear y gestionar sus propias noticias
- **User (rol 20)**: Solo puede visualizar noticias (rutas públicas)

## Documentación Completa

Para más detalles sobre los parámetros, respuestas y casos de uso, consulta:
- [Documentación completa de News API](/docs/api-news.md)
- [Documentación general de API](/docs/api.md)

## Notas Importantes

1. El API Gateway maneja automáticamente la autenticación mediante el middleware `verifyAuth`
2. Los headers de usuario (`x-user-id` y `x-user-role`) se inyectan automáticamente en las peticiones a los microservicios
3. El timeout de proxy está configurado en 5000ms para el servicio de entities
