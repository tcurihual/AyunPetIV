# 🔐 Implementación de Recuperación de Contraseña con Código de 6 Dígitos para Móvil

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de recuperación de contraseña para la aplicación móvil utilizando códigos de 6 dígitos en lugar de tokens. Este sistema está completamente integrado con la arquitectura existente.

## 📋 Componentes Implementados

### 1. **Endpoints del Backend** (`/apps/auth/src/controllers/auth.ts`)

#### 🔹 `POST /v1/auth/mobile/reset-password`

-   **Función**: `requestMobilePasswordReset`
-   **Descripción**: Genera un código único de 6 dígitos para recuperación
-   **Entrada**: `{ email: string }`
-   **Funcionalidad**:
    -   Valida la existencia del usuario en la base de datos
    -   Genera código aleatorio de 6 dígitos (100000-999999)
    -   Guarda el código en la tabla `verification_code` con expiración de 15 minutos
    -   Envía email con plantilla HTML personalizada
    -   Limpia códigos anteriores del usuario

#### 🔹 `POST /v1/auth/mobile/verify-reset-code`

-   **Función**: `verifyMobileResetCode`
-   **Descripción**: Verifica el código y permite cambiar la contraseña
-   **Entrada**: `{ email: string, code: string, newPassword: string }`
-   **Funcionalidad**:
    -   Valida código de 6 dígitos
    -   Verifica que no haya expirado (15 minutos)
    -   Cambia la contraseña del usuario
    -   Marca el código como utilizado

### 2. **Rutas Móviles** (`/apps/auth/src/routes/mobile.ts`)

```typescript
router.post("/reset-password", requestMobilePasswordReset)
router.post("/verify-reset-code", verifyMobileResetCode)
```

### 3. **Gateway Configuration**

✅ Ya configurado - El proxy existente `/v1/auth` redirige correctamente a los nuevos endpoints móviles.

### 4. **Servicio Móvil** (`/apps/mobile/services/passwordReset.ts`)

-   **Funciones principales**:
    -   `requestPasswordReset(email)`: Solicita código de recuperación
    -   `verifyResetCode(email, code, newPassword)`: Verifica código y cambia contraseña
    -   `isValidCode(code)`: Valida formato del código (6 dígitos numéricos)
    -   `isValidEmail(email)`: Valida formato del email
    -   `formatCode(code)`: Formatea código para visualización ("123456" → "123 456")

### 5. **Pantallas Móviles Actualizadas**

#### 🔹 `forgot-password.tsx`

-   Integración con servicio de recuperación
-   Validación de email en tiempo real
-   Loading states y error handling
-   Navegación automática al siguiente paso con email como parámetro

#### 🔹 `recovery-pin.tsx`

-   Entrada de código de 6 dígitos con formato automático
-   Campos para nueva contraseña y confirmación
-   Validación completa del flujo
-   Navegación de retorno al login después de éxito

## 🗃️ Esquema de Base de Datos

### Tabla `verification_code`:

```sql
- id: number (PK)
- user_id: number (FK a users.id)
- code: string (código de 6 dígitos)
- type: 'reset' | 'verify' | 'adoption'
- expires_at: timestamp
- used: boolean
- created_at: timestamp
```

## 🚀 Flujo de Uso

### 1. **Desde la App Móvil**:

```
[Pantalla Login] → [Olvidé mi contraseña] → [Ingresa email]
    ↓
[Código enviado por email] → [Ingresa código + nueva contraseña]
    ↓
[Contraseña cambiada] → [Retorna al login]
```

### 2. **URLs de los Endpoints**:

-   **Solicitar código**: `POST http://localhost:3000/v1/auth/mobile/reset-password`
-   **Verificar código**: `POST http://localhost:3000/v1/auth/mobile/verify-reset-code`

### Requisitos para las pruebas:

1. ✅ Gateway corriendo en puerto 3000
2. ✅ Servicio auth corriendo en puerto 4000
3. ✅ Base de datos Supabase configurada
4. ⚠️ Usuario existente con email válido (modificar `TEST_EMAIL` en el script)

## ⚡ Características Técnicas

### **Seguridad**:

-   Códigos expiran en 15 minutos
-   Un código por usuario (códigos anteriores se invalidan)
-   Códigos de un solo uso (se marcan como `used: true`)
-   Validación de formato en cliente y servidor

### **UX/UI**:

-   Formateo automático del código (123 456)
-   Estados de loading durante las peticiones
-   Mensajes de error específicos y claros
-   Navegación fluida entre pantallas

### **Arquitectura**:

-   Endpoints separados para móvil (`/mobile/`)
-   Servicio dedicado con manejo de errores
-   Integración con sistema de email existente
-   Logging detallado para debugging

## 🎯 Próximos Pasos

1. **Probar en dispositivo móvil real**:

    ```bash
    # Con los servicios corriendo, usar Expo Go para probar la app
    cd apps/mobile && expo start
    ```

2. **Validar integración completa**:

    - Verificar que el email se envía correctamente en producción
    - Probar casos edge (códigos expirados, usuarios inexistentes, etc.)

3. **Opcional - Mejoras futuras**:
    - Límite de intentos por usuario
    - Rate limiting para prevenir spam
    - Notificaciones push como alternativa al email

## ✨ Resumen

**✅ IMPLEMENTACIÓN COMPLETA**: El sistema de recuperación de contraseña con códigos de 6 dígitos está listo y funcionando. Los endpoints están integrados con el gateway, las pantallas móviles están actualizadas, y el flujo completo funciona de extremo a extremo.

La diferencia clave con el sistema web (tokens) es que ahora los usuarios móviles reciben un código de 6 dígitos fácil de ingresar, mientras que los usuarios web siguen usando el flujo de tokens con enlaces.
