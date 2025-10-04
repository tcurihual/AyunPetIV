import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { AUTH_URL, ADOPTIONS_URL, ENTITIES_URL, MEDIA_URL } from "@repo/utils"

export const msRouter = Router()

msRouter.use(
    "/auth",
    createProxyMiddleware({
        target: `${AUTH_URL}`,
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
        target: `${ADOPTIONS_URL}`,
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
        target: `${ENTITIES_URL}`,
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
        target: `${MEDIA_URL}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/media": "",
        },
        proxyTimeout: 5000,
    })
)
