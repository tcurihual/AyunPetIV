import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs/promises"

import { getAllFiles, UPLOADS_BASE } from "../utils"
import { HttpError } from "../middleware/upload"
import { AppResponse, MEDIA_PUBLIC_URL } from "@repo/utils"

export const giverPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rut } = req.params

        const many = (req.files as Express.Multer.File[]) ?? []
        const one = req.file as Express.Multer.File | undefined
        const files = many.length ? many : one ? [one] : []

        if (!files.length) throw new HttpError(400, "No files were provided")

        const uploaded = files.map((file) => ({
            url: `${MEDIA_PUBLIC_URL}/uploads/account-request/${rut}/${file.filename}`,
            fileName: file.filename,
            size: file.size,
            mime: file.mimetype,
        }))

        return AppResponse(res, 201, "Files uploaded successfully", uploaded)
    } catch (err) {
        next(err)
    }
}

export const getGiverFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filesPath = path.join(UPLOADS_BASE, "account-request")
        await fs.access(filesPath).catch(() => {
            throw new HttpError(404, "No files found for this entity type")
        })

        const allFiles = await getAllFiles(filesPath)
        const grouped: Record<string, string[]> = {}

        for (const abs of allFiles) {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            const relPath = rel.replace(/\\/g, "/")
            const url = `${MEDIA_PUBLIC_URL}/${relPath}`

            const partsRel = relPath.split("/")
            const entityId = partsRel[2]

            if (!grouped[entityId]) grouped[entityId] = []
            grouped[entityId].push(url)
        }

        return AppResponse(res, 200, "Files retrieved successfully", grouped)
    } catch (err) {
        next(err)
    }
}
