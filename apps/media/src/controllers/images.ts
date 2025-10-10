import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs/promises"

import { HttpError } from "../middleware/upload"
import { PUBLIC_ENTITIES, UPLOADS_BASE, getAllFiles } from "../utils"
import { AppResponse } from "@repo/utils"

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
            const url = `/${rel.replace(/\\/g, "/")}`

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
            return `/${rel.replace(/\\/g, "/")}`
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
        const uploaded = files.map((file) => ({
            url: `/uploads/${entityType}/${entityId}/${file.filename}`,
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
