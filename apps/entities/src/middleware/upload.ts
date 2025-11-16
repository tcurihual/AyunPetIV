import multer from "multer"

/**
 * Configuración de multer para manejar documentos de solicitud de dador
 * Acepta imágenes y PDFs
 */
export const uploadGiverDocuments = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        // Aceptar imágenes y PDFs
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf",
        ]

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Solo se permiten imágenes (JPEG, PNG, WEBP) o archivos PDF"))
        }
    },
})
