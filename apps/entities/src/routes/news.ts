import { Router } from "express"
import multer from "multer"
import {
    getNews,
    createNews,
    updateNews,
    deleteNews,
    deleteNewsImages,
} from "../controllers/news"
import { requireAuth, requireRole } from "@repo/utils"

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

// Rutas protegidas - requieren autenticación incluso para obtener noticias
router.use(requireAuth)
router.get("/", getNews)
router.get("/:id", getNews)

// Create - Solo admin (rol 19) y shelter (rol 21) pueden crear noticias
router.post("/", requireRole(19, 21), upload.array("files", 10), createNews)

// Update - Solo admin (rol 19) y shelter (rol 21) pueden actualizar
router.put("/:id", requireRole(19, 21), upload.array("files", 10), updateNews)

// Delete - Solo admin (rol 19) y shelter (rol 21) pueden eliminar
router.delete("/:id", requireRole(19, 21), deleteNews)

// Delete images - Eliminar imágenes específicas de una noticia
router.delete("/:id/images", requireRole(19, 21), deleteNewsImages)

export default router
