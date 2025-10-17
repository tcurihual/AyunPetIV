import { Request, Response, NextFunction } from "express"
import { AppError } from "@repo/utils"

export const checkRole = (allowedRoles: number[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
            throw new AppError(403, "Acceso denegado. Rol no autorizado")
        }
        next()
    }
}
