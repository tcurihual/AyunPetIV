import { Router } from "express"
import {
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    createVerificationCodeMobile,
    validateVerificationCodeMobile,
    checkUserExists,
    savePushToken,
} from "../controllers/auth"
import { uploadMemory } from "../middleware/uploadMemory"
import { verifyAuth } from "../middleware/verifyAuth"

const router = Router()

router.post("/login", login)
router.post("/register/:variation", uploadMemory.array("documents", 10), register)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// ✅ NUEVAS RUTAS PARA VERIFICACIÓN DESDE MOBILE
router.post("/create-verification-code", createVerificationCodeMobile)
router.post("/validate-code", validateVerificationCodeMobile)

// ✅ RUTA PARA VERIFICAR SI EMAIL O RUT YA EXISTEN
router.post("/check-user-exists", checkUserExists)

// ✅ RUTA PARA GUARDAR PUSH TOKEN
router.post("/push-token", verifyAuth, savePushToken)

export default router
