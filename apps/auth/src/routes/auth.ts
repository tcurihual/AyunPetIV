import { Router } from "express"
import {
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    requestMobilePasswordReset,
    verifyMobileResetCode,
} from "../controllers/auth"
import mobileRouter from "./mobile"

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
//  Rutas para móvil
// ------------------------
console.log("🔍 Registering mobile routes at /mobile")
router.use("/mobile", mobileRouter)
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
