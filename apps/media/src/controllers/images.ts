import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs/promises"

import { HttpError } from "../middleware/upload"
import { PUBLIC_ENTITIES, UPLOADS_BASE, getAllFiles } from "../utils"
import { AppResponse, MEDIA_URL } from "@repo/utils"

export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params

        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Access denied to this entity type")
        }

        const entityPath = path.join(UPLOADS_BASE, entityType)

        await fs.access(entityPath).catch(() => {
            throw new HttpError(404, "No files found for this entity type")
        })

        const allFiles = await getAllFiles(entityPath)
        const grouped: Record<string, string[]> = {}

        for (const abs of allFiles) {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            const url = `${MEDIA_URL}/${rel.replace(/\\/g, "/")}`

            const parts = url.split("/")
            const entityId = parts[3]

            if (!grouped[entityId]) grouped[entityId] = []
            grouped[entityId].push(url)
        }

        return AppResponse(res, 200, "Files retrieved successfully", grouped)
    } catch (err) {
        next(err)
    }
}

export const getFilesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId } = req.params

        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Access denied to this entity type")
        }

        const entityPath = path.join(UPLOADS_BASE, entityType, entityId)

        await fs.access(entityPath).catch(() => {
            throw new HttpError(404, "No files found for this entityId")
        })

        const allFiles = await getAllFiles(entityPath)
        const fileUrls = allFiles.map((abs) => {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            return `${MEDIA_URL}/${rel.replace(/\\/g, "/")}`
        })

        return AppResponse(res, 200, "Files retrieved successfully", fileUrls)
    } catch (err) {
        next(err)
    }
}

export const postFiles = (req: Request, res: Response, next: NextFunction) => {
    try {
        const many = (req.files as Express.Multer.File[]) ?? []
        const one = req.file as Express.Multer.File | undefined
        const files = many.length ? many : one ? [one] : []

        if (!files.length) throw new HttpError(400, "No files were provided")

        const { entityType, entityId } = req.params
        // Validar que el entityType esté permitido (misma lista que en GET)
        if (!PUBLIC_ENTITIES.includes(entityType)) {
            throw new HttpError(403, "Access denied to this entity type")
        }

        // Calcular totals y parsear metadata enviada por el cliente (original/compressed sizes)
        const total = files.reduce((s, f) => s + (f.size || 0), 0)

        let metas: Array<{ fileName: string; compressedSize?: number; originalSize?: number }> = []
        try {
            // Primero intentar body (multipart text fields)
            const raw =
                (req.body && req.body.filesMeta) || req.body?.filesmeta || req.body?.filesMetaJSON
            // Si no viene por body, intentar header fallback 'x-files-meta'
            const headerRaw =
                (!raw && req.headers && (req.headers["x-files-meta"] as string)) || undefined
            const source = raw || headerRaw
            if (raw) {
                if (Array.isArray(raw)) {
                    metas = raw
                        .map((r) => {
                            try {
                                return JSON.parse(r)
                            } catch (e) {
                                return typeof r === "object" ? r : null
                            }
                        })
                        .filter(Boolean) as any
                } else if (typeof raw === "string") {
                    // Could be a single JSON string for an array or object
                    try {
                        const parsed = JSON.parse(raw)
                        if (Array.isArray(parsed)) metas = parsed
                        else metas = [parsed]
                    } catch (e) {
                        // Not JSON: ignore
                    }
                } else if (typeof raw === "object") {
                    metas = [raw]
                }
            } else if (headerRaw) {
                // headerRaw is a string with JSON (array or object)
                try {
                    const parsed = JSON.parse(headerRaw)
                    metas = Array.isArray(parsed) ? parsed : [parsed]
                } catch (e) {
                    // ignore
                }
            }
        } catch (e) {
            // ignore parse errors
        }

        // Correlacionar por file.originalname (nombre enviado por cliente) cuando sea posible
        const detailed = files.map((f) => {
            const meta = metas.find((m) => m.fileName === (f.originalname || f.filename))
            return {
                fileNameSaved: f.filename,
                originalName: f.originalname,
                sizeReceived: f.size,
                mime: f.mimetype,
                originalSizeReported: meta?.originalSize,
                compressedSizeReported: meta?.compressedSize,
            }
        })

        const uploaded = files.map((file) => ({
            url: `${MEDIA_URL}/uploads/${entityType}/${entityId}/${file.filename}`,
            fileName: file.filename,
            size: file.size,
            mime: file.mimetype,
        }))

        return AppResponse(res, 201, "Files uploaded successfully", uploaded)
    } catch (err) {
        next(err)
    }
}

export const deleteFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId } = req.params
        const { fileNamesArray } = req.body as { fileNamesArray?: string[] }

        if (!Array.isArray(fileNamesArray)) {
            throw new HttpError(
                400,
                "Missing or invalid parameters. 'fileNamesArray' must be an array."
            )
        }

        const results = { deleted: [] as string[], notFound: [] as string[] }

        await Promise.all(
            fileNamesArray.map(async (name) => {
                const p = path.join(UPLOADS_BASE, entityType, entityId, name)
                try {
                    await fs.unlink(p)
                    results.deleted.push(name)
                } catch (e: any) {
                    if (e?.code === "ENOENT") results.notFound.push(name)
                    else throw e
                }
            })
        )

        const ok = results.deleted.length > 0
        return AppResponse(
            res,
            ok ? 200 : 404,
            ok ? "Files processed." : "No files were found to be deleted.",
            results
        )
    } catch (err) {
        next(err)
    }
}
