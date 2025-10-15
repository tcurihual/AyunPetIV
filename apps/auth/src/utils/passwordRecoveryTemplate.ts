export const passwordRecoveryTemplate = (data: PasswordRecoveryData): string => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña - AyünPet</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #11181C;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #F9C53D;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .lock-icon {
            font-size: 48px;
            color: #F9C53D;
            margin-bottom: 10px;
        }
        h1 {
            color: #F9C53D;
            margin: 0;
            font-size: 28px;
        }
        .recovery-info {
            background: #FFF9E6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #F9C53D;
        }
        .recovery-code {
            background: #FFF9E6;
            border: 2px solid #F9C53D;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        .code {
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #D4A017;
            letter-spacing: 4px;
            margin: 10px 0;
        }
        .web-option {
            background: #E6F3FF;
            border-left: 4px solid #0a7ea4;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .web-button {
            display: inline-block;
            background: #0a7ea4;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 15px 0;
            font-weight: bold;
            text-align: center;
        }
        .web-button:hover {
            background: #085a7a;
        }
        .warning {
            background: #FFE6E6;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .expiration-warning {
            background: #FFF3CD;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-tips {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #687076;
            font-size: 14px;
        }
        .contact-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
        strong {
            color: #11181C;
        }
        .timer-icon {
            color: #ffc107;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="lock-icon">🔐</div>
            <h1>Recuperación de Contraseña</h1>
            <p>Solicitud de restablecimiento de contraseña</p>
        </div>

        <p>Hola <strong>${data.user.name}</strong>,</p>
        
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en AyünPet. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>

        <div class="recovery-info">
            <h3>📧 Información de la Solicitud</h3>
            <ul>
                <li><strong>Usuario:</strong> ${data.user.name}</li>
                <li><strong>Email:</strong> ${data.user.email}</li>
                <li><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString("es-ES", {
                    timeZone: "America/Santiago",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}</li>
            </ul>
        </div>

        <div class="recovery-code">
            <h3>🔢 Código de Recuperación</h3>
            <p>Utiliza este código para restablecer tu contraseña:</p>
            <div class="code">${data.recoveryCode}</div>
            <p><small>Ingresa este código en la aplicación móvil o en nuestra página web.</small></p>
        </div>

        <div class="web-option">
            <h3>🌐 Opción Alternativa - Recuperación Web</h3>
            <p>También puedes restablecer tu contraseña directamente desde nuestro sitio web haciendo clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
                <a href="${data.webUrl}/reset-password?token=${data.token}" class="web-button">
                    Restablecer Contraseña en Web
                </a>
            </div>
            
            <p><small><strong>Nota:</strong> Este enlace incluye tu token de seguridad y te permitirá restablecer tu contraseña directamente en el navegador.</small></p>
        </div>

        <div class="expiration-warning">
            <h3><span class="timer-icon">⏰</span> TIEMPO LÍMITE</h3>
            <p><strong>Este código y enlace son válidos por ${
                data.expirationMinutes
            } minutos solamente.</strong></p>
            <p>Por seguridad, tanto el código como el enlace web expirarán automáticamente después de este tiempo. Si necesitas un nuevo código, deberás solicitar otro restablecimiento de contraseña.</p>
        </div>

        <div class="warning">
            <h3>⚠️ IMPORTANTE - Seguridad</h3>
            <p><strong>NO COMPARTAS</strong> este código ni enlace con nadie más. Estos datos son personales e intransferibles:</p>
            <ul>
                <li>Solo tú debes usar este código de recuperación</li>
                <li>Nunca compartas tu token de seguridad</li>
                <li>El enlace web contiene información sensible de tu cuenta</li>
                <li>Si recibes este correo sin haberlo solicitado, contacta a soporte inmediatamente</li>
            </ul>
        </div>

        <div class="security-tips">
            <h3>🛡️ Consejos de Seguridad</h3>
            <p>Para mantener tu cuenta segura, te recomendamos:</p>
            <ul>
                <li><strong>Crear una contraseña fuerte:</strong> Usa al menos 8 caracteres, incluyendo números y símbolos</li>
                <li><strong>No reutilizar contraseñas:</strong> Usa una contraseña única para AyünPet</li>
                <li><strong>Mantener tu email seguro:</strong> Asegúrate de que tu correo electrónico también esté protegido</li>
                <li><strong>Cerrar sesiones:</strong> Cierra sesión en dispositivos compartidos</li>
            </ul>
        </div>

        <div class="contact-info">
            <h3>🆘 ¿Necesitas Ayuda?</h3>
            <p>Si tienes problemas para restablecer tu contraseña o no solicitaste este cambio:</p>
            <p>✉️ <strong>Contacta a soporte:</strong> soporte@ayunpet.com</p>
            <p><em>Nuestro equipo de seguridad está disponible para ayudarte en cualquier momento.</em></p>
        </div>

        <div class="footer">
            <p>Cuidando la seguridad de nuestra comunidad,<br>
            <strong>El equipo de AyünPet 🐾</strong></p>
            <p><small>Este es un correo automático de seguridad. No respondas a esta dirección. Para soporte, usa soporte@ayunpet.com</small></p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export const passwordRecoverySubject = (userName: string): string => {
    return `🔐 Código de recuperación de contraseña - AyünPet`
}
