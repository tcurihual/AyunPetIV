import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole, requireAuth } from "@repo/utils"
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

const usersRouter = Router()

// Rutas protegidas - requieren autenticación
usersRouter.use(requireAuth)

usersRouter.get(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler(async (req, res) => getUsers(req as any, res))
)

// Obtener por ID
usersRouter.get(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => getUserById(req as any, res))
)

// Crear usuario
usersRouter.post(
    "/",
    requireRole(ROLES.ADMIN),
    asyncHandler(async (req, res) => createUser(req as any, res))
)

// Actualizar usuario
usersRouter.patch(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => updateUser(req as any, res))
)

// Eliminar usuario
usersRouter.delete(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler(async (req, res) => deleteUser(req as any, res))
)

export default usersRouter
