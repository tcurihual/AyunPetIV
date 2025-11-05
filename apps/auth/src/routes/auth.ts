import { Router } from "express"
import {
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    createVerificationCodeMobile,
    validateVerificationCodeMobile,
    deleteAccount,
} from "../controllers/auth"
import { uploadMemory } from "../middleware/uploadMemory"
import { getHeaders } from "@repo/utils"

const router = Router()

router.post("/login", login)
router.post("/register/:variation", uploadMemory.array("documents", 10), register)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.delete("/delete-account", getHeaders, deleteAccount)

// ✅ NUEVAS RUTAS PARA VERIFICACIÓN DESDE MOBILE
router.post("/create-verification-code", createVerificationCodeMobile)
router.post("/validate-code", validateVerificationCodeMobile)

export default router
