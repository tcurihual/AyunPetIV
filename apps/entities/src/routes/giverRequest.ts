import { Router } from "express"
import { verifyAuth, checkRole } from "@repo/utils"
import { listGiverRequests, validateGiverAccount } from "../controllers/giverRequests"

const router = Router()

// Listar giverRequests (solo admin)
router.get("/", verifyAuth, checkRole([19]), listGiverRequests)

// Validar cuenta de usuario como giver (solo admin)
router.patch("/:userId/validate", verifyAuth, checkRole([19]), validateGiverAccount)

export default router
