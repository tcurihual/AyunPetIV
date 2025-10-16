import { Router, type Request, type Response, type NextFunction } from "express"
import { requireRole } from "@repo/utils"
import {
    listPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication,
} from "../controllers/publications"

const ROLES = { ADMIN: 19, USER: 20, SHELTER: 21 } as const

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const router = Router()

router.get("/", asyncHandler((req, res) => listPublications(req as any, res)))  // Obtener publicaciones
router.get("/:id", asyncHandler((req, res) => getPublicationById(req as any, res)))  // Obtener publicación por ID
router.post("/", asyncHandler((req, res) => createPublication(req as any, res)))  // Crear publicación
router.patch("/:id", asyncHandler((req, res) => updatePublication(req as any, res)))  // Actualizar publicación
router.delete("/:id", asyncHandler((req, res) => deletePublication(req as any, res)))  // Eliminar publicación

export default router