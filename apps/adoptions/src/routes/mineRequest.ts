import { Router } from "express"
import { listMyRequests } from "../controllers/mineRequests"
import { confirmAccept } from "../controllers/confirmAccept"
import { validateCode } from "../controllers/validateCode"

const router = Router()

router.get("/mineRequests", listMyRequests)
router.post("/requests/:id/confirm-accept", confirmAccept)
router.post("/requests/validate-code", validateCode)

export default router
