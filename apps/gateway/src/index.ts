import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import { msRouter } from "./routes/microservices"
import { API_GATEWAY_PORT, errorHandler } from "@repo/utils"
import { buildOpenApi } from "./docs/openapi"

const app = express()
const spec = buildOpenApi()

app.use(
    "/v1/docs",
    (_req: Request, res: Response, next: NextFunction) => {
        res.removeHeader("Content-Security-Policy")
        next()
    },
    helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(spec, { explorer: true })
)

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))

app.use("/v1", msRouter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found",
        message: `La ruta '${req.originalUrl}' no existe`,
        suggestion:
            "Todas las rutas de API deben empezar con /v1/. Consulta /v1/docs para más información",
    })
})

app.use(errorHandler)
app.listen(API_GATEWAY_PORT, () => {
    console.log(`🚀 API Gateway running on ${API_GATEWAY_PORT}`)
})
