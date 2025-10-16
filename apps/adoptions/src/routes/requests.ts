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
import { requireAuth } from "@repo/utils"

const router = Router()

router.use(requireAuth)

router.get("/mine-requests", listMyRequests)
router.post("/:id/confirm-accept", confirmAccept)
router.post("/validate-code", validateCode)

// CRUD endpoints migrados desde entities
router.get("/", getAdoptionRequests)
router.get("/:id", getAdoptionRequests)
router.post("/", createAdoptionRequest)
router.put("/:id", updateAdoptionRequest)
router.delete("/:id", deleteAdoptionRequest)

export default router
