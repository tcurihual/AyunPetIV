import express from "express"
import swaggerUi from "swagger-ui-express"
import yaml from "yamljs"
import { createRequire } from "module"
import { msRouter } from "./routes/microservices"
import { createProxyMiddleware } from "http-proxy-middleware"
import { API_GATEWAY_PORT, SERVER_URL } from "@repo/utils"

const app = express()
app.use(express.json())

// try {
//     const spec = yaml.load(require.resolve("@repo/contracts/openapi.yaml"))
//     app.use("/v1/docs", swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }))
// } catch {}

app.get("/v1/health", (_req, res) => res.json({ ok: true }))
app.use("/v1", msRouter)

app.listen(API_GATEWAY_PORT, () => {
    console.log("🚀 API GATEWAY Funcionando")
})
