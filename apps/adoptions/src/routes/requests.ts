import { Router } from "express"
import { listMyRequests, confirmAccept, validateCode } from "../controllers/request"

const router = Router()

router.get("/mine", listMyRequests)
router.post("/:id/confirm-accept", confirmAccept)
router.post("/validate-code", validateCode)

export default router
