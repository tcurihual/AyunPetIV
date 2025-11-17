import multer, { FileFilterCallback } from "multer"
import type { Request } from "express"

const storage = multer.memoryStorage()

// Tipos permitidos para documentos y perfiles
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Solo se permiten imágenes (JPEG, PNG, WEBP) o PDFs"))
    }
}

export const uploadGiverDocuments = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter,
}).array("documents", 5)

export const uploadProfile = multer({
    storage,
    fileFilter,
}).fields([
    { name: "image", maxCount: 1 },
    { name: "mural", maxCount: 1 },
])
