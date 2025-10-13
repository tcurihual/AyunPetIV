import { Router } from "express"
import { requestMobilePasswordReset, verifyMobileResetCode } from "../controllers/auth"

const router = Router()

// Rutas específicas para la aplicación móvil
router.post("/reset-password", requestMobilePasswordReset)
router.post("/verify-reset-code", verifyMobileResetCode)

export default router