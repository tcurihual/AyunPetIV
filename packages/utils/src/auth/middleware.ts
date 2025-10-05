import { Request, Response, NextFunction } from "express"
import { verifyAuthToken } from "./jwt"

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number
        role: number | null
    }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: "Access token required",
            message: "No token provided in Authorization header",
        })
    }

    try {
        const decoded = verifyAuthToken(token)
        req.user = {
            id: decoded.id,
            role: decoded.role,
        }
        next()
    } catch (error) {
        return res.status(403).json({
            error: "Invalid token",
            message: "Token verification failed",
        })
    }
}

export const requireRole = (requiredRole: number) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" })
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                error: "Access denied",
                message: "No tienes permisos para acceder a esta ruta",
                suggestion: "Verifica tus credenciales",
            })
        }

        next()
    }
}
