import { Router, type Request, type Response, type NextFunction } from "express"
import multer from "multer"
import { requireRole } from "@repo/utils"
import {
    listPublications,
    getPublicationById,
    getPetById,
    createPublication,
    updatePublication,
    deletePublication,
} from "../controllers/publications"

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next)

const router = Router()

// Configurar multer para manejar archivos en memoria (compatibilidad con servicio media)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true)
        else cb(new Error("Solo se permiten archivos de imagen"))
    },
})

router.get(
    "/",
    requireRole(19, 20, 21),
    asyncHandler((req, res) => listPublications(req as any, res))
)
router.get(
    "/pets/:id",
    requireRole(19, 20, 21),
    asyncHandler((req, res) => getPetById(req as any, res))
)
router.get(
    "/:id",
    requireRole(19, 20, 21),
    asyncHandler((req, res) => getPublicationById(req as any, res))
)

router.post(
    "/",
    requireRole(19, 20, 21),
    upload.array("files", 10),
    asyncHandler((req, res) => createPublication(req as any, res))
)
router.patch(
    "/:id",
    requireRole(19, 20, 21),
    upload.array("files", 10),
    asyncHandler((req, res) => updatePublication(req as any, res))
)
router.delete(
    "/:id",
    requireRole(19, 20, 21),
    asyncHandler((req, res) => deletePublication(req as any, res))
)

export default router
