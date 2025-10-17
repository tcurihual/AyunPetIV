import { Request, Response, NextFunction } from "express"
import { AppError, verifyAuthToken } from "@repo/utils"

export const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new AppError(401, "No estás autenticado. Debes incluir un token de autorización")
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer" || !token) {
        throw new AppError(401, "Formato de token inválido. Debe ser: Bearer <token>")
    }

    const payload = verifyAuthToken(token)
    req.user = payload

    next()
}

// Middleware para verificar roles permitidos
export const checkRole = (roles: Array<number>) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError(401, "Usuario no autenticado")
        }

        if (req.user.role === null || !roles.includes(req.user.role)) {
            throw new AppError(403, "No tienes permisos para realizar esta acción")
        }

        next()
    }
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
