import { Request, Response, NextFunction } from "express"
import { verifyAuthToken } from "./jwt"
import type { RoleType } from "../types"

const FALLBACK_ROLE_ID_TO_TYPE = { 19: "admin", 20: "user", 21: "shelter" } as const

export interface AuthenticatedRequest extends Request {
  user?: { id: number; roleId?: number | null; roleType: RoleType }
  currentUserId?: number
  currentRoleType?: RoleType
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Access token required" })

  try {
    const decoded: any = verifyAuthToken(token)

    let roleType: RoleType | undefined = decoded.roleType
    if (!roleType && typeof decoded.role === "number") {
      roleType = FALLBACK_ROLE_ID_TO_TYPE[decoded.role]
    }

    if (!decoded?.id || !roleType) {
      return res.status(403).json({ error: "Invalid token", message: "Missing id or roleType" })
    }

    req.user = { id: decoded.id, roleId: decoded.role ?? decoded.roleId ?? null, roleType }
    req.currentUserId = decoded.id
    req.currentRoleType = roleType
    next()
  } catch {
    return res.status(403).json({ error: "Invalid token" })
  }
}

export const requireRole = (...allowed: RoleType[]) => {
  const set = new Set(allowed.map(r => r.toLowerCase()) as RoleType[])
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" })
    const current = req.user.roleType.toLowerCase() as RoleType
    if (!set.has(current)) {
      return res.status(403).json({ error: "Access denied", message: "Rol insuficiente" })
    }
    next()
  }
}