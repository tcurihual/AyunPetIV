import { Router } from "express"
import { requireRole } from "@repo/utils"
import { listGiverRequests } from "./controllers/giverRequests"

const r = Router()
r.get("/giverRequests", requireRole(19), listGiverRequests)
export default r
