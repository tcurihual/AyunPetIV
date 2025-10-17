import { Router } from "express"
import { requireRole } from "@repo/utils"
import { listGiverRequests, validateGiverAccount } from "../controllers/giverRequests"

const router = Router()

router.get("/", requireRole(19), listGiverRequests)
router.patch("/:userId/validate", requireRole(19), validateGiverAccount)

export default router
