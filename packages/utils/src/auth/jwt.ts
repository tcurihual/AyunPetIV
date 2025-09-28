import jwt, { JwtPayload } from "jsonwebtoken"

import { JWT_SECRET } from "../constants"

export type TokenPayload = JwtPayload & {
    id: number
    role: number | null
}

export const generateAuthToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export const verifyAuthToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
}
