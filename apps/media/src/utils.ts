import multer, { diskStorage } from "multer"
import path from "path"
import fs from "fs"
import { AppError } from "@repo/utils"

const createDirectory = (directory: string) => {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true })
}

const storage = diskStorage({
    destination: (req, file, cb) => {
        const entityType = req.params.entityType // se espera que se envie el tipo de entidad "user", "orga", "pet"
        const entityId = req.params.entityId // se espera que se envie el id de la entidad

        if (!entityType || !entityId) {
            return cb(new AppError(404, "entityType or entityId wasn't provided"), "")
        }

        // Formato de almacenamiento de imagenes || archivos, segun tipo de entidad:
        // Entity: "Organization" || "User" || "Pet"
        // Path: media/uploads/${Entity}/${Entity.id}/${file_uploaded}

        const uploadPath = path.join(__dirname, "..", "uploads", entityType, entityId)
        createDirectory(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname)
        cb(null, `${Date.now()}${extension}`)
    },
})

const upload = multer({ storage: storage })

export default upload
