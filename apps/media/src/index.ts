import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"

import { errorHandler, MEDIA_PORT } from "@repo/utils"
import router from "./routes"

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/media", router)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use(errorHandler)
app.listen(MEDIA_PORT, () => {
    console.log("🚀 Adoptions service running on http://localhost/api/media")
})
