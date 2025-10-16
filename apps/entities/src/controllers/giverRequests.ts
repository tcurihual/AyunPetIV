import type { Request, Response } from "express"
import axios from "axios"
import { MEDIA_URL, AppError, AppResponse, sendAccountValidationEmail } from "@repo/utils"
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
        return res.status(400).json({
            type: "error",
            message: "ID de usuario inválido",
            data: null,
        })
    }

    try {
        const { data: user, error: findError } = await supabase
            .from("users")
            .select("id,email,name,validated,role")
            .eq("id", Number(userId))
            .single()

        if (findError || !user) {
            return res.status(404).json({
                type: "error",
                message: "Usuario no encontrado",
                data: null,
            })
        }

        if (user.validated) {
            return res.status(400).json({
                type: "error",
                message: "La cuenta ya está validada",
                data: null,
            })
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ validated: true })
            .eq("id", Number(userId))

        if (updateError) {
            return res.status(500).json({
                type: "error",
                message: "Error al validar la cuenta",
                data: null,
            })
        }

        try {
            const emailSent = await sendAccountValidationEmail(user.email, user.name)
            if (emailSent) {
                console.log(`📧 Correo de validación enviado a ${user.email}`)
            } else {
                console.warn(
                    `⚠️  No se pudo enviar el correo a ${user.email}, pero la cuenta fue validada`
                )
            }
        } catch (emailError) {
            console.error("❌ Error al enviar correo de validación:", emailError)
        }

        return res.json({
            type: "success",
            message: "Cuenta validada exitosamente",
            data: {
                userId: user.id,
                email: user.email,
                validated: true,
            },
        })
    } catch (error) {
        console.error("Error en validateGiverAccount:", error)
        return res.status(500).json({
            type: "error",
            message: "Error interno del servidor",
            data: null,
        })
    }
}
