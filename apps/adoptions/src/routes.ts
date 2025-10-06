import { Router } from "express"
import { requireAuth } from "@repo/utils"
import { listMyRequests } from "./controllers/mineRequests"

const router = Router()

// ✅ Tarea 2: listar solicitudes propias (adoptante o dador)
router.get("/requests/mine", requireAuth, listMyRequests)

// (próximas tareas, las dejamos listas para conectar controladores):
// router.post("/requests/:id/confirm-accept", requireAuth, requireRole(2,3,99), confirmAccept)
// router.post("/requests/:id/validate-code", requireAuth, requireRole(2,3,99), validateAndComplete)

export default router
