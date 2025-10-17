import { Router } from "express"
import {
    listMyRequests,
    confirmAccept,
    validateCode,
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequest,
    deleteAdoptionRequest,
} from "../controllers/request"

const router = Router()

router.get("/mine", listMyRequests)
router.post("/:id/confirm-accept", confirmAccept)
router.post("/validate-code", validateCode)

router.get("/", getAdoptionRequests)
router.get("/:id", getAdoptionRequests)
router.post("/", createAdoptionRequest)
router.put("/:id", updateAdoptionRequest)
router.delete("/:id", deleteAdoptionRequest)

export default router
