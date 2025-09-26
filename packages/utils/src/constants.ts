import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
    quiet: true,
})

export const SERVER_URL = process.env.SERVER_URL || "http://localhost"

export const API_GATEWAY_PORT = process.env.API_GATEWAY_PORT || "3000"
export const AUTH_PORT = process.env.AUTH_PORT || "4000"
export const ADOPTIONS_PORT = process.env.ADOPTIONS_PORT || "5000"
export const ENTITIES_PORT = process.env.ENTITIES_PORT || "6000"
export const MEDIA_PORT = process.env.MEDIA_PORT || "7000"

export const API_GATEWAY_URL = `${SERVER_URL}:${API_GATEWAY_PORT}`
export const AUTH_URL = `${SERVER_URL}:${AUTH_PORT}`
export const ADOPTIONS_URL = `${SERVER_URL}:${ADOPTIONS_PORT}`
export const ENTITIES_URL = `${SERVER_URL}:${ENTITIES_PORT}`
export const MEDIA_URL = `${SERVER_URL}:${MEDIA_PORT}`

export const SUPABASE_URL = process.env.SUPABASE_URL as string
export const SUPABASE_KEY = process.env.SUPABASE_KEY as string
