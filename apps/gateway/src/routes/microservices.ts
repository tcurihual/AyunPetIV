import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { SERVER_URL, AUTH_PORT, ADOPTIONS_PORT, ENTITIES_PORT, MEDIA_PORT } from "@repo/utils"

export const msRouter = Router()

msRouter.use(
    "/auth",
    createProxyMiddleware({
        target: `${SERVER_URL}:${AUTH_PORT}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/auth": "",
        },
        proxyTimeout: 5000,
    })
)

msRouter.use(
    "/adoptions",
    createProxyMiddleware({
        target: `${SERVER_URL}:${ADOPTIONS_PORT}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/adoptions": "",
        },
        proxyTimeout: 5000,
    })
)
msRouter.use(
    "/entities",
    createProxyMiddleware({
        target: `${SERVER_URL}:${ENTITIES_PORT}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/entities": "",
        },
        proxyTimeout: 5000,
    })
)
msRouter.use(
    "/media",
    createProxyMiddleware({
        target: `${SERVER_URL}:${MEDIA_PORT}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/media": "",
        },
        proxyTimeout: 5000,
    })
)
