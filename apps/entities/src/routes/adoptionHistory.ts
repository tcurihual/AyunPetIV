import { Router } from "express"
import {
    getAdoptionHistory,
    createAdoptionHistory,
    updateAdoptionHistory,
    deleteAdoptionHistory,
} from "../controllers/adoptionHistory"
import { requireRole, requireOwnership } from "@repo/utils"

const router = Router()

router.get("/", getAdoptionHistory)
router.get("/:id", getAdoptionHistory)

router.post("/", requireRole(19), createAdoptionHistory)

router.put(
    "/:id",
    requireRole(19, 21),
    requireOwnership({ tableName: "adoption_history", ownerField: "from_owner_id" }),
    updateAdoptionHistory
)
router.patch(
    "/:id",
    requireRole(19, 21),
    requireOwnership({ tableName: "adoption_history", ownerField: "from_owner_id" }),
    updateAdoptionHistory
)
router.delete(
    "/:id",
    requireRole(19, 21),
    requireOwnership({ tableName: "adoption_history", ownerField: "from_owner_id" }),
    deleteAdoptionHistory
)

export default router
