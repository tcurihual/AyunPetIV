import { Router } from "express"

import upload from "./utils"
import { getImages, postImage, deleteImage } from "./controller"

const router = Router()

router.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Media funcionando correctamente",
    })
})

router.get("/uploads/:entityType", getImages)
router.post("/uploads/:entityType/:entityId", upload.array("images", 6), postImage)
router.delete("/uploads/:entityType/:entityId", deleteImage)

export default router
