import express from "express"
import path from "path"
import router from "./routes"
import { errorHandler } from "./middleware/error"
import { MEDIA_PORT } from "@repo/utils"

const app = express()
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/", router)

app.use((_req, res) =>
    res.status(404).json({
        error: "Route not found",
        message: `La ruta '${_req.originalUrl}' no existe`,
        suggestion: "Verifica la URL",
    })
)

app.use(errorHandler)

app.listen(MEDIA_PORT, () => console.log(`🚀 Entities service running on ${MEDIA_PORT}`))
