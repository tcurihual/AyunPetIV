import { Router } from "express"
import { login, register, verifyEmail } from "../controllers/auth"
import { sendEmail } from "@repo/utils"
import { emailTemplate } from "../utils/templates/emailVerificationTemplate"
import jwt from "jsonwebtoken"
import { forgotPassword } from "../controllers/auth"
import { resetPassword } from "../controllers/auth"

const router = Router()

// ------------------------
//  Rutas principales
// ------------------------
router.post("/login", login)
router.post("/register/:variation", register)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
// ------------------------
//  Ruta temporal para pruebas locales (comentar antes de subir)
// ------------------------

/*
router.get("/test-email", async (req, res) => {
    try {
        const token = jwt.sign({ id: "lgkbuvjzehaebjttsf@nespf.com" }, process.env.JWT_SECRET!, {
            expiresIn: "1h",
        })

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

        await sendEmail({
            to: "lgkbuvjzehaebjttsf@nespf.com",
            subject: "Prueba de verificación de correo Ayün Pet 🐾",
            html: emailTemplate(verificationLink),
        })

        return res.json({
            ok: true,
            message: "Correo de prueba enviado correctamente",
            link: verificationLink,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok: false, message: "Error al enviar el correo" })
    }
})
*/

export default router
