import { Router } from "express"
import { requireRole } from "@repo/utils"
import { getReports, createReport, updateReport, deleteReport } from "../controllers/reports"

const router = Router()

// ✅ Usa la misma función para ambos endpoints
router.get("/", getReports)
router.get("/:id", getReports)
router.post("/", createReport)
router.put("/:id", requireRole(19), updateReport)
router.delete("/:id", requireRole(19), deleteReport)

export default router
