import { Router } from "express"
import {
    getAdoptionHistory,
    createAdoptionHistory,
    updateAdoptionHistory,
    deleteAdoptionHistory,
} from "../controllers/adoptionHistory"
import { authenticateToken, requireRole } from "@repo/utils"

const router = Router()

router.get("/", authenticateToken, requireRole("admin"), getAdoptionHistory)
router.get("/:id", authenticateToken, requireRole("admin"), getAdoptionHistory)

router.post("/", authenticateToken, requireRole("admin"), createAdoptionHistory)

router.put("/:id", authenticateToken, requireRole("admin"), updateAdoptionHistory)

router.delete("/:id", authenticateToken, requireRole("admin"), deleteAdoptionHistory)

export default router
