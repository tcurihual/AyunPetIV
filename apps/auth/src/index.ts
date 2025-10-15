import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import { createSupabaseClient, AUTH_PORT, errorHandler, getHeaders } from "@repo/utils"
import authRouter from "./routes/auth"
import mobileRouter from "./routes/mobile"

export const supabase = createSupabaseClient()
const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", authRouter)
app.use("/", mobileRouter)

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "auth",
        timestamp: new Date().toISOString(),
        port: AUTH_PORT,
    })
})

app.use((req, res) => {
    console.log(`❌ [AUTH] Route not found: ${req.method} ${req.originalUrl}`)
    return res.status(404).json({
        error: "Route not found",
        message: `La ruta '${req.originalUrl}' no existe`,
        suggestion: "Verifica la URL",
    })
})

app.use(errorHandler)
app.listen(AUTH_PORT, () => {
    console.log(`🚀 Auth service running on ${AUTH_PORT}`)
})

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number
                role: number | null
            }
        }
    }
}
