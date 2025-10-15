import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { AppResponse, AppError, AuthenticatedRequest, VerificationType } from "@repo/utils"
import { supabase } from "../index"

// Schemas de validación locales
const CreateVerificationCodeSchema = z.object({
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number().optional(),
    duration: z.number().min(1).max(1440).optional(),
})

const ValidateVerificationCodeSchema = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos"),
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number(),
})

const UserIdParamSchema = z.object({
    userId: z.string().transform((val) => parseInt(val, 10)),
})

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const getExpirationTime = (type: VerificationType): Date => {
    const now = new Date()
    switch (type) {
        case "verify":
            // Verificación de correo: 30 minutos
            return new Date(now.getTime() + 30 * 60 * 1000)
        case "reset":
            // Reset de contraseña: 15 minutos
            return new Date(now.getTime() + 15 * 60 * 1000)
        case "adoption":
            // Código de adopción: 24 horas
            return new Date(now.getTime() + 24 * 60 * 60 * 1000)
        default:
            // Por defecto: 15 minutos
            return new Date(now.getTime() + 15 * 60 * 1000)
    }
}

export const createVerificationCode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const validatedBody = CreateVerificationCodeSchema.parse(req.body)
        const { type, userId, duration } = validatedBody

        if (!type) {
            throw new AppError(400, "El campo 'type' es requerido")
        }

        const validTypes: VerificationType[] = ["verify", "reset", "adoption"]
        if (!validTypes.includes(type)) {
            throw new AppError(
                400,
                "Tipo de verificación inválido. Debe ser: verify, reset o adoption"
            )
        }

        if (
            duration !== undefined &&
            (typeof duration !== "number" || duration < 1 || duration > 1440)
        ) {
            throw new AppError(400, "La duración debe ser un número entre 1 y 1440 minutos")
        }

        const targetUserId = userId || req.user.id

        const { data: userExists, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", targetUserId)
            .single()

        if (userError || !userExists) {
            throw new AppError(404, "Usuario no encontrado")
        }

        const { error: invalidateError } = await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("user_id", targetUserId)
            .eq("type", type)
            .eq("used", false)

        if (invalidateError) {
            console.error("Error invalidando códigos anteriores:", invalidateError)
        }

        const code = generateVerificationCode()
        const hashedCode = await bcrypt.hash(code, 10)

        let expiresAt: Date
        if (duration && typeof duration === "number" && duration > 0) {
            expiresAt = new Date(Date.now() + duration * 60 * 1000)
        } else {
            expiresAt = getExpirationTime(type)
        }

        const { data, error } = await supabase
            .from("verification_code")
            .insert({
                code: hashedCode,
                type,
                user_id: targetUserId,
                expires_at: expiresAt.toISOString(),
                used: false,
            })
            .select()
            .single()

        if (error) {
            throw new AppError(500, "Error al crear el código de verificación", { error })
        }

        // Solo devolver el código sin hashear para el usuario (en desarrollo)
        // En producción, este código debería enviarse por email/SMS
        return AppResponse(res, 201, "Código de verificación creado exitosamente", {
            id: data.id,
            code: code, // Solo para desarrollo - remover en producción
            type: data.type,
            expires_at: data.expires_at,
            user_id: data.user_id,
        })
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        if (error instanceof z.ZodError) {
            const messages = error.issues
                .map((err: any) => `${err.path.join(".")}: ${err.message}`)
                .join(", ")
            throw new AppError(400, `Datos inválidos: ${messages}`)
        }
        console.error("Error en createVerificationCode:", error)
        throw new AppError(500, "Error interno del servidor")
    }
}

export const validateVerificationCode = async (req: Request, res: Response) => {
    try {
        const validatedBody = ValidateVerificationCodeSchema.parse(req.body)
        const { code, type, userId } = validatedBody

        if (!code || !type || !userId) {
            throw new AppError(400, "Código, tipo y userId son requeridos")
        }

        if (typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
            throw new AppError(400, "El código debe tener exactamente 6 dígitos numéricos")
        }

        const validTypes: VerificationType[] = ["verify", "reset", "adoption"]
        if (!validTypes.includes(type)) {
            throw new AppError(
                400,
                "Tipo de verificación inválido. Debe ser: verify, reset o adoption"
            )
        }

        if (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0) {
            throw new AppError(400, "El userId debe ser un número entero positivo")
        }

        const { data: verificationCodes, error: fetchError } = await supabase
            .from("verification_code")
            .select("*")
            .eq("user_id", userId)
            .eq("type", type)
            .eq("used", false)
            .order("created_at", { ascending: false })

        if (fetchError) {
            throw new AppError(500, "Error al buscar el código de verificación", { fetchError })
        }

        if (!verificationCodes || verificationCodes.length === 0) {
            throw new AppError(404, "No se encontró un código de verificación válido")
        }

        let validCode = null
        let codeRecord = null

        for (const record of verificationCodes) {
            const isMatch = await bcrypt.compare(code, record.code)
            if (isMatch) {
                validCode = record.code
                codeRecord = record
                break
            }
        }

        if (!validCode || !codeRecord) {
            throw new AppError(400, "Código de verificación inválido")
        }

        const now = new Date()
        const expiresAt = new Date(codeRecord.expires_at!)

        if (now > expiresAt) {
            await supabase.from("verification_code").update({ used: true }).eq("id", codeRecord.id)

            throw new AppError(400, "El código de verificación ha expirado")
        }

        // Marcar el código como usado
        const { error: updateError } = await supabase
            .from("verification_code")
            .update({ used: true })
            .eq("id", codeRecord.id)

        if (updateError) {
            throw new AppError(500, "Error al marcar el código como usado", { updateError })
        }

        return AppResponse(res, 200, "Código de verificación validado correctamente", {
            id: codeRecord.id,
            type: codeRecord.type,
            user_id: codeRecord.user_id,
            validated_at: new Date().toISOString(),
        })
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        if (error instanceof z.ZodError) {
            const messages = error.issues
                .map((err: any) => `${err.path.join(".")}: ${err.message}`)
                .join(", ")
            throw new AppError(400, `Datos inválidos: ${messages}`)
        }
        console.error("Error en validateVerificationCode:", error)
        throw new AppError(500, "Error interno del servidor")
    }
}

export const getUserVerificationCodes = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const validatedParams = UserIdParamSchema.parse(req.params)
        const { userId } = validatedParams

        if (req.user.role !== 19 && req.user.id !== userId) {
            throw new AppError(403, "No tienes permisos para ver estos códigos")
        }

        const { data: codes, error } = await supabase
            .from("verification_code")
            .select("id, type, used, created_at, expires_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) {
            throw new AppError(500, "Error al obtener códigos de verificación", { error })
        }

        return AppResponse(res, 200, "Códigos de verificación obtenidos correctamente", codes)
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        if (error instanceof z.ZodError) {
            const messages = error.issues
                .map((err: any) => `${err.path.join(".")}: ${err.message}`)
                .join(", ")
            throw new AppError(400, `Parámetros inválidos: ${messages}`)
        }
        console.error("Error en getUserVerificationCodes:", error)
        throw new AppError(500, "Error interno del servidor")
    }
}
