import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { supabase } from "../"
import {
    AppError,
    AppResponse,
    comparePassword,
    User,
    generateAuthToken,
    hashPassword,
    sendEmail,
    JWT_SECRET,
    WEB_URL,
} from "@repo/utils"

import { emailTemplate } from "../utils/templates/emailVerificationTemplate"
import { resetPasswordTemplate } from "../utils/templates/resetPasswordTemplate"
import { sendAccountRequestDocuments, sendProfilePicture } from "../middleware/mediaProxy"

type Variation = "user" | "giver" | "shelter"

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === "string") return err
    if (typeof err === "object" && err !== null && "message" in err) {
        try {
            return (err as any).message
        } catch {
            return JSON.stringify(err)
        }
    }
    return String(err)
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) throw new AppError(404, "Faltan crendenciales")

    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()
    if (error || !user) throw new AppError(404, "El usuario no existe")

    if (user.validated === false) {
        console.log(`🔒 [login] Intento de login de usuario no validado: ${email}`)
        throw new AppError(401, "El usuario no ha validado su correo. Revisa tu email.")
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) throw new AppError(401, "Datos ingresados no son validos")

    const payload = {
        id: user.id,
        role: user.role,
    }
    const token = generateAuthToken(payload)
    if (!token) throw new AppError(500, "Ocurrio un error inesperado")

    const { password: _, ...publicUser } = user

    return AppResponse(res, 200, "Inicio de sesión exitoso", { user: publicUser, token })
}

