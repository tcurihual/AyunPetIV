import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "types"

export const getHeaders = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"]
    const role = req.headers["x-user-role"]

    if (userId && role) {
        req.user = {
            id: Number(userId),
            role: Number(role),
        }
    }

    next()
}
