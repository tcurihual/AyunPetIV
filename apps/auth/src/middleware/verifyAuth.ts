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
