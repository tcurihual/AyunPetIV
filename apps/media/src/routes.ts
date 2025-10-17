import { Router } from "express"
import path from "path"

import { requireRole, getHeaders } from "@repo/utils"

import { publicUpload, uploadAccountRequest } from "./middleware/upload"
import { getFiles, postFiles, deleteFiles, getFilesById } from "./controllers/images"
import { getGiverFiles, giverPost } from "./controllers/giverRequests"
import { requireFileOwnership } from "./middleware/requireFileOwnership"

const router = Router()

router.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Media funcionando correctamente",
    })
})

// ✅ Ruta específica para servir archivos individuales (debe ir ANTES de las rutas dinámicas)
router.get("/uploads/:entityType/:entityId/:filename", (req, res) => {
    const { entityType, entityId, filename } = req.params
    const filePath = path.join(__dirname, "..", "uploads", entityType, entityId, filename)

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({
                error: "File not found",
                message: `Archivo '${filename}' no encontrado en ${entityType}/${entityId}`,
            })
        }
    })
})

// TODO: middleware por roles, solo para admin, para todas las rutas de abajo
router.post("/uploads/account-request/:rut", uploadAccountRequest.array("files", 10), giverPost)
router.get("/uploads/account-request", requireRole(19), getGiverFiles)

// rutas publicas
router.get("/uploads/:entityType", getFiles)
router.get("/uploads/:entityType/:entityId", getFilesById)

// rutas protegidas - POST y DELETE requieren autenticación
router.post(
    "/uploads/:entityType/:entityId",
    getHeaders,
    publicUpload.array("files", 10),
    postFiles
)

// DELETE: Solo el propietario de la entidad (post/pet) o admin puede eliminar archivos
router.delete("/uploads/:entityType/:entityId", getHeaders, requireFileOwnership, deleteFiles)

export default router
