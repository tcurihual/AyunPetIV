# 📧 Sistema de Email - Ayün Pet

## 📋 Estado Actual

El sistema de email está **completamente implementado y funcionando** con **Ethereal Email** para testing.

### ✅ Implementación Actual

**Servicio:** `packages/utils/src/email/index.ts`

- ✅ Nodemailer configurado
- ✅ Template HTML profesional para validación de cuentas
- ✅ Soporte para múltiples proveedores SMTP
- ✅ Manejo de errores robusto

**Configuración Actual (Ethereal - Testing):**
```env
# En archivo .env (raíz del proyecto)
NODE_ENV=development
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vena7@ethereal.email
SMTP_PASS=KNJ2yRP5x16YK7EDmY
FROM_EMAIL=vena7@ethereal.email
FROM_NAME="Ayün Pet"
WEB_URL=http://localhost:5173
```

### 📧 Correos Implementados

#### 1. Validación de Cuenta de Dador
**Función:** `sendAccountValidationEmail(email, userName)`

**Se envía cuando:** Un administrador valida la cuenta de un dador de mascotas

**Contenido:**
- Header amarillo con branding (#FFD24C)
- Mensaje de bienvenida personalizado
- Lista de permisos desbloqueados
- Botón CTA para iniciar sesión
- Footer profesional

**Integrado en:** `apps/entities/src/controllers/giverRequests.ts` → `validateGiverAccount()`


---

## 🚀 Migración a Gmail (Producción Futura)

### Paso 1: Habilitar Gmail para Aplicaciones

1. Ve a https://myaccount.google.com/security
2. Activa **"Verificación en 2 pasos"**
3. Ve a https://myaccount.google.com/apppasswords
4. Crea una **contraseña de aplicación** para "Mail"
5. Copia la contraseña generada (16 caracteres sin espacios)

### Paso 2: Actualizar Variables de Entorno

En tu archivo `.env`:

```env
# Cambiar estas variables:
SMTP_HOST=smtp.gmail.com          # ← Cambiar de smtp.ethereal.email
SMTP_PORT=587                     # ← Mismo puerto
SMTP_SECURE=false                 # ← Mantener false
SMTP_USER=tu-email@gmail.com      # ← Tu email de Gmail
SMTP_PASS=xxxx xxxx xxxx xxxx     # ← Contraseña de aplicación de 16 caracteres
FROM_EMAIL=tu-email@gmail.com     # ← Tu email de Gmail
FROM_NAME="Ayün Pet"              # ← Mantener igual
WEB_URL=https://tudominio.com     # ← URL de producción
```

### Paso 3: Reiniciar Servicios

```bash
# Detener servicios
Ctrl+C

# Reiniciar con nuevas credenciales
pnpm run api
```

### Paso 4: Probar

Valida una cuenta de prueba y verifica que el correo llegue al buzón real del usuario.

---

## 🔄 Otros Proveedores SMTP (Alternativas)

Si Gmail no es suficiente, puedes usar servicios profesionales:

### SendGrid (Recomendado para producción)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.tu-api-key-de-sendgrid
FROM_EMAIL=noreply@tudominio.com
```
**Ventajas:** 100 emails/día gratis, analytics, templates

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu-password-de-mailgun
FROM_EMAIL=noreply@tudominio.com
```
**Ventajas:** 5,000 emails/mes gratis

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu-access-key-id
SMTP_PASS=tu-secret-access-key
FROM_EMAIL=verificado@tudominio.com
```
**Ventajas:** $0.10 por 1,000 emails, escalable

---

## 🔧 Mantenimiento

### Agregar Nuevos Templates de Email

Para agregar un nuevo tipo de correo, edita `packages/utils/src/email/index.ts`:

```typescript
export const sendNuevoTipoEmail = async (
    email: string,
    data: any
): Promise<boolean> => {
    const subject = "Tu asunto aquí"
    
    const html = `
        <!-- Tu HTML aquí -->
    `
    
    const text = `
        Tu texto plano aquí
    `
    
    return sendEmail({ to: email, subject, html, text })
}
```

Luego intégralo en el controlador correspondiente.

### Verificar Logs

En el terminal donde corre `pnpm run api`, busca:

```
✅ Email enviado exitosamente a usuario@example.com
📧 Message ID: <xxx@ethereal.email>
📧 Correo de validación enviado a usuario@example.com
```

Si algo falla:
```
⚠️ No se pudo enviar el correo de validación: Error message
```

---

## 📊 Límites de Envío

| Proveedor | Límite Gratuito | Costo Adicional |
|-----------|-----------------|-----------------|
| **Ethereal** | ∞ (no envía realmente) | N/A |
| **Gmail** | 500/día | N/A |
| **SendGrid** | 100/día | $19.95/mes (40k emails) |
| **Mailgun** | 5,000/mes | $35/mes (50k emails) |
| **Amazon SES** | 62,000/mes (con EC2) | $0.10/1,000 emails |

---

## 🆘 Troubleshooting

### Error: "Invalid login" (Gmail)
- Verifica que uses contraseña de **aplicación**, no tu contraseña normal
- Confirma que la verificación en 2 pasos esté activa

### Correos van a Spam
- Configura registros SPF y DKIM en tu dominio
- Usa un dominio verificado (ej: noreply@tudominio.com)
- Considera usar SendGrid o Mailgun que manejan esto automáticamente

### Error de conexión
- Verifica que el puerto 587 no esté bloqueado por firewall
- Confirma tu conexión a internet
