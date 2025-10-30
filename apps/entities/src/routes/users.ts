// apps/entities/src/routes/users.ts
import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole } from "@repo/utils"
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    patchMe,
} from "../controllers/user"

export const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const usersRouter = Router()

usersRouter.get(
    "/me",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => getMe(req as any, res))
)
usersRouter.patch(
    "/me",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => patchMe(req as any, res))
)

usersRouter.get(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => getUsers(req as any, res))
)
usersRouter.post(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => createUser(req as any, res))
)

usersRouter.get(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => getUserById(req as any, res))
)

usersRouter.patch(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => updateUser(req as any, res))
)

usersRouter.delete(
    "/:id",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => deleteUser(req as any, res))
)

export default usersRouter
