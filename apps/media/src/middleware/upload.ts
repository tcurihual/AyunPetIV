import multer, { diskStorage } from "multer"
import path from "path"
import fs from "fs"

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = "HttpError"
    }
}

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function safeOriginalName(original: string) {
    const base = path.basename(original)
    return base.replace(/[\/\\]/g, "_")
}

export function uniqueName(dir: string, name: string) {
    const ext = path.extname(name)
    const base = path.basename(name, ext)
    let candidate = path.join(dir, base + ext)
    let i = 1
    while (fs.existsSync(candidate)) {
        candidate = path.join(dir, `${base}-${i}${ext}`)
        i++
    }
    return path.basename(candidate)
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"]

const publicStorage = diskStorage({
    destination: (req, _file, cb) => {
        const { entityType, entityId } = req.params
        if (!entityType || !entityId)
            return cb(new HttpError(400, "entityType y entityId son requeridos"), "")
        // Validar entityType antes de crear carpetas/guardar archivos
        const { PUBLIC_ENTITIES } = require("../utils") as typeof import("../utils")
        if (!PUBLIC_ENTITIES.includes(entityType)) {
            return cb(new HttpError(403, "Access denied to this entity type"), "")
        }
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

export const publicUpload = multer({
    storage: publicStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
        cb(new HttpError(415, "Formato no permitido (JPG/PNG/PDF)"))
    },
})

export const accountRequestStorage = diskStorage({
    destination: (req, _file, cb) => {
        const { rut } = req.params
        if (!rut) return cb(new HttpError(400, "rut es requerido"), "")
        const uploadPath = path.join(__dirname, "..", "uploads", "account-request", rut)
        ensureDir(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const original = safeOriginalName(file.originalname)
        const dir = path.join(__dirname, "..", "uploads", "account-request", req.params.rut)
        const final = uniqueName(dir, original)

        cb(null, final)
    },
})

export const uploadAccountRequest = multer({
    storage: accountRequestStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
        cb(new HttpError(415, "Formato no permitido (JPG/PNG/PDF)"))
    },
})
