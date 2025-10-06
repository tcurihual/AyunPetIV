import type { RequestHandler } from "express"
import type { AuthenticatedRequest } from "types"
import { AppError } from "error"

export const requireRole =
    (...allowedRoleIds: number[]): RequestHandler =>
    (req, _res, next) => {
        const { user } = req as AuthenticatedRequest
        if (!user) return next(new AppError(401, "No autenticado"))

        const { role } = user
        if (role === null || !allowedRoleIds.includes(role)) {
            return next(new AppError(403, "Error: no autorizado"))
        }

        next()
    }
