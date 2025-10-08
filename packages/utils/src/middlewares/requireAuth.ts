import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "../types"
import { verifyAuthToken } from "../auth/jwt"

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization

        if (auth && auth.startsWith("Bearer ")) {
            const token = auth.slice(7)
            const payload = verifyAuthToken(token)

            const id = Number(payload.id)
            const roleCandidate: unknown = (payload as any).roleId ?? (payload as any).role ?? null
            const role = roleCandidate === null ? null : Number(roleCandidate)

            if (!Number.isFinite(id)) {
                return res
                    .status(401)
                    .json({ type: "error", message: "Token inválido", data: null })
            }

            req.user = { id, role }
            return next()
        }

        const userId = req.headers["x-user-id"]
        const userRole = req.headers["x-user-role"]

        if (userId) {
            req.user = { id: Number(userId), role: userRole ? Number(userRole) : null }
            return next()
        }

        return res.status(401).json({ type: "error", message: "No autenticado", data: null })
    } catch (e: any) {
        return res
            .status(401)
            .json({ type: "error", message: e?.message ?? "No autenticado", data: null })
    }
}
