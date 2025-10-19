import { Router } from "express"
import { login, register, verifyEmail, forgotPassword, resetPassword } from "../controllers/auth"
import { uploadMemory } from "../middleware/uploadMemory"

const router = Router()

router.post("/login", login)
router.post("/register/:variation", uploadMemory.array("documents", 10), register)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router
