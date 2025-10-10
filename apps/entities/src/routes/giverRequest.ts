import { Router } from "express"
import { requireRole } from "@repo/utils"
import { listGiverRequests, validateGiverAccount } from "../controllers/giverRequests"

const router = Router()

router.get("/giverRequests", requireRole(19), listGiverRequests)
router.patch("/giverRequests/:userId/validate", requireRole(19), validateGiverAccount)

export default router
