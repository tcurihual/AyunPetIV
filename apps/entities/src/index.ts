import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler, ENTITIES_PORT } from "@repo/utils"

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Entities funcionando correctamente",
    })
})

app.use(errorHandler)
app.listen(ENTITIES_PORT, () => {
    console.log("🚀 Entities service running on http://localhost/api/entities")
})
