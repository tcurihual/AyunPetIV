import { Router } from "express"
import { requireAuth } from "@repo/utils"
import {
    createVerificationCode,
    validateVerificationCode,
    getUserVerificationCodes,
} from "../controllers/verificationCode"

const router = Router()

// POST /verification-codes - Crear un nuevo código de verificación
router.post("/", requireAuth, createVerificationCode)

// POST /verification-codes/validate - Validar un código de verificación
router.post("/validate", validateVerificationCode)

// GET /verification-codes/user/:userId - Obtener códigos de un usuario (solo admin o propio usuario)
router.get("/user/:userId", requireAuth, getUserVerificationCodes)

export default router
