import { Router } from "express"
import { requestMobilePasswordReset, verifyMobileResetCode } from "../controllers/auth"

const router = Router()

router.post("/reset-password", requestMobilePasswordReset)
router.post("/verify-reset-code", verifyMobileResetCode)

export default router
