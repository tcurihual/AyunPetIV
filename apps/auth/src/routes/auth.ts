import { Router } from "express"
import { sendEmail } from "../utils/sendEmail"
import { emailTemplate } from "../utils/templates/emailVerificationTemplate"
import { login, register } from "../controllers/auth"

const router = Router()

router.post("/login", login)
router.post("/register/:variation", register)

// Ruta de prueba de correo
// router.get("/test-email", async (req, res) => {
//})

export default router
