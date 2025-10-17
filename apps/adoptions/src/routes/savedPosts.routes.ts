import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole } from "@repo/utils"
import {
    listSavedPosts,
    getSavedPostById,
    savePost,
    checkIfPostIsSaved,
    removeSavedPost,
    removeSavedPostByPostId,
} from "../controllers/savedPosts"
import {
    requireSavedPostOwnership,
    requireValidSaveAction,
} from "../middlewares/savedPostsMiddleware"

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const router = Router()

// Listar publicaciones guardadas del usuario autenticado
router.get(
    "/",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => listSavedPosts(req as any, res))
)

// Obtener una publicación guardada específica por ID
router.get(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    requireSavedPostOwnership,
    asyncHandler((req, res) => getSavedPostById(req as any, res))
)

// Verificar si una publicación específica está guardada
router.get(
    "/check/:postId",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => checkIfPostIsSaved(req as any, res))
)

// Guardar una publicación
router.post(
    "/",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    requireValidSaveAction,
    asyncHandler((req, res) => savePost(req as any, res))
)

// Eliminar una publicación guardada por su ID
router.delete(
    "/:id",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    requireSavedPostOwnership,
    asyncHandler((req, res) => removeSavedPost(req as any, res))
)

// Eliminar una publicación guardada por post_id
router.delete(
    "/post/:postId",
    requireRole(ROLES.ADMIN, ROLES.USER, ROLES.SHELTER),
    asyncHandler((req, res) => removeSavedPostByPostId(req as any, res))
)

export default router
