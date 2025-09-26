import express from "express"
import swaggerUi from "swagger-ui-express"
import { msRouter } from "./routes/microservices"
import { API_GATEWAY_PORT } from "@repo/utils"
import { buildOpenApi } from "./docs/openapi"

const app = express()
const spec = buildOpenApi()

app.use(express.json())

app.use("/v1/docs", swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }))
app.use("/v1", msRouter)

app.listen(API_GATEWAY_PORT, () => {
    console.log(`🚀 API Gateway running on ${API_GATEWAY_PORT}`)
})
