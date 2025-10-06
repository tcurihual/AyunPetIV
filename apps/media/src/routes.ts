import { Router } from "express"

import { publicUpload, uploadAccountRequest } from "./middleware/upload"
import { getFiles, postFiles, deleteFiles, getFilesById } from "./controllers/images"
import { getGiverFiles, giverPost } from "./controllers/giverRequest"
import { requireRole } from "@repo/utils"

const router = Router()

router.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Media funcionando correctamente",
    })
})

// TODO: middleware por roles, solo para admin, para todas las rutas de abajo
router.post("/uploads/account-request/:rut", uploadAccountRequest.array("files", 10), giverPost)
router.get("/uploads/account-request", getGiverFiles)

// rutas publicas
router.get("/uploads/:entityType", requireRole(19, 21), getFiles)
router.get("/uploads/:entityType/:entityId", getFilesById)
router.post("/uploads/:entityType/:entityId", publicUpload.array("files", 10), postFiles)
router.delete("/uploads/:entityType/:entityId", deleteFiles)

export default router
