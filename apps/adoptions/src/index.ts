import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import { errorHandler, ADOPTIONS_PORT, getHeaders, createSupabaseClient } from "@repo/utils"
import mineRequestRoutes from "./routes/requests"
import reportRoutes from "./routes/reports"
import messagesRoutes from "./routes/messages"
import publicationRoutes from "./routes/publications"
import postsRoutes from "./routes/posts"

export const supabase = createSupabaseClient()

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(getHeaders)
app.use(express.urlencoded({ extended: true }))

app.use("/requests", mineRequestRoutes)
app.use("/reports", reportRoutes)
app.use("/messages", messagesRoutes)
app.use("/publications", publicationRoutes)
app.use("/posts", postsRoutes)

app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Adoptions funcionando correctamente",
    })
})

app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found",
        message: `La ruta '${req.originalUrl}' no existe`,
        suggestion: "Verifica la URL",
    })
})

// Error handler
app.use(errorHandler)

app.listen(ADOPTIONS_PORT, () => {
    console.log(`🚀 Adoptions service running on ${ADOPTIONS_PORT}`)
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
