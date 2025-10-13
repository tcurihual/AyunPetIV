import { Router } from "express"
import {
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequest,
    deleteAdoptionRequest,
} from "../controllers/adoptionRequest"
import { requireAuth } from "@repo/utils"

const router = Router()

router.use(requireAuth)

// Create
router.post("/", createAdoptionRequest)

// Read
// GET /adoption-requests/:id - Obtener solicitud por ID
router.get("/", getAdoptionRequests)
router.get("/:id", getAdoptionRequests)

// Update
router.put("/:id", updateAdoptionRequest)

// Delete
router.delete("/:id", deleteAdoptionRequest)

export default router
