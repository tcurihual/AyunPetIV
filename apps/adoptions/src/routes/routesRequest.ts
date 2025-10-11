import { Router } from "express"
import { listMyRequests, confirmAccept, validateCode } from "../controllers/request"

const router = Router()

router.get("/mine-requests", listMyRequests)
router.post("/requests/:id/confirm-accept", confirmAccept)
router.post("/requests/validate-code", validateCode)

export default router
