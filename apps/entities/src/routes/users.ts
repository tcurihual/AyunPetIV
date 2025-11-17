import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole } from "@repo/utils"
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    deleteMe,
    getMe,
    patchMe,
    getUsersSafe,
    getUserByIdSafe,
} from "../controllers/user"
import { uploadProfile } from "../middleware/upload"

export const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21, GIVER: 22 } as const

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const usersRouter = Router()

usersRouter.get(
    "/me",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER, ROLES.GIVER),
    asyncHandler((req, res) => getMe(req as any, res))
)
usersRouter.patch(
    "/me",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER, ROLES.GIVER),
    uploadProfile,
    asyncHandler((req, res) => patchMe(req as any, res))
)
usersRouter.delete(
    "/me",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER, ROLES.GIVER),
    asyncHandler((req, res) => deleteMe(req as any, res))
)

usersRouter.get(
    "/public",
    asyncHandler((req, res) => getUsersSafe(req as any, res))
)

usersRouter.get(
    "/public/:id",
    asyncHandler((req, res) => getUserByIdSafe(req as any, res))
)

usersRouter.get(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => getUsers(req as any, res))
)

usersRouter.get(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => getUserById(req as any, res))
)

usersRouter.post(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => createUser(req as any, res))
)

usersRouter.patch(
    "/:id",
    requireRole(ROLES.ADMIN),
    uploadProfile,
    asyncHandler((req, res) => updateUser(req as any, res))
)

usersRouter.delete(
    "/:id",
    requireRole(ROLES.ADMIN),
    asyncHandler((req, res) => deleteUser(req as any, res))
)

export default usersRouter
