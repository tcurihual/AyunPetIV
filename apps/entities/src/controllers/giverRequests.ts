import type { Request, Response, NextFunction } from "express"
import axios from "axios"
import FormData from "form-data"
import { MEDIA_URL, AppError, AppResponse, JWT_SECRET } from "@repo/utils"
import { sendEmail } from "@repo/utils"
import { supabase } from "../index"
import jwt from "jsonwebtoken"

type GiverItem = {
    id: number
    name: string
    email: string
    role: number
    rut: string
    files: string[]
}

type AuthenticatedRequest = Request & {
    user?: {
        id: number
        role: number | null
    }
}

export const listGiverRequests = async (_req: Request, res: Response) => {
    // Obtener usuarios con validated=false (solicitudes pendientes) O adoptantes (que podrían tener solicitud)
    const { data: users, error } = await supabase
        .from("users")
        .select("id,name,email,role,rut,validated")
        .neq("role", 19) // Excluir admins
        .order("id", { ascending: true })

    if (error) {
        throw new AppError(500, error.message)
    }

    const items: GiverItem[] = []
    
    console.log(`🔍 Buscando solicitudes en ${users?.length || 0} usuarios`)
    
    // Generar token de admin para consultar Media
    const adminToken = jwt.sign(
        {
            sub: 1,
            email: "admin@ayunpet.com",
            role: 19,
            aud: "media",
            purpose: "account-request",
        },
        JWT_SECRET,
        { expiresIn: "10m" }
    )
    
    // Filtrar usuarios que tengan documentos en Media (solicitudes pendientes)
    await Promise.all(
        (users ?? []).map(async (u) => {
            const safeName = typeof u.name === "string" ? u.name : ""
            const safeEmail = typeof u.email === "string" ? u.email : ""
            const safeRut = typeof u.rut === "string" ? u.rut : ""

            let files: string[] = []
            try {
                const { data } = await axios.get<string[] | { data?: string[] }>(
                    `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(safeRut)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`,
                            "x-user-id": "1",
                            "x-user-role": "19",
                        },
                    }
                )
                files = Array.isArray(data)
                    ? data
                    : Array.isArray((data as any)?.data)
                    ? (data as any).data
                    : []
            } catch {
                files = []
            }

            // Incluir en el listado si:
            // 1. Tiene archivos en Media (solicitud pendiente de escala), O
            // 2. Es shelter/dador (rol 21 o 22) con validated=false (registro inicial)
            // PERO NO incluir adoptantes (rol 20) con validated=false (son registros normales, no solicitudes)
            const hasFiles = files.length > 0
            const isShelterOrGiverPending = (u.role === 21 || u.role === 22) && u.validated === false
            
            if (hasFiles || isShelterOrGiverPending) {
                console.log(`➕ Agregando al listado: ${safeEmail} (rol: ${u.role}, validated: ${u.validated}, files: ${files.length})`)
                items.push({
                    id: u.id as number,
                    name: safeName,
                    email: safeEmail,
                    role: u.role as number,
                    rut: safeRut,
                    files,
                })
            }
        })
    )
    
    console.log(`📋 Listado de solicitudes: ${items.length} solicitudes encontradas`)
    return AppResponse(res, 200, "Listado de solicitudes de creación de cuentas", items)
}

