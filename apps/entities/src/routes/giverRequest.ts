import { Router } from "express"
import { requireRole } from "@repo/utils"
import {
    listGiverRequests,
    validateGiverAccount,
    submitGiverRequest,
    rejectGiverRequest,
} from "../controllers/giverRequests"
import { uploadGiverDocuments } from "../middleware/upload"

const router = Router()

// GET /giver-request - Listar solicitudes pendientes (solo admin)
router.get("/", requireRole(19), listGiverRequests)

// PATCH /giver-request/:userId/validate - Validar cuenta de dador (solo admin)
router.patch("/:userId/validate", requireRole(19), validateGiverAccount)

// PATCH /giver-request/:userId/reject - Rechazar solicitud de dador (solo admin)
router.patch("/:userId/reject", requireRole(19), rejectGiverRequest)

// POST /giver-request/submit - Enviar solicitud para ser dador (usuarios normales autenticados)
router.post(
    "/submit",
    requireRole(20), // Solo usuarios normales (adoptantes)
    uploadGiverDocuments.array("documents", 10),
    submitGiverRequest
)

export default router
