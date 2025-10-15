# Códigos de Verificación - Documentación

## Resumen

Se ha implementado un sistema completo para la gestión de códigos de verificación en el servicio `entities`. Este sistema permite crear, validar y consultar códigos de verificación para diferentes propósitos.

## Estructura de Base de Datos

### Tabla `verification_code`

- **id**: número (clave primaria)
- **code**: string (código hasheado con bcrypt)
- **type**: enum ("verify", "reset", "adoption")
- **user_id**: número (referencia a tabla users)
- **used**: boolean (indica si el código ya fue utilizado)
- **created_at**: timestamp (fecha de creación)
- **expires_at**: timestamp (fecha de expiración)

## Endpoints Implementados

### 1. Crear Código de Verificación
**POST** `/v1/entities/verification-codes`

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Body:**
```json
{
  "type": "verify" | "reset" | "adoption",
  "userId": number (opcional),
  "duration": number (opcional, minutos entre 1-1440)
}
```

**Duraciones por defecto:**
- `verify`: 30 minutos
- `reset`: 15 minutos  
- `adoption`: 24 horas

**Respuesta exitosa (201):**
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

### 2. Validar Código de Verificación
**POST** `/v1/entities/verification-codes/validate`

**Body:**
```json
{
  "code": "123456",
  "type": "verify" | "reset" | "adoption", 
  "userId": number
}
```

**Respuesta exitosa (200):**
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

### 3. Obtener Códigos de Usuario
**GET** `/v1/entities/verification-codes/user/{userId}`

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Respuesta exitosa (200):**
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

## Características de Seguridad

### 1. **Códigos Hasheados**
- Los códigos se almacenan hasheados con bcrypt (salt 10 rounds)
- Solo el código original se envía al usuario
- En producción, el código no debe devolverse en la respuesta

### 2. **Expiración Automática**
- Todos los códigos tienen tiempo de expiración
- Los códigos expirados se marcan automáticamente como usados
- Validación estricta de fechas de expiración

### 3. **Invalidación de Códigos Anteriores**
- Al crear un nuevo código, se invalidan todos los códigos anteriores del mismo tipo
- Previene el uso de códigos antiguos

### 4. **Validación Estricta**
- Códigos de exactamente 6 dígitos numéricos
- Validación de tipos permitidos
- Control de acceso por roles y ownership

## Manejo de Errores

### Errores Comunes

**400 - Bad Request:**
- Datos inválidos (formato, tipo, etc.)
- Código expirado
- Código ya utilizado
- Parámetros faltantes

**401 - Unauthorized:**
- Token faltante o inválido

**403 - Forbidden:**
- Sin permisos para acceder a códigos de otro usuario

**404 - Not Found:**
- Usuario no encontrado
- Código no encontrado

**500 - Internal Server Error:**
- Errores de base de datos
- Errores internos del servidor

## Pruebas

Se ha creado un script de prueba completo en:
`/apps/entities/test-verification-codes.js`

**Para ejecutar las pruebas:**
1. Configurar variables de entorno en el script
2. Iniciar el servicio entities
3. Ejecutar: `node test-verification-codes.js`

## Integración con API Gateway

La documentación OpenAPI está disponible en:
- Swagger UI del gateway
- Archivo de documentación: `/apps/gateway/src/docs/endpoints/verificationCodes.ts`

## Notas de Implementación

### Mejores Prácticas Aplicadas:
1. **Longitud de código**: 6 dígitos (balance entre seguridad y usabilidad)
2. **Almacenamiento**: Hasheado para mayor seguridad
3. **Expiración**: Diferenciada por tipo de uso
4. **Invalidación**: Automática de códigos anteriores
5. **Validación**: Robusta con Zod schemas
6. **Logging**: Errores registrados para debugging

### Consideraciones de Producción:
1. **Remover** el campo `code` de la respuesta de creación
2. **Implementar** envío de códigos por email/SMS
3. **Configurar** rate limiting para creación de códigos
4. **Monitorear** intentos de validación fallidos
5. **Implementar** cleanup automático de códigos expirados

## Tipos de Verificación

1. **"verify"** - Verificación de email/cuenta
2. **"reset"** - Reset de contraseña  
3. **"adoption"** - Confirmación de adopción

Cada tipo tiene duraciones y casos de uso específicos optimizados para su propósito.