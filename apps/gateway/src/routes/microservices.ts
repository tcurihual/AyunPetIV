import { Router, Request } from "express"
import { createProxyMiddleware, Options, RequestHandler } from "http-proxy-middleware"
import { ClientRequest } from "http"

import { AUTH_URL, ADOPTIONS_URL, ENTITIES_URL, MEDIA_URL } from "@repo/utils"
import { verifyAuth } from "../middlewares/verifyAuth"
import { checkAuth } from "../controllers/checkAuth"

export const msRouter = Router()

msRouter.use(
    "/auth",
    createProxyMiddleware({
        target: `${AUTH_URL}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/auth": "",
        },
        proxyTimeout: 10000, // Aumentar timeout
        on: {
            proxyReq: (proxyReq, req) => {
                console.log(`🌐 [GATEWAY] Proxying ${req.method} ${req.url} to ${AUTH_URL}`)
                console.log(`🌐 [GATEWAY] Target URL: ${proxyReq.path}`)
            },
            proxyRes: (proxyRes, req) => {
                console.log(`🌐 [GATEWAY] Response from auth service: ${proxyRes.statusCode}`)
            },
            error: (err, req, res) => {
                console.error(`❌ [GATEWAY] Proxy error for ${req.method} ${req.url}:`, err.message)
            },
        },
    })
)

msRouter.use(
    "/adoptions",
    verifyAuth,
    createProxyMiddleware({
        target: `${ADOPTIONS_URL}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/adoptions": "",
        },
        proxyTimeout: 5000,
        on: {
            proxyReq: (proxyReq: ClientRequest, req: Request) => {
                if (req.user) {
                    proxyReq.setHeader("x-user-id", req.user.id)
                    proxyReq.setHeader("x-user-role", req.user.role!!)
                }
            },
        },
    })
)
msRouter.use(
    "/entities",
    verifyAuth,
    createProxyMiddleware({
        target: `${ENTITIES_URL}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/entities": "",
        },
        proxyTimeout: 5000,
        on: {
            proxyReq: (proxyReq: ClientRequest, req: Request) => {
                if (req.user) {
                    proxyReq.setHeader("x-user-id", req.user.id)
                    proxyReq.setHeader("x-user-role", req.user.role!!)
                }
            },
        },
    })
)
// Media proxy: allow public GETs to /uploads/* (image files), require auth for other operations
msRouter.use(
    "/media",
    // conditional middleware: skip verifyAuth for GET /uploads/* so images are publicly accessible
    (req, res, next) => {
        try {
            const isUploadsGet = req.method === "GET" && req.path && req.path.startsWith("/uploads")
            if (isUploadsGet) return next()
            return verifyAuth(req as any, res as any, next as any)
        } catch (err) {
            return next(err)
        }
    },
    createProxyMiddleware({
        target: `${MEDIA_URL}`,
        changeOrigin: true,
        pathRewrite: {
            "^/v1/media": "",
        },
        proxyTimeout: 5000,
        on: {
            proxyReq: (proxyReq: ClientRequest, req: Request) => {
                if (req.user) {
                    proxyReq.setHeader("x-user-id", req.user.id)
                    proxyReq.setHeader("x-user-role", req.user.role!!)
                }
            },
        },
    })
)

msRouter.use("/check-auth", verifyAuth, checkAuth)
