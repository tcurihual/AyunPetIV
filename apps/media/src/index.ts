import express from "express"
import path from "path"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import router from "./routes"
import { errorHandler } from "./middleware/error"
import { MEDIA_PORT, getHeaders } from "@repo/utils"

const app = express()

app.use(
    cors({
        origin: true,
        credentials: false,
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
    })
)

app.use(helmet({ crossOriginResourcePolicy: false }))

app.use(morgan("dev"))
app.use(express.json())

app.use("/", router)

// ✅ Configuración estática para servir archivos (después del router para que tenga prioridad sobre rutas dinámicas)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use((_req, res) =>
    res.status(404).json({
        error: "Route not found",
        message: `La ruta '${_req.originalUrl}' no existe`,
        suggestion: "Verifica la URL",
    })
)

app.use(errorHandler)

app.listen(MEDIA_PORT, () => console.log(`🚀 Entities service running on ${MEDIA_PORT}`))

declare global {
    namespace Express {
        interface Request {
            user: { id: number; role: number | null }
        }
    }
}
