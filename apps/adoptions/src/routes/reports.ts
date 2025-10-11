import { Router } from "express"
import { getReports, createReport, updateReport, deleteReport } from "../controllers/reports"

const router = Router()

router.get("/", getReports)
router.get("/:id", getReports)
router.post("/", createReport)
router.put("/:id", updateReport)
router.delete("/:id", deleteReport)

export default router
