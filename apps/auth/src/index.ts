import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import { createSupabaseClient, AUTH_PORT, errorHandler, getHeaders } from "@repo/utils"
import authRouter from "./routes/auth"

export const supabase = createSupabaseClient()
const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(getHeaders)
app.use(express.urlencoded({ extended: true }))

app.use("/", authRouter)

app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found",
        message: `La ruta '${req.originalUrl}' no existe`,
        suggestion: "Verifica la URL",
    })
})

app.use(errorHandler)
app.listen(AUTH_PORT, () => {
    console.log(`🚀 Adoptions service running on ${AUTH_PORT}`)
})
