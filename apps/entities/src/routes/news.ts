import { Router } from "express"
import multer from "multer"
import {
    getNews,
    createNews,
    updateNews,
    deleteNews,
    deleteNewsImages,
} from "../controllers/news"
import { requireAuth, requireRole, requireOwnership } from "@repo/utils"

const router = Router()

// Configurar multer para manejar archivos en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith("image/")) {
            cb(null, true)
        } else {
            cb(new Error("Solo se permiten archivos de imagen"))
        }
    },
})

// Rutas públicas (sin autenticación) - para obtener noticias
router.get("/", getNews)
router.get("/:id", getNews)

// Rutas protegidas - requieren autenticación
router.use(requireAuth)

// Create - Solo admin (rol 19) y shelter (rol 21) pueden crear noticias
router.post("/", requireRole(19, 21), upload.array("files", 10), createNews)

// Update - Solo admin (rol 19) y el creador pueden actualizar
router.put(
    "/:id",
    requireOwnership({ tableName: "new", ownerField: "creator_id" }),
    upload.array("files", 10),
    updateNews
)

// Delete - Solo admin (rol 19) y el creador pueden eliminar
router.delete("/:id", requireOwnership({ tableName: "new", ownerField: "creator_id" }), deleteNews)

// Delete images - Eliminar imágenes específicas de una noticia
router.delete(
    "/:id/images",
    requireOwnership({ tableName: "new", ownerField: "creator_id" }),
    deleteNewsImages
)

export default router
