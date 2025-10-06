import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "../constants"

export type TokenPayload = JwtPayload & {
    id: number
    roleId?: number | null
}

export const generateAuthToken = (payload: TokenPayload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })

export const verifyAuthToken = (token: string): TokenPayload =>
    jwt.verify(token, JWT_SECRET) as TokenPayload