export const register = async (
    req: Request<{ variation: Variation }, any, User["Row"]>,
    res: Response
) => {
    const { variation } = req.params
    const user = req.body

    if (!variation) throw new AppError(500, "No se ingresaron params")

    const { data: userExists, error: findError } = await supabase
        .from("users")
        .select("email, rut")
        .or(`email.eq.${user.email},rut.eq.${user.rut}`)
        .maybeSingle()

    if (findError) throw new AppError(500, findError.message)

    if (userExists) {
        const rut = userExists.rut === user.rut
        throw new AppError(409, rut ? "El RUT ya está registrado" : "El email ya está registrado")
    }

    const { data: roleSelect, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("role_type", variation)
        .single()

    if (roleError) throw new AppError(500, roleError.message)

    const hashedPassword = await hashPassword(user.password)
    if (!hashedPassword) throw new AppError(500, "Ocurrió un error inesperado")

    const payload: User["Insert"] = {
        name: user.name,
        email: user.email,
        rut: user.rut,
        password: hashedPassword,
        role: roleSelect.id,
        validated: false,
        address: user.address ?? null,
        description: user.description ?? null,
    }

    // Insertar usuario primero (para obtener su ID)
    const { error: insertError, data: inserted } = await supabase
        .from("users")
        .insert([payload])
        .select("id, email, rut, role")
        .single()

    if (insertError) throw new AppError(500, insertError.message)

    // --- MANEJO DE ARCHIVOS ---
    // Obtenemos los archivos según el tipo de campo
    const filesArray = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined
    
    // Extraer documentos (para givers) e imagen de perfil (opcional para todos)
    let documents: Express.Multer.File[] = []
    let profileImage: Express.Multer.File | null = null

    if (filesArray) {
        // Si es un objeto con campos nombrados
        if (!Array.isArray(filesArray)) {
            documents = filesArray['documents'] || []
            const imageArray = filesArray['image'] || []
            profileImage = imageArray.length > 0 ? imageArray[0] : null
        } else {
            // Si es un array simple (caso antiguo)
            documents = filesArray
        }
    }

    // --- SOLO PARA GIVER: exigir documentos y reenviar a MEDIA
    if (variation === "giver") {
        if (!documents.length) {
            throw new AppError(400, "El dador debe adjuntar documentos en 'documents'")
        }

        try {
            await sendAccountRequestDocuments({
                user: {
                    id: inserted.id,
                    email: inserted.email,
                    rut: inserted.rut,
                    roleId: inserted.role!,
                },
                files: documents.map((f: Express.Multer.File) => ({
                    buffer: f.buffer,
                    originalname: f.originalname,
                    mimetype: f.mimetype,
                })),
            })
        } catch (e: unknown) {
            const msg = getErrorMessage(e)
            console.error("❌ Error enviando account-request a MEDIA:", msg)
            throw new AppError(502, "No fue posible registrar documentos en Media")
        }
    }

    // --- OPCIONAL: Subir foto de perfil si se proporciona
    if (profileImage) {
        try {
            await sendProfilePicture({
                user: {
                    id: inserted.id,
                    email: inserted.email,
                    roleId: inserted.role!,
                },
                file: {
                    buffer: profileImage.buffer,
                    originalname: profileImage.originalname,
                    mimetype: profileImage.mimetype,
                },
            })
        } catch (e: unknown) {
            const msg = getErrorMessage(e)
            console.error("⚠️ Error procesando foto de perfil:", msg)
            // No bloqueamos el registro por error en foto de perfil
        }
    }

    const shouldSendVerificationEmail = variation === "user"

    if (shouldSendVerificationEmail && inserted) {
        // Normalizamos header (puede venir como string | string[] | undefined)
        const platformHeader = req.headers["x-platform"]
        const isMobile = String(platformHeader ?? "").toLowerCase() === "mobile"

        if (isMobile) {
            console.log("📱 Registro desde mobile → Enviando correo con código de verificación...")

            const code = Math.floor(100000 + Math.random() * 900000).toString()
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

            await supabase.from("verification_code").insert([
                {
                    user_id: inserted.id,
                    code,
                    type: "verify",
                    expires_at: expiresAt,
                    used: false,
                },
            ])

            const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verifica tu correo - Ayün Pet</title>
        </head>
        <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f4f4;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background-color:#ffffff; border-radius:10px; overflow:hidden;
                  box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color:#FFD24C; padding:40px 30px; text-align:center;">
                      <h1 style="margin:0; color:#333; font-size:28px; font-weight:bold;">
                        ¡Bienvenido a Ayün Pet! 🐾
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px; text-align:center;">
                      <p style="font-size:16px; color:#333; line-height:1.6;">
                        Gracias por registrarte en nuestra plataforma.<br/>
                        Antes de comenzar, confirma tu correo electrónico con este código:
                      </p>
                      <div style="background-color:#f8f9fa; border:2px solid #FFD24C; border-radius:8px;
                                  padding:25px; text-align:center; margin:25px 0;">
                        <div style="font-size:36px; font-weight:bold; letter-spacing:6px;
                                    color:#333; font-family:monospace;">
                          ${code}
                        </div>
                      </div>
                      <p style="font-size:14px; color:#666;">Este código expira en 15 minutos.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f8f9fa; text-align:center; padding:15px;
                      font-size:12px; color:#666;">
                      © 2025 Ayün Pet — Todos los derechos reservados.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `

            try {
                const result = await sendEmail({
                    to: user.email,
                    subject: "Bienvenido a Ayün Pet 🐾 - Verifica tu correo",
                    html,
                })
                console.log(`✅ Correo con código enviado correctamente a ${user.email}`, result)
            } catch (emailErr: unknown) {
                const msg = getErrorMessage(emailErr)
                console.error("❌ Error enviando correo de verificación (mobile):", msg)
                // No bloqueamos el registro; si quieres bloquear, reemplaza con throw.
                // Si quieres exponer el code en dev, podrías devolverlo aquí.
            }
        } else {
            console.log("🖥️ Registro desde web → Enviando correo con link de verificación...")

            const token = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: "1h" })
            const verificationLink = `${WEB_URL}/verify-email?token=${token}`

            try {
                const result = await sendEmail({
                    to: user.email,
                    subject: "Verifica tu correo - Ayün Pet",
                    html: emailTemplate(verificationLink),
                })
                console.log(`✅ Link de verificación enviado a ${user.email}`, result)
            } catch (emailErr: unknown) {
                const msg = getErrorMessage(emailErr)
                console.error("❌ Error enviando link de verificación (web):", msg)
                // No bloqueamos el registro: se puede reintentar desde el front o admin
            }
        }
    }

    return AppResponse(
        res,
        201,
        variation === "giver"
            ? "Usuario creado. Documentos enviados para revisión. Queda pendiente aprobación de un administrador."
            : "Usuario creado exitosamente",
        {}
    )
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body

        if (!token) throw new AppError(400, "Token no proporcionado")

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

        const { data: user, error: findError } = await supabase
            .from("users")
            .select("email, validated")
            .eq("email", decoded.id)
            .single()

        if (findError || !user) throw new AppError(404, "Usuario no encontrado")

        if (user.validated)
            return AppResponse(res, 200, "El correo ya estaba validado anteriormente", {})

        const { error: updateError } = await supabase
            .from("users")
            .update({ validated: true })
            .eq("email", decoded.id)

        if (updateError) throw new AppError(500, "Error al actualizar el estado de validación")

        return AppResponse(res, 200, "Correo verificado correctamente ✅", {})
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(
                401,
                "El token ha expirado. Solicita un nuevo correo de verificación."
            )
        }
        if (error.name === "JsonWebTokenError") {
            throw new AppError(400, "Token inválido")
        }
        console.error(error)
        throw new AppError(500, "Ocurrió un error al verificar el correo")
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) throw new AppError(400, "Debe proporcionar un correo electrónico")

        const { data: user, error } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .single()

        if (error || !user) throw new AppError(404, "No existe un usuario con ese correo")

        const token = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: "30m" })
        const resetLink = `${WEB_URL}/reset-password?token=${token}`

        // Intentar enviar email real
        try {
            await sendEmail({
                to: email,
                subject: "Recuperación de contraseña - Ayün Pet",
                html: `<p>Para restablecer tu contraseña, visita: <a href="${resetLink}">${resetLink}</a></p>`,
            })
            console.log(`📧 Link de recuperación enviado a ${email}`)
            return AppResponse(res, 200, "Link de recuperación enviado al correo", {})
        } catch (emailErr: unknown) {
            const msg = getErrorMessage(emailErr)
            console.error("❌ Error enviando email en forgotPassword:", msg)
            // Fallback para desarrollo: devolvemos el link en la respuesta para testing
            return AppResponse(
                res,
                200,
                "Link de recuperación generado (email falló en dev). Revisa devLink en respuesta.",
                { devLink: resetLink }
            )
        }
    } catch (error: unknown) {
        const msg = getErrorMessage(error)
        console.error("❌ ERROR EN forgotPassword:", msg)
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error al enviar el correo de recuperación")
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body

        if (!token || !newPassword)
            throw new AppError(400, "Token y nueva contraseña son requeridos")

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

        const { data: user, error: findError } = await supabase
            .from("users")
            .select("email")
            .eq("email", decoded.id)
            .single()

        if (findError || !user) throw new AppError(404, "Usuario no encontrado o token inválido")

        const hashedPassword = await hashPassword(newPassword)
        if (!hashedPassword) throw new AppError(500, "Error al encriptar la contraseña")

        const { error: updateError } = await supabase
            .from("users")
            .update({ password: hashedPassword })
            .eq("email", user.email)

        if (updateError) throw new AppError(500, "Error al actualizar la contraseña")

        return AppResponse(res, 200, "Contraseña restablecida correctamente ✅", {})
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(
                401,
                "El token ha expirado. Solicita un nuevo correo de recuperación."
            )
        }
        if (error.name === "JsonWebTokenError") {
            throw new AppError(400, "Token inválido")
        }
        console.error("❌ ERROR EN resetPassword:", error)
        throw new AppError(500, "Error al restablecer la contraseña")
    }
}

// ========================================
// NUEVOS ENDPOINTS PARA CÓDIGOS MÓVILES
// ========================================

/**
 * Genera un código de 6 dígitos para recuperación de contraseña (móvil)
 */
export const requestMobilePasswordReset = async (req: Request, res: Response) => {
    try {
        console.log("📱 [MOBILE RESET] Endpoint alcanzado - método:", req.method, "ruta:", req.path)
        console.log("📱 [MOBILE RESET] Headers:", JSON.stringify(req.headers, null, 2))
        console.log("📱 [MOBILE RESET] Body:", JSON.stringify(req.body, null, 2))

        const { email } = req.body
        console.log("🔍 Iniciando requestMobilePasswordReset para:", email)

        if (!email) throw new AppError(400, "Debe proporcionar un correo electrónico")

        // Verificar que el usuario existe
        console.log("🔍 Buscando usuario en base de datos...")
        const { data: user, error } = await supabase
            .from("users")
            .select("id, email")
            .eq("email", email)
            .single()

        if (error || !user) {
            console.log("❌ Usuario no encontrado:", error)
            throw new AppError(404, "No existe un usuario con ese correo")
        }

        console.log("✅ Usuario encontrado:", user.id)

        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        console.log("🔍 Código generado:", resetCode)

        // Calcular tiempo de expiración (15 minutos)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        console.log("🔍 Tiempo de expiración:", expiresAt)

        // Limpiar códigos anteriores del usuario (si existen)
        console.log("🔍 Limpiando códigos anteriores...")
        const { error: deleteError } = await supabase
            .from("verification_code")
            .delete()
            .eq("user_id", user.id)
            .eq("type", "reset")

        if (deleteError) {
            console.log("⚠️ Error al limpiar códigos anteriores (puede ser normal):", deleteError)
        }

        console.log("🔍 Insertando nuevo código en base de datos...")
        // Guardar código en la base de datos (SIN HASH para testing)
        const { error: insertError } = await supabase.from("verification_code").insert([
            {
                user_id: user.id,
                code: resetCode, // Guardando código sin hash para testing
                type: "reset" as const,
                expires_at: expiresAt,
                used: false,
            },
        ])

        if (insertError) {
            console.error("❌ Error al guardar código:", insertError)
            throw new AppError(
                500,
                "Error al generar código de recuperación: " + insertError.message
            )
        }

        console.log("✅ Código guardado exitosamente")

        // Crear template para el email de código móvil
        const mobileCodeEmailTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Recuperación</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="background-color: #FFD24C; padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold;">
                                        🔑 Código de Recuperación
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                                        Hola,
                                    </p>
                                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                                        Has solicitado restablecer tu contraseña en Ayün Pet. Tu código de verificación es:
                                    </p>
                                    <div style="background-color: #f8f9fa; border: 2px solid #FFD24C; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333333; font-family: monospace;">
                                            ${resetCode}
                                        </div>
                                    </div>
                                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; text-align: center;">
                                        Este código expira en 15 minutos
                                    </p>
                                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404;">
                                        <strong>⚠️ Importante:</strong>
                                        <ul style="margin: 10px 0; padding-left: 20px;">
                                            <li>Solo tienes 3 intentos para usar este código</li>
                                            <li>Si no solicitaste esto, ignora este correo</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #666666;">
                                        Este es un correo automático de Ayün Pet. Por favor, no respondas a este mensaje.
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

        // Enviar email con el código
        try {
            await sendEmail({
                to: email,
                subject: "🔑 Código de recuperación - Ayün Pet",
                html: mobileCodeEmailTemplate,
            })

            console.log(`📧 Email enviado exitosamente a ${email}`)

            return AppResponse(res, 200, "Código de recuperación enviado a tu correo", {})
        } catch (emailError) {
            console.error("❌ Error al enviar email:", emailError)
            // Si falla el email, aún retornamos el código para desarrollo
            return AppResponse(res, 200, "Código generado (email falló)", { devCode: resetCode })
        }
    } catch (error) {
        console.error("❌ ERROR EN requestMobilePasswordReset:", error)
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error al generar el código de recuperación")
    }
}

/**
 * Verifica el código de 6 dígitos y permite cambiar la contraseña
 */
export const verifyMobileResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body

        if (!email || !code || !newPassword) {
            throw new AppError(400, "Email, código y nueva contraseña son requeridos")
        }

        // Verificar que el usuario existe y obtener su ID
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email")
            .eq("email", email)
            .single()

        if (userError || !user) throw new AppError(404, "Usuario no encontrado")

        // Buscar código válido en la base de datos
        const { data: resetData, error: findError } = await supabase
            .from("verification_code")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "reset")
            .eq("used", false)
            .single()

        if (findError || !resetData) {
            throw new AppError(404, "Código no encontrado, ya utilizado o expirado")
        }

        // Verificar que no haya expirado
        const now = new Date()
        const expiresAt = new Date(resetData.expires_at!)
        if (now > expiresAt) {
            // Limpiar código expirado
            await supabase
                .from("verification_code")
                .delete()
                .eq("user_id", user.id)
                .eq("type", "reset")

            throw new AppError(401, "El código ha expirado. Solicita uno nuevo")
        }

        // Verificar el código (SIN HASH para testing)
        const isCodeValid = code === resetData.code

        if (!isCodeValid) {
            throw new AppError(400, "Código incorrecto")
        }

        // Cambiar la contraseña
        const hashedPassword = await hashPassword(newPassword)
        if (!hashedPassword) throw new AppError(500, "Error al encriptar la contraseña")

        const { error: updateError } = await supabase
            .from("users")
            .update({ password: hashedPassword })
            .eq("email", user.email)

        if (updateError) throw new AppError(500, "Error al actualizar la contraseña")

        // Marcar código como utilizado
        await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("user_id", user.id)
            .eq("type", "reset")

        return AppResponse(res, 200, "Contraseña restablecida correctamente ✅", {})
    } catch (error: any) {
        console.error("❌ ERROR EN verifyMobileResetCode:", error)
        if (error instanceof AppError) throw error
        throw new AppError(500, "Error al verificar el código")
    }
}

export const createVerificationCodeMobile = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) throw new AppError(400, "Debe proporcionar un correo electrónico")

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, validated")
            .eq("email", email)
            .single()

        if (userError || !user) throw new AppError(404, "Usuario no encontrado")

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        const { error: insertError } = await supabase.from("verification_code").insert([
            {
                user_id: user.id,
                code,
                type: "verify",
                expires_at: expiresAt,
                used: false,
            },
        ])

        if (insertError) throw new AppError(500, "Error al guardar el código de verificación")

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Ayün Pet</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 0; margin: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                            <tr>
                                <td style="background-color: #FFD24C; padding: 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #333333;">🐾 ¡Bienvenido a Ayün Pet!</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="font-size: 16px; color: #333;">Gracias por registrarte en Ayün Pet.</p>
                                    <p style="font-size: 16px; color: #555;">Tu código de verificación es:</p>
                                    <div style="background-color: #f4f4f4; border: 2px solid #FFD24C; border-radius: 8px; padding: 25px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
                                        ${code}
                                    </div>
                                    <p style="font-size: 14px; color: #777; margin-top: 20px;">Este código expira en 15 minutos.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #fafafa; padding: 20px; text-align: center;">
                                    <p style="font-size: 12px; color: #777;">Este es un correo automático, por favor no respondas.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `

        await sendEmail({
            to: email,
            subject: "🐾 Bienvenido a Ayün Pet - Verifica tu correo",
            html,
        })

        return AppResponse(res, 200, "Código de verificación enviado al correo", {})
    } catch (error) {
        throw new AppError(500, "Error al generar código de verificación")
    }
}

export const validateVerificationCodeMobile = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body
        if (!email || !code) throw new AppError(400, "Email y código son requeridos")

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, validated")
            .eq("email", email)
            .single()

        if (userError || !user) throw new AppError(404, "Usuario no encontrado")

        const { data: verifyData, error: findError } = await supabase
            .from("verification_code")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "verify")
            .eq("used", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

        if (findError || !verifyData) throw new AppError(404, "Código no encontrado o expirado")

        const now = new Date()
        const expiresAt = new Date(verifyData.expires_at!)
        if (now > expiresAt) throw new AppError(401, "El código ha expirado")

        if (code !== verifyData.code) throw new AppError(400, "Código incorrecto")

        await supabase.from("users").update({ validated: true }).eq("id", user.id)
        await supabase.from("verification_code").update({ used: true }).eq("id", verifyData.id)

        return AppResponse(res, 200, "Correo verificado correctamente ✅", {})
    } catch {
        throw new AppError(500, "Error al validar el código de verificación")
    }
}
