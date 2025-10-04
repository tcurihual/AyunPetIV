import { Request, Response, NextFunction } from "express"
import { JsonResponse } from "./types"

export class AppError extends Error {
    public statusCode: number
    public data: Record<string, unknown> | unknown[] | null

    constructor(statusCode: number, message: string, data: Record<string, unknown> = {}) {
        super(message)
        this.statusCode = statusCode
        this.data = data
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.log((err as Error).stack || "Uknown error from the error handler")

    if (!(err instanceof AppError)) {
        return res.status(500).json({ message: "Internal Server Error", type: "error" })
    }

    const jsonResponse: JsonResponse<typeof err.data | null> = {
        message: err.message,
        type: "error",
        data: err.data ?? null,
    }

    return res.status(err.statusCode).json(jsonResponse)
}
