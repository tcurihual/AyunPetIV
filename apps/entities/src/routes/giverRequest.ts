import { Router } from "express"
import { requireRole } from "@repo/utils"
import { listGiverRequests } from "../controllers/request"

const router = Router()

router.get("/giver-Requests", requireRole(19), listGiverRequests)

export default router
