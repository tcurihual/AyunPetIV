import { Router } from "express"
import { requestMobilePasswordReset, verifyMobileResetCode } from "../controllers/auth"

const router = Router()

// Log para debugging
console.log("🔍 Mobile routes loaded successfully")

// Rutas específicas para la aplicación móvil
router.post("/reset-password", requestMobilePasswordReset)
router.post("/verify-reset-code", verifyMobileResetCode)

// Log adicional para ver qué rutas están registradas
router.use((req, res, next) => {
    console.log(`📱 Mobile route accessed: ${req.method} ${req.path}`)
    next()
})

export default router
