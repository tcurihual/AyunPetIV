import { Router } from "express"

import upload from "./utils"
import { postImage } from "./controller"

const router = Router()

router.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Media funcionando correctamente",
    })
})

router.post("/uploads/:entityType/:entityId", upload.array("images", 6), postImage)

export default router