export const submitGiverRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user || !req.user.id) {
            return AppResponse(res, 401, "Usuario no autenticado", null)
        }

        const userId = req.user.id

        const { data: user, error: findError } = await supabase
            .from("users")
            .select("id,email,name,role,rut,validated")
            .eq("id", userId)
            .single()

        if (findError || !user) {
            return AppResponse(res, 404, "Usuario no encontrado", null)
        }

        if (user.role !== 20) {
            return AppResponse(
                res,
                400,
                "Solo usuarios adoptantes pueden solicitar convertirse en dadores",
                null
            )
        }

        // Verificar si ya tiene documentos en Media (solicitud pendiente)
        let hasExistingRequest = false
        try {
            const checkUrl = `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`
            console.log(`🔍 Verificando solicitud existente en: ${checkUrl}`)
            
            const { data } = await axios.get<string[] | { data?: string[] }>(checkUrl)
            const files = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.data)
                ? (data as any).data
                : []
            hasExistingRequest = files.length > 0
            
            if (hasExistingRequest) {
                console.log(`⚠️ Usuario ${user.id} ya tiene ${files.length} documento(s) en Media`)
            }
        } catch (error: any) {
            console.log(`✅ No hay solicitud previa para usuario ${user.id}`)
            hasExistingRequest = false
        }

        if (hasExistingRequest) {
            return AppResponse(res, 400, "Ya tienes una solicitud pendiente de validación", null)
        }

        const files = (req.files ?? []) as Express.Multer.File[]
        if (!files || files.length === 0) {
            return AppResponse(res, 400, "Debes adjuntar al menos un documento", null)
        }

        console.log(`📤 Enviando ${files.length} documento(s) para usuario ${user.id} (${user.email})`)

        try {
            const fd = new FormData()
            for (const f of files) {
                fd.append("documents", f.buffer, {
                    filename: f.originalname,
                    contentType: f.mimetype,
                })
            }

            const token = jwt.sign(
                {
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                    aud: "media",
                    purpose: "account-request",
                },
                JWT_SECRET,
                { expiresIn: "10m" }
            )

            const url = `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`

            await axios.post(url, fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-user-id": String(user.id),
                    "x-user-role": String(user.role),
                    ...fd.getHeaders(),
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 20000,
            })

            console.log(`📤 Documentos enviados a Media para usuario ${user.id}`)
        } catch (mediaError: any) {
            console.error("❌ Error enviando documentos a Media:", mediaError.message)
            return AppResponse(res, 502, "Error al guardar los documentos", null)
        }

        // ✅ NO cambiamos el campo validated
        // El usuario mantiene su acceso actual mientras espera validación
        console.log(`✅ Solicitud de escalamiento recibida para usuario ${user.id} (rol ${user.role}) - mantiene acceso como adoptante`)

        try {
            const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Solicitud recibida - Ayün Pet</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin:0; padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0; background-color:#f4f4f4;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                    style="background-color:#ffffff; border-radius:10px; overflow:hidden;
                                    box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="background-color:#FFD24C; padding:40px 30px; text-align:center;">
                                            <h1 style="margin:0; color:#333; font-size:28px;">
                                                📄 Solicitud Recibida
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px; text-align:center;">
                                            <p style="font-size:16px; color:#333; line-height:1.6;">
                                                Hola <strong>${user.name}</strong>,
                                            </p>
                                            <p style="font-size:16px; color:#555; line-height:1.6;">
                                                Hemos recibido tu solicitud para convertirte en 
                                                <strong>dador de adopción</strong> en <strong>Ayün Pet</strong>.
                                            </p>
                                            <p style="font-size:16px; color:#555; line-height:1.6;">
                                                Nuestro equipo de administración está revisando tus documentos. 
                                                Te notificaremos por correo electrónico cuando tu cuenta sea validada.
                                            </p>
                                            <div style="background-color:#e8f5e9; border-left:4px solid #4CAF50; 
                                                        padding:15px; margin:20px 0; text-align:left;">
                                                <p style="margin:0; font-size:14px; color:#2e7d32;">
                                                    <strong>✅ Puedes seguir usando la app</strong><br/>
                                                    Mientras revisamos tu solicitud, puedes seguir usando 
                                                    Ayün Pet como adoptante con normalidad.
                                                </p>
                                            </div>
                                            <div style="background-color:#f8f9fa; border-left:4px solid #FFD24C; 
                                                        padding:15px; margin:20px 0; text-align:left;">
                                                <p style="margin:0; font-size:14px; color:#666;">
                                                    <strong>⏳ ¿Cuánto tiempo tomará?</strong><br/>
                                                    Generalmente procesamos las solicitudes en 24-48 horas hábiles.
                                                </p>
                                            </div>
                                            <p style="font-size:14px; color:#777;">
                                                Gracias por tu paciencia 🐾
                                            </p>
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

            await sendEmail({
                to: user.email,
                subject: "📄 Solicitud para ser dador recibida - Ayün Pet",
                html,
            })

            console.log(`📧 Correo de confirmación enviado a ${user.email}`)
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError)
        }

        // 7️⃣ Respuesta exitosa
        return AppResponse(
            res,
            200,
            "Solicitud enviada exitosamente. Podrás seguir usando la app como adoptante mientras la revisamos.",
            {
                id: user.id,
                email: user.email,
                status: "pending_validation",
                message: "Recibirás un correo cuando sea validada. Puedes seguir usando la app normalmente.",
            }
        )
    } catch (error) {
        console.error("❌ Error en submitGiverRequest:", error)
        next(error)
    }
}

