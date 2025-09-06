import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
    quiet: true,
})

export const SERVER_URL = process.env.SERVER_URL

export const AUTH_PORT = process.env.AUTH_PORT
export const ADOPTIONS_PORT = process.env.ADOPTIONS_PORT
export const ENTITIES_PORT = process.env.ENTITIES_PORT
export const MEDIA_PORT = process.env.MEDIA_PORT

