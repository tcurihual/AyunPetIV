import { Router } from "express"
import {
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequest,
    deleteAdoptionRequest,
} from "../controllers/adoptionRequest"

const router = Router()

router.get("/", getAdoptionRequests)
router.get("/:id", getAdoptionRequests)
router.post("/", createAdoptionRequest)
router.put("/:id", updateAdoptionRequest)
router.delete("/:id", deleteAdoptionRequest)

export default router
