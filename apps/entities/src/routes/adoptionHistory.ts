import { Router } from "express"
import {
    getAdoptionHistory,
    createAdoptionHistory,
    updateAdoptionHistory,
    deleteAdoptionHistory,
} from "../controllers/adoptionHistory"

import { requireRole, requireOwnership, requireAuth } from "@repo/utils"

const router = Router()

// Rutas públicas - solo lectura
router.get("/", getAdoptionHistory)
router.get("/:id", getAdoptionHistory)

// Rutas protegidas - requieren autenticación
router.use(requireAuth)

// POST: Solo admins pueden crear historial de adopción
router.post("/", requireRole(19), createAdoptionHistory)

// PUT/DELETE: Solo el propietario o admin puede modificar
// El historial de adopción tiene fromownerid y toownerid, verificamos fromownerid
router.put(
    "/:id",
    requireOwnership({ tableName: "adoption_history", ownerField: "fromownerid" }),
    updateAdoptionHistory
)

router.delete(
    "/:id",
    requireOwnership({ tableName: "adoption_history", ownerField: "fromownerid" }),
    deleteAdoptionHistory
)

export default router