export const validateGiverAccount = async (req: Request, res: Response) => {
    const { userId } = req.params

    if (!userId || isNaN(Number(userId))) {
        return AppResponse(res, 400, "ID de usuario inválido", null)
    }

    try {
        // 1️⃣ Buscar usuario
        const { data: user, error: findError } = await supabase
            .from("users")
            .select("id,email,name,validated,role,rut")
            .eq("id", Number(userId))
            .single()

        if (findError || !user) {
            return AppResponse(res, 404, "Usuario no encontrado", null)
        }

        // 2️⃣ Verificar que tenga solicitud pendiente (archivos en Media)
        let hasPendingRequest = false
        try {
            const { data } = await axios.get<string[] | { data?: string[] }>(
                `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`
            )
            const files = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.data)
                ? (data as any).data
                : []
            hasPendingRequest = files.length > 0
        } catch {
            hasPendingRequest = false
        }

        if (!hasPendingRequest) {
            return AppResponse(res, 400, "No hay solicitud pendiente para este usuario", null)
        }

        // 3️⃣ Determinar qué actualizar según el caso
        let updates: any = {}
        let actionDescription = ""
        let isRoleUpgrade = false // Flag para saber si es un escalamiento de rol

        if (user.role === 20 && user.validated === true) {
            // CASO 1: Usuario adoptante validado que solicita escalar a dador
            updates.role = 22 // Cambiar de adoptante a dador
            actionDescription = `Usuario ${userId} escalado de rol 20 (adoptante) a 22 (dador)`
            isRoleUpgrade = true
        } else if ((user.role === 21 || user.role === 22) && user.validated === false) {
            // CASO 2: Usuario nuevo registrado como shelter o dador sin validar
            updates.validated = true
            actionDescription = `Usuario ${userId} con rol ${user.role} validado exitosamente`
            isRoleUpgrade = false
        } else {
            // Rechazar otros casos (ej: adoptante con validated=false no debería estar aquí)
            return AppResponse(
                res,
                400,
                "Usuario no tiene solicitud pendiente de validación de escalamiento o registro como dador/shelter",
                null
            )
        }

        // 4️⃣ Actualizar en BD
        const { error: updateError } = await supabase
            .from("users")
            .update(updates)
            .eq("id", Number(userId))

        if (updateError) {
            return AppResponse(res, 500, "Error al validar el usuario", null)
        }

        console.log(`✅ ${actionDescription}`)

        // 5️⃣ Eliminar documentos de Media (ya validados)
        try {
            const token = jwt.sign(
                {
                    sub: user.id,
                    email: user.email,
                    role: 19, // Admin token para eliminar
                    aud: "media",
                    purpose: "account-request",
                },
                JWT_SECRET,
                { expiresIn: "5m" }
            )

            const deleteUrl = `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`

            await axios.delete(deleteUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-user-id": String(user.id),
                    "x-user-role": "19",
                },
                timeout: 10000,
            })

            console.log(`🗑️ Documentos eliminados del servidor Media para usuario ${userId}`)
        } catch (mediaError: any) {
            console.error("⚠️ Error al eliminar documentos de Media:", mediaError.message)
            // No bloqueamos el proceso si falla la eliminación
        }

        // 6️⃣ Enviar correo de confirmación
        const emailSubject = isRoleUpgrade
            ? "🐾 Solicitud aprobada - Ahora eres dador en Ayün Pet"
            : "🐾 Cuenta validada - Bienvenido a Ayün Pet"
        
        const emailTitle = isRoleUpgrade ? "¡Solicitud aprobada!" : "¡Tu cuenta ha sido validada!"
        
        const emailMessage = isRoleUpgrade
            ? "¡Tenemos excelentes noticias! Tu solicitud para convertirte en <strong>dador de adopción</strong> ha sido aprobada por el equipo de <strong>Ayün Pet</strong>."
            : "Tu cuenta de <strong>" + (user.role === 21 ? "refugio" : "dador de adopción") + "</strong> ha sido revisada y validada por el equipo de <strong>Ayün Pet</strong>."

        try {
            const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${emailTitle} - Ayün Pet</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin:0; padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0; background-color:#f4f4f4;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                    style="background-color:#ffffff; border-radius:10px; overflow:hidden;
                                    box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="background-color:#FFD24C; padding:40px 30px; text-align:center;">
                                            <h1 style="margin:0; color:#333; font-size:28px;">
                                                🐾 ${emailTitle}
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px; text-align:center;">
                                            <p style="font-size:16px; color:#333; line-height:1.6;">
                                                Hola <strong>${user.name}</strong>,
                                            </p>
                                            <p style="font-size:16px; color:#555; line-height:1.6;">
                                                ${emailMessage}
                                            </p>
                                            <div style="background-color:#e8f5e9; border-left:4px solid #4CAF50; 
                                                        padding:15px; margin:20px 0; text-align:left;">
                                                <p style="margin:0; font-size:14px; color:#2e7d32;">
                                                    <strong>✅ ¡Ya puedes ${user.role === 21 ? "gestionar tu refugio" : "publicar mascotas"}!</strong><br/>
                                                    Ahora tienes acceso completo para ${user.role === 21 ? "administrar tu refugio" : "crear publicaciones de adopción"} 
                                                    y ayudar a más mascotas a encontrar un hogar.
                                                </p>
                                            </div>
                                            <p style="font-size:16px; color:#555;">
                                                ${isRoleUpgrade ? "Cierra sesión y vuelve a entrar para ver tus nuevas funcionalidades" : "Ya puedes iniciar sesión"} 🐶🐱
                                            </p>
                                            <a href="${
                                                process.env.WEB_URL ?? "https://ayunpet.vercel.app"
                                            }"
                                                style="display:inline-block; margin-top:25px; padding:12px 24px;
                                                background-color:#FFD24C; color:#000; border-radius:8px;
                                                text-decoration:none; font-weight:bold;">
                                                Ir a Ayün Pet
                                            </a>
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

            await sendEmail({
                to: user.email,
                subject: emailSubject,
                html,
            })

            console.log(`📧 Correo de aprobación enviado correctamente a ${user.email}`)
        } catch (emailError) {
            console.error("❌ Error al enviar correo de aprobación:", emailError)
        }

        // 7️⃣ Respuesta final
        const responseData: any = {
            id: user.id,
            email: user.email,
        }

        if (isRoleUpgrade) {
            responseData.previousRole = 20
            responseData.newRole = 22
        } else {
            responseData.validated = true
            responseData.role = user.role
        }

        return AppResponse(
            res,
            200,
            isRoleUpgrade
                ? "Solicitud aprobada. Usuario escalado a dador exitosamente."
                : "Cuenta validada exitosamente",
            responseData
        )
    } catch (error) {
        console.error("❌ Error en validateGiverAccount:", error)
        return AppResponse(res, 500, "Error interno del servidor", null)
    }
}

