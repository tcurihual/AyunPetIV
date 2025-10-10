import { Request, Response, NextFunction } from "express"
import { AppError } from "@repo/utils"

/**
 * Middleware para extraer la información del usuario de los headers
 * que vienen del gateway (x-user-id y x-user-role)
 */
export const extractUserFromHeaders = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"]
    const userRole = req.headers["x-user-role"]

    if (!userId) {
        throw new AppError(401, "Usuario no autenticado")
    }

    const parsedUserId = parseInt(userId as string)
    const parsedUserRole = userRole ? parseInt(userRole as string) : null

    if (isNaN(parsedUserId)) {
        throw new AppError(401, "ID de usuario inválido")
    }

    req.user = {
        id: parsedUserId,
        role: parsedUserRole,
    }

    next()
}

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number
                role: number | null
            }
        }
    }
}
