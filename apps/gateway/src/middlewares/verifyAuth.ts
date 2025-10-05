import { Request, Response, NextFunction } from "express"
import { AppError, verifyAuthToken } from "@repo/utils"

export const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new AppError(401, "Authorization not found in the header")
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer" || !token) {
        throw new AppError(401, "Wrong format of authorization bearer token")
    }

    const payload = verifyAuthToken(token)
    req.user = payload

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
