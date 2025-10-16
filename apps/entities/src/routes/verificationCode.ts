import { Router } from "express"
import { requireAuth } from "@repo/utils"
import {
    createVerificationCode,
    validateVerificationCode,
    getUserVerificationCodes,
} from "../controllers/verificationCode"
import { validateBody, validateParams } from "../middleware/validation"
import {
    createVerificationCodeR,
    validateVerificationCodeR,
    userIdParamR,
} from "../middleware/verificationCode"

const router = Router()

// POST /verification-codes - Crear un nuevo código de verificación
router.post("/", requireAuth, validateBody(createVerificationCodeR), createVerificationCode)

// POST /verification-codes/validate - Validar un código de verificación
router.post("/validate", validateBody(validateVerificationCodeR), validateVerificationCode)

// GET /verification-codes/user/:userId - Obtener códigos de un usuario (solo admin o propio usuario)
router.get("/user/:userId", requireAuth, validateParams(userIdParamR), getUserVerificationCodes)

export default router
