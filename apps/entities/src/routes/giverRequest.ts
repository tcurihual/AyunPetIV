import { Router } from "express"
import { requireRole } from "@repo/utils"

import { listGiverRequests, validateGiverAccount } from "../controllers/giverRequests"

const router = Router()

router.get("/giver-requests", requireRole(19), listGiverRequests)
router.patch("/giver-requests/:userId/validate", requireRole(19), validateGiverAccount)

export default router
