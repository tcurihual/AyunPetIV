import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { AppError } from "@repo/utils"

export const validateBody = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body)
            req.body = validated
            next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.issues
                    .map((err: any) => `${err.path.join(".")}: ${err.message}`)
                    .join(", ")
                throw new AppError(400, `Datos inválidos: ${messages}`)
            }
            throw new AppError(400, "Error de validación")
        }
    }
}

export const validateParams = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.params)
            Object.assign(req.params, validated)
            next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.issues
                    .map((err: any) => `${err.path.join(".")}: ${err.message}`)
                    .join(", ")
                throw new AppError(400, `Parámetros inválidos: ${messages}`)
            }
            throw new AppError(400, "Error de validación de parámetros")
        }
    }
}
