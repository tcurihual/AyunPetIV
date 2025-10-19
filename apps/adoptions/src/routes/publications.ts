import { Router, type Request, type Response, type NextFunction } from "express"
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

router.get("/", requireRole(19, 20, 21), asyncHandler((req, res) => listPublications(req as any, res)))
router.get("/:id", requireRole(19, 20, 21), asyncHandler((req, res) => getPublicationById(req as any, res)))
router.get("/pets/:id", requireRole(19, 20, 21), asyncHandler((req, res) => getPetById(req as any, res)))
router.post("/", requireRole(19, 20, 21), asyncHandler((req, res) => createPublication(req as any, res)))
router.patch("/:id", requireRole(19, 20, 21), asyncHandler((req, res) => updatePublication(req as any, res)))
router.delete("/:id", requireRole(19, 20, 21), asyncHandler((req, res) => deletePublication(req as any, res)))

export default router