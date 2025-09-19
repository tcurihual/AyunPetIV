import multer, { diskStorage } from "multer"
import path from "path"
import fs from "fs"

class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = "HttpError"
    }
}

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"]

const storage = diskStorage({
    destination: (req, _file, cb) => {
        const { entityType, entityId } = req.params as { entityType?: string; entityId?: string }
        if (!entityType || !entityId)
            return cb(new HttpError(400, "entityType y entityId son requeridos"), "")
        const uploadPath = path.join(__dirname, "..", "uploads", entityType, entityId)
        ensureDir(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        cb(null, `${req.params.entityType}-${unique}${ext}`)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
        cb(new HttpError(415, "Formato no permitido (JPG/PNG/PDF)"))
    },
})

export default upload
export { HttpError }
