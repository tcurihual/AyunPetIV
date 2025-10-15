import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole } from "@repo/utils"
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user"

export const ROLES = {
    ADMIN: 19,
    USER: 20,
    SHELTER: 21,
} as const

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const userRouter = Router()

userRouter.get(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler(async (req, res) => getUsers(req as any, res))
)

// Obtener por ID
userRouter.get(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => getUserById(req as any, res))
)

// Crear usuario
userRouter.post(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler(async (req, res) => createUser(req as any, res))
)

// Actualizar usuario
userRouter.patch(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => updateUser(req as any, res))
)

// Eliminar usuario
userRouter.delete(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => deleteUser(req as any, res))
)

export default userRouter
