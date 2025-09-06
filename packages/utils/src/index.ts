import { Request, Response, NextFunction } from "express"

export * from "./constants"

export type JsonResponse<T> = {
    status?: number
    message: string
    type: "success" | "error"
    values: T
}

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

export const log = (...args: unknown[]): void => {
    console.log("LOGGER: ", ...args)
}

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    log((err as Error).stack || "Uknown error from the error handler")

    if (!(err instanceof AppError)) {
        return res.status(500).json({ message: "Internal Server Error", type: "error" })
    }

    const jsonResponse: JsonResponse<typeof err.data | null> = {
        status: err.statusCode,
        message: err.message,
        type: "error",
        values: err.data ?? null,
    }

    return res.status(err.statusCode).json(jsonResponse)
}