export const rejectGiverRequest = async (req: Request, res: Response) => {
    const { userId } = req.params

    if (!userId || isNaN(Number(userId))) {
        return AppResponse(res, 400, "ID de usuario inválido", null)
    }

    try {
        // 1️⃣ Buscar usuario
        const { data: user, error: findError } = await supabase
            .from("users")
            .select("id,email,name,validated,role,rut")
            .eq("id", Number(userId))
            .single()

        if (findError || !user) {
            return AppResponse(res, 404, "Usuario no encontrado", null)
        }

        // Verificar si tiene solicitud pendiente (archivos en Media)
        let hasPendingRequest = false
        try {
            const { data } = await axios.get<string[] | { data?: string[] }>(
                `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`
            )
            const files = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.data)
                ? (data as any).data
                : []
            hasPendingRequest = files.length > 0
        } catch {
            hasPendingRequest = false
        }

        if (!hasPendingRequest) {
            return AppResponse(res, 400, "No hay solicitud pendiente para este usuario", null)
        }

        console.log(`❌ Rechazando solicitud para usuario ${userId}`)

        // Ya no necesitamos actualizar validated, solo eliminar documentos
        try {
            const token = jwt.sign(
                {
                    sub: user.id,
                    email: user.email,
                    role: 19, // Admin token para eliminar
                    aud: "media",
                    purpose: "account-request",
                },
                JWT_SECRET,
                { expiresIn: "5m" }
            )

            const deleteUrl = `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(user.rut)}`

            await axios.delete(deleteUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-user-id": String(user.id),
                    "x-user-role": "19",
                },
                timeout: 10000,
            })

            console.log(`🗑️ Documentos eliminados del servidor Media para usuario ${userId}`)
        } catch (mediaError: any) {
            console.error("⚠️ Error al eliminar documentos de Media:", mediaError.message)
            // No bloqueamos el rechazo si falla la eliminación
        }

        // 4️⃣ Enviar correo de notificación
        try {
            const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Solicitud rechazada - Ayün Pet</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin:0; padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0; background-color:#f4f4f4;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                    style="background-color:#ffffff; border-radius:10px; overflow:hidden;
                                    box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="background-color:#ff6b6b; padding:40px 30px; text-align:center;">
                                            <h1 style="margin:0; color:#fff; font-size:28px;">
                                                📋 Solicitud No Aprobada
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px; text-align:center;">
                                            <p style="font-size:16px; color:#333; line-height:1.6;">
                                                Hola <strong>${user.name}</strong>,
                                            </p>
                                            <p style="font-size:16px; color:#555; line-height:1.6;">
                                                Lamentamos informarte que tu solicitud para convertirte en 
                                                <strong>dador de adopción</strong> en <strong>Ayün Pet</strong> 
                                                no ha sido aprobada en esta ocasión.
                                            </p>
                                            <div style="background-color:#f8f9fa; border-left:4px solid #ff6b6b; 
                                                        padding:15px; margin:20px 0; text-align:left;">
                                                <p style="margin:0; font-size:14px; color:#666;">
                                                    <strong>💡 ¿Qué significa esto?</strong><br/>
                                                    Tu cuenta sigue activa y puedes continuar usando Ayün Pet 
                                                    como adoptante sin restricciones. Si deseas volver a solicitar 
                                                    ser dador, puedes hacerlo nuevamente con la documentación actualizada.
                                                </p>
                                            </div>
                                            <p style="font-size:14px; color:#777;">
                                                Si tienes dudas, puedes contactarnos respondiendo este correo.
                                            </p>
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

            await sendEmail({
                to: user.email,
                subject: "Solicitud de dador no aprobada - Ayün Pet",
                html,
            })

            console.log(`📧 Correo de rechazo enviado correctamente a ${user.email}`)
        } catch (emailError) {
            console.error("❌ Error al enviar correo de rechazo:", emailError)
        }

        // 5️⃣ Respuesta final
        return AppResponse(res, 200, "Solicitud rechazada. El usuario mantiene acceso como adoptante.", {
            id: user.id,
            email: user.email,
            role: user.role, // Se mantiene en 20
        })
    } catch (error) {
        console.error("❌ Error en rejectGiverRequest:", error)
        return AppResponse(res, 500, "Error interno del servidor", null)
    }
}
