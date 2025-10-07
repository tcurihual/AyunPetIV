import { Router } from "express"
import { requireRole } from "@repo/utils"
import { listGiverRequests } from "./controllers/giverRequests"

const router = Router()

router.get("/giverRequests", requireRole(20), listGiverRequests)

export default router
