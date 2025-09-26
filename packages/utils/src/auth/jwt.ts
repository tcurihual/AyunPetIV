import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

import { JWT_SECRET, JWT_EXPIRATION } from "../constants"

export type TokenPayload = JwtPayload & {
    id: string
    role: string
}

export const generateAuthToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export const verifyAuthToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
}
