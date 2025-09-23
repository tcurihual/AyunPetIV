import { Router } from "express"
import { getPetImage, getPetImageOriginal } from "./media.controller"

const router = Router()

// Endpoint principal (thumb/full)
router.get("/pets/:id/image", getPetImage)



export default router
