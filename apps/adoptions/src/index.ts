import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler, ADOPTIONS_PORT } from "@repo/utils"

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_, res) => {
    return res.status(200).json({
        message: "Microservicio Adoptions funcionando correctamente",
    })
})

app.use(errorHandler)
app.listen(ADOPTIONS_PORT, () => {
    console.log(`🚀 Adoptions service running on http://localhost/api/adoptions`)
})
