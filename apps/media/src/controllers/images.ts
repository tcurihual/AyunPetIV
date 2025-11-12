import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs"
import fsp from "fs/promises"

import { HttpError } from "../middleware/upload"
import { PUBLIC_ENTITIES, UPLOADS_BASE, getAllFiles } from "../utils"
import { AppResponse, MEDIA_PUBLIC_URL } from "@repo/utils"

export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params

        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Acceso denegado a este tipo de entidad.")
        }

        const entityPath = path.join(UPLOADS_BASE, entityType)

        await fsp.access(entityPath).catch(() => {
            throw new HttpError(404, "No se encontraron archivos para este tipo de entidad.")
        })

        const allFiles = await getAllFiles(entityPath)
        const agrupados: Record<string, string[]> = {}

        for (const abs of allFiles) {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            const relPath = rel.replace(/\\/g, "/")
            const url = `${MEDIA_PUBLIC_URL}/${relPath}`

            const partes = relPath.split("/")
            const entityId = partes[2]

            if (!agrupados[entityId]) agrupados[entityId] = []
            agrupados[entityId].push(url)
        }

        return AppResponse(res, 200, "Archivos obtenidos correctamente.", agrupados)
    } catch (err) {
        next(err)
    }
}

export const getFilesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId } = req.params

        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Acceso denegado a este tipo de entidad.")
        }

        const entityPath = path.join(UPLOADS_BASE, entityType, entityId)

        await fsp.access(entityPath).catch(() => {
            throw new HttpError(404, "No se encontraron archivos para esta entidad.")
        })

        const allFiles = await getAllFiles(entityPath)
        const fileUrls = allFiles.map((abs) => {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            const relPath = rel.replace(/\\/g, "/")
            return `${MEDIA_PUBLIC_URL}/${relPath}`
        })

        return AppResponse(res, 200, "Archivos obtenidos correctamente.", fileUrls)
    } catch (err) {
        next(err)
    }
}

export const postFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Archivos recibidos:", req.files)

        const many = (req.files as Express.Multer.File[]) ?? []
        const one = req.file as Express.Multer.File | undefined
        const files = many.length ? many : one ? [one] : []

        if (!files.length) throw new HttpError(400, "No se proporcionaron archivos.")

        const { entityType, entityId } = req.params

        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Acceso denegado a este tipo de entidad.")
        }

        if (entityType === "users") {
            const folderPath = path.join(UPLOADS_BASE, entityType, entityId)
            if (fs.existsSync(folderPath)) {
                const existingFiles = fs.readdirSync(folderPath)
                for (const file of existingFiles) {
                    fs.unlinkSync(path.join(folderPath, file))
                }
            }
        }

        const uploaded = files.map((file) => ({
            url: `${MEDIA_PUBLIC_URL}/uploads/${entityType}/${entityId}/${file.filename}`,
            nombreArchivo: file.filename,
            tamaño: file.size,
            tipoMime: file.mimetype,
        }))

        return AppResponse(res, 201, "Archivos subidos correctamente.", uploaded)
    } catch (err) {
        next(err)
    }
}

export const deleteFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId } = req.params
        const { fileNamesArray } = req.body as { fileNamesArray?: string[] }

        if (!Array.isArray(fileNamesArray)) {
            throw new HttpError(400, "Parámetros inválidos. 'fileNamesArray' debe ser un arreglo.")
        }

        const resultados = { eliminados: [] as string[], noEncontrados: [] as string[] }

        await Promise.all(
            fileNamesArray.map(async (name) => {
                const p = path.join(UPLOADS_BASE, entityType, entityId, name)
                try {
                    await fsp.unlink(p)
                    resultados.eliminados.push(name)
                } catch (e: any) {
                    if (e?.code === "ENOENT") resultados.noEncontrados.push(name)
                    else throw e
                }
            })
        )

        const ok = resultados.eliminados.length > 0
        return AppResponse(
            res,
            ok ? 200 : 404,
            ok ? "Archivos procesados correctamente." : "No se encontraron archivos para eliminar.",
            resultados
        )
    } catch (err) {
        next(err)
    }
}
