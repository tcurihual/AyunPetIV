import { Router } from "express"
import { verifyAuth, checkRole } from "@repo/utils"
import { getReports, createReport, updateReport, deleteReport } from "../controllers/reports"

const router = Router()

// ✅ Usa la misma función para ambos endpoints
router.get("/", verifyAuth, getReports)
router.get("/:id", verifyAuth, getReports)
router.post("/", verifyAuth, createReport)
router.put("/:id", verifyAuth, checkRole([19]), updateReport)
router.delete("/:id", verifyAuth, checkRole([19]), deleteReport)

export default router
