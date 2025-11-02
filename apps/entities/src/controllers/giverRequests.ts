import type { Request, Response } from "express"
import axios from "axios"
import { MEDIA_URL, AppError, AppResponse } from "@repo/utils"
import { sendEmail } from "@repo/utils"
import { supabase } from "../index"

type GiverItem = {
    id: number
    name: string
    email: string
    role: number
    rut: string
    files: string[]
}

export const listGiverRequests = async (_req: Request, res: Response) => {
    const { data: users, error } = await supabase
        .from("users")
        .select("id,name,email,role,rut,validated")
        .eq("validated", false)
        .not("role", "in", "(20,19)")
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

        // 2️⃣ Actualizar validación en BD
        const { error: updateError } = await supabase
            .from("users")
            .update({ validated: true })
            .eq("id", Number(userId))

        if (updateError) {
            return AppResponse(res, 500, "Error al validar la cuenta", null)
        }

        // 3️⃣ Enviar correo de confirmación (nuevo sistema)
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

        // 4️⃣ Respuesta final
        return AppResponse(res, 200, "Cuenta validada exitosamente", {
            id: user.id,
            email: user.email,
            validated: true,
        })
    } catch (error) {
        console.error("❌ Error en validateGiverAccount:", error)
        return AppResponse(res, 500, "Error interno del servidor", null)
    }
}
