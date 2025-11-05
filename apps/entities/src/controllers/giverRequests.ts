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
    const { data: users, error } = await supabase
        .from("users")
        .select("id,name,email,role,rut,validated")
        .eq("validated", false)
        .not("role", "eq", 19) // Excluir admins
        .order("id", { ascending: true })

    if (error) {
        throw new AppError(500, error.message)
    }

    const items: GiverItem[] = await Promise.all(
        (users ?? []).map(async (u) => {
            const safeName = typeof u.name === "string" ? u.name : ""
            const safeEmail = typeof u.email === "string" ? u.email : ""
            const safeRut = typeof u.rut === "string" ? u.rut : ""

            let files: string[] = []
            try {
                const { data } = await axios.get<string[] | { data?: string[] }>(
                    `${MEDIA_URL}/uploads/account-request/${safeRut}`
                )
                files = Array.isArray(data)
                    ? data
                    : Array.isArray((data as any)?.data)
                    ? (data as any).data
                    : []
            } catch {
                files = []
            }

            return {
                id: u.id as number,
                name: safeName,
                email: safeEmail,
                role: u.role as number,
                rut: safeRut,
                files,
            }
        })
    )
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

        if (user.validated === false) {
            return AppResponse(res, 400, "Ya tienes una solicitud pendiente de validación", null)
        }

        const files = (req.files ?? []) as Express.Multer.File[]
        if (!files || files.length === 0) {
            return AppResponse(res, 400, "Debes adjuntar al menos un documento", null)
        }

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

        const { error: updateError } = await supabase
            .from("users")
            .update({ validated: false })
            .eq("id", userId)

        if (updateError) {
            console.error("❌ Error actualizando usuario:", updateError)
            return AppResponse(res, 500, "Error al procesar la solicitud", null)
        }

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
            "Solicitud enviada exitosamente. Recibirás un correo cuando sea validada.",
            {
                id: user.id,
                email: user.email,
                status: "pending_validation",
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
            .select("id,email,name,validated,role")
            .eq("id", Number(userId))
            .single()

        if (findError || !user) {
            return AppResponse(res, 404, "Usuario no encontrado", null)
        }

        if (user.validated) {
            return AppResponse(res, 400, "La cuenta ya está validada", null)
        }

        // 2️⃣ Determinar si necesita cambiar de rol (usuario normal a dador)
        const needsRoleUpdate = user.role === 20
        const updates: any = { validated: true }

        if (needsRoleUpdate) {
            updates.role = 21 // Cambiar a rol giver
            console.log(`🔄 Usuario ${userId} será actualizado de rol 20 (user) a 21 (giver)`)
        }

        // 3️⃣ Actualizar validación (y rol si es necesario) en BD
        const { error: updateError } = await supabase
            .from("users")
            .update(updates)
            .eq("id", Number(userId))

        if (updateError) {
            return AppResponse(res, 500, "Error al validar la cuenta", null)
        }

        console.log(
            `✅ Cuenta validada exitosamente: userId=${userId}, roleUpdated=${needsRoleUpdate}`
        )

        // 4️⃣ Enviar correo de confirmación
        try {
            const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Cuenta validada - Ayün Pet</title>
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
                                                🐾 ¡Tu cuenta ha sido validada!
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px; text-align:center;">
                                            <p style="font-size:16px; color:#333; line-height:1.6;">
                                                Hola <strong>${user.name}</strong>,
                                                tu cuenta de <strong>dador de adopción</strong> ha sido revisada y validada
                                                por el equipo de <strong>Ayün Pet</strong>.
                                            </p>
                                            <p style="font-size:16px; color:#555;">
                                                Ya puedes iniciar sesión y comenzar a publicar mascotas en adopción 🐶🐱
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
                subject: "🐾 Cuenta validada - Bienvenido a Ayün Pet",
                html,
            })

            console.log(`📧 Correo de validación enviado correctamente a ${user.email}`)
        } catch (emailError) {
            console.error("❌ Error al enviar correo de validación:", emailError)
        }

        // 5️⃣ Respuesta final
        return AppResponse(res, 200, "Cuenta validada exitosamente", {
            id: user.id,
            email: user.email,
            validated: true,
            roleUpdated: needsRoleUpdate,
        })
    } catch (error) {
        console.error("❌ Error en validateGiverAccount:", error)
        return AppResponse(res, 500, "Error interno del servidor", null)
    }
}
