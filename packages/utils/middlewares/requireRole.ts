import { Request, Response, NextFunction } from "express"
import { z } from "zod"

export const RoleSchema = z.object({
  id: z.number(),
  roletype: z.enum(["admin", "user", "shelter"]),
})
export type RoleType = z.infer<typeof RoleSchema>["roletype"]

const AuthPayloadSchema = z.object({
  userid: z.number(),
  roleid: z.number().optional(),
  roleType: z.enum(["admin", "user", "shelter"]),
})

export function requireRole(...allowed: RoleType[]) {
  const allowedSet = new Set(allowed.map(r => r.toLowerCase() as RoleType))

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = AuthPayloadSchema.safeParse((req as any).auth)
    if (!parsed.success) {
      return res.status(401).json({ message: "Unauthorized: missing or invalid auth payload" })
    }
    const { userid, roleType } = parsed.data
    const currentRole = roleType.toLowerCase() as RoleType

    if (!allowedSet.has(currentRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" })
    }

    ;(req as any).currentUserId = userid
    ;(req as any).currentRole = currentRole
    next()
  }
}