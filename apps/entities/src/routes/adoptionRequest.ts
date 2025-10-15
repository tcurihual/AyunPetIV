import { Router } from "express"
import {
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequest,
    deleteAdoptionRequest,
} from "../controllers/adoptionRequest"
import { requireAuth } from "@repo/utils"

const router = Router()

router.use(requireAuth)

router.get("/", getAdoptionRequests)
router.get("/:id", getAdoptionRequests)
router.post("/", createAdoptionRequest)
router.put("/:id", updateAdoptionRequest)
router.delete("/:id", deleteAdoptionRequest)

export default router
