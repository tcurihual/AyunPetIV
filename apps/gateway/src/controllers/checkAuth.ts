import { AppError, AppResponse } from "@repo/utils"
import { Request, Response } from "express"

export const checkAuth = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new AppError(401, "Token inválido o expirado")
        }

        return AppResponse(res, 200, "Token válido", {
            user: req.user,
        })
    } catch (err) {
        throw new AppError(401, "Token inválido o expirado")
    }
}
