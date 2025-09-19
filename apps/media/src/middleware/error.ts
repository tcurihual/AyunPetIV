import type { Request, Response, NextFunction } from "express"
import multer from "multer"
import { HttpError } from "./upload"

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE")
            return res.status(413).json({ error: "Archivo excede 5MB" })
        if (err.code === "LIMIT_UNEXPECTED_FILE")
            return res.status(400).json({ error: "Campo/archivo no esperado" })
        return res.status(400).json({ error: err.message })
    }
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
    return res.status(500).json({ error: "Error interno" })
}
