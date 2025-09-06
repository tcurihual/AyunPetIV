import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler, AUTH_PORT } from "@repo/utils"

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Auth funcionando correctamente",
    })
})

app.use(errorHandler)
app.listen(AUTH_PORT, () => {
    console.log("🚀 Auth service running on http://localhost/api/auth")
})
