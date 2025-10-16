import { Request, Response, NextFunction } from "express"
import { AppError } from "error"
import { verifyAuthToken } from "../auth/jwt"

// Middleware: verificar JWT y añadir usuario al request
export const verifyAuth = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new AppError(401, "No estás autenticado. Debes incluir un token de autorización")
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer" || !token) {
        throw new AppError(401, "Formato de token inválido. Debe ser: Bearer <token>")
    }

    try {
        const payload = verifyAuthToken(token)
        req.user = payload
        next()
    } catch {
        throw new AppError(403, "Token inválido o expirado")
    }
}

// Middleware: verificar si el usuario tiene alguno de los roles requeridos
export const checkRole = (roles: number[]) => {
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

// Tipado global del usuario inyectado en req
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number
                role: number | null
            }
        }
    }
}
