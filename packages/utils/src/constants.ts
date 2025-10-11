import dotenv from "dotenv"
import path from "path"
import { Secret } from "jsonwebtoken"

dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
    quiet: true,
})

export const SERVER_URL = process.env.SERVER_URL ?? "http://localhost"

export const API_GATEWAY_PORT = Number(process.env.API_GATEWAY_PORT ?? 3000)
export const AUTH_PORT = Number(process.env.AUTH_PORT ?? 4000)
export const ADOPTIONS_PORT = Number(process.env.ADOPTIONS_PORT ?? 5000)
export const ENTITIES_PORT = Number(process.env.ENTITIES_PORT ?? 6000)
export const MEDIA_PORT = Number(process.env.MEDIA_PORT ?? 7000)

export const API_GATEWAY_URL = `${SERVER_URL}:${API_GATEWAY_PORT}`
export const AUTH_URL = `${SERVER_URL}:${AUTH_PORT}`
export const ADOPTIONS_URL = `${SERVER_URL}:${ADOPTIONS_PORT}`
export const ENTITIES_URL = `${SERVER_URL}:${ENTITIES_PORT}`
export const MEDIA_URL = `${SERVER_URL}:${MEDIA_PORT}`

export const SUPABASE_URL = process.env.SUPABASE_URL
export const SUPABASE_KEY = process.env.SUPABASE_KEY

export const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "JWT_SECRET"
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "24h"

export const MAIL_USER = process.env.MAIL_USER
export const MAIL_PASS = process.env.MAIL_USER
