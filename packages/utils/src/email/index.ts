import nodemailer from "nodemailer"

// Configuración del transporter
const createTransporter = () => {
    const isDevelopment = process.env.NODE_ENV !== "production"

    if (isDevelopment) {
        // Configuración para desarrollo (puedes usar Gmail o Ethereal)
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || "",
                pass: process.env.SMTP_PASS || "",
            },
        })
    }

    // Producción: configurar según el servicio de email
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
}

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

/**
 * Envía un correo electrónico
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const transporter = createTransporter()

        const fromEmail = process.env.FROM_EMAIL || "noreply@ayunpet.com"
        const fromName = process.env.FROM_NAME || "Ayün Pet"

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || "",
            html: options.html,
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`✅ Email enviado exitosamente a ${options.to}`)
        console.log(`📧 Message ID: ${info.messageId}`)

        return true
    } catch (error) {
        console.error("❌ Error al enviar email:", error)
        return false
    }
}

/**
 * Template de correo para cuenta validada
 */
export const sendAccountValidationEmail = async (
    email: string,
    userName: string
): Promise<boolean> => {
    const subject = "✅ Tu cuenta ha sido validada - Ayün Pet"

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta Validada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header con color amarillo característico -->
                    <tr>
                        <td style="background-color: #FFD24C; padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold;">
                                🎉 ¡Cuenta Validada!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Contenido -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333; line-height: 1.6;">
                            <p style="margin: 0 0 20px 0; font-size: 16px;">
                                Hola <strong>${userName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px;">
                                Nos complace informarte que tu cuenta de <strong>dador de mascotas</strong> ha sido 
                                <span style="color: #4CAF50; font-weight: bold;">validada exitosamente</span> por nuestro equipo de administración.
                            </p>
                            
                            <div style="background-color: #f9f9f9; border-left: 4px solid #FFD24C; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333333;">Ahora puedes:</p>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li style="margin: 5px 0;">✅ Publicar mascotas para adopción</li>
                                    <li style="margin: 5px 0;">✅ Gestionar tus publicaciones</li>
                                    <li style="margin: 5px 0;">✅ Recibir solicitudes de adopción</li>
                                    <li style="margin: 5px 0;">✅ Conectar con adoptantes potenciales</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 20px 0; font-size: 16px;">
                                Gracias por ser parte de nuestra comunidad y ayudarnos a encontrar hogares amorosos 
                                para las mascotas que tanto lo necesitan. 🐾
                            </p>
                            
                            <!-- Botón de acción -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${
                                            process.env.WEB_URL || "https://ayunpet.com"
                                        }/login" 
                                           style="display: inline-block; padding: 15px 40px; background-color: #4CAF50; 
                                                  color: #ffffff; text-decoration: none; border-radius: 5px; 
                                                  font-weight: bold; font-size: 16px;">
                                            Iniciar Sesión
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0 0; font-size: 16px;">
                                Si tienes alguna pregunta, no dudes en contactarnos.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; font-size: 16px;">
                                Saludos cordiales,<br>
                                <strong>El equipo de Ayün Pet</strong> 🐕🐈
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; 
                                   border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666666;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #666666;">
                                &copy; 2025 Ayün Pet. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `

    const text = `
Hola ${userName},

¡Tu cuenta de dador de mascotas ha sido validada exitosamente!

Ahora puedes:
- Publicar mascotas para adopción
- Gestionar tus publicaciones
- Recibir solicitudes de adopción
- Conectar con adoptantes potenciales

Inicia sesión en: ${process.env.WEB_URL || "https://ayunpet.com"}/login

Gracias por ser parte de Ayün Pet y ayudarnos a encontrar hogares amorosos para las mascotas.

Saludos cordiales,
El equipo de Ayün Pet
    `

    return sendEmail({ to: email, subject, html, text })
}
