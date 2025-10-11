import { Router } from "express"
import {
    getAdoptionHistory,
    createAdoptionHistory,
    updateAdoptionHistory,
    deleteAdoptionHistory,
} from "../controllers/request"
// import { authenticateToken, requireRole } from "@repo/utils"

const router = Router()

// TODO: implementar middlewares, los de abajo comentados no estan correctamente implementados
router.get("/", getAdoptionHistory)
router.get("/:id", getAdoptionHistory)
router.post("/", createAdoptionHistory)
router.put("/:id", updateAdoptionHistory)
router.delete("/:id", deleteAdoptionHistory)

// router.get("/", authenticateToken, requireRole("admin"), getAdoptionHistory)
// router.get("/:id", authenticateToken, requireRole("admin"), getAdoptionHistory)
// router.post("/", authenticateToken, requireRole("admin"), createAdoptionHistory)
// router.put("/:id", authenticateToken, requireRole("admin"), updateAdoptionHistory)
// router.delete("/:id", authenticateToken, requireRole("admin"), deleteAdoptionHistory)

export default router
