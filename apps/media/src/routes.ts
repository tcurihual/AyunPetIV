import { Router } from "express"

import upload from "./middleware/upload"
import { getFiles, postFiles, deleteFiles } from "./controller"

const router = Router()

router.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Media funcionando correctamente",
    })
})

router.get("/uploads/:entityType", getFiles)
router.post("/uploads/:entityType/:entityId", upload.array("files", 10), postFiles)
router.delete("/uploads/:entityType/:entityId", deleteFiles)

export default router
