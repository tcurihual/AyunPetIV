import { Router } from "express"
import {
    getAdoptionHistory,
    createAdoptionHistory,
    updateAdoptionHistory,
    deleteAdoptionHistory,
} from "../controllers/adoptionHistory"
import { requireRole, requireOwnership } from "@repo/utils"
import { extractUserFromHeaders } from "../middleware/extractUser"

const router = Router()

// Rutas públicas - solo lectura
router.get("/", getAdoptionHistory)
router.get("/:id", getAdoptionHistory)

// Rutas protegidas - requieren autenticación
// POST: Solo admins pueden crear historial de adopción
router.post("/", extractUserFromHeaders, requireRole(19), createAdoptionHistory)

// PUT/DELETE: Solo el propietario (fromownerid o toownerid) o admin puede modificar
// El historial de adopción tiene fromownerid y toownerid, verificamos fromownerid
router.put(
    "/:id",
    extractUserFromHeaders,
    requireOwnership({ tableName: "adoption_history", ownerField: "fromownerid" }),
    updateAdoptionHistory
)

router.delete(
    "/:id",
    extractUserFromHeaders,
    requireOwnership({ tableName: "adoption_history", ownerField: "fromownerid" }),
    deleteAdoptionHistory
)

export default router
