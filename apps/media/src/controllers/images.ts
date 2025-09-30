import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs/promises"

import { HttpError } from "../middleware/upload"
import { AppResponse } from "@repo/utils"

const UPLOADS_BASE = path.join(__dirname, "..", "uploads")

const getAllFiles = async (dirPath: string, out: string[] = []): Promise<string[]> => {
    const entries = await fs.readdir(dirPath)
    for (const entry of entries) {
        const full = path.join(dirPath, entry)
        const st = await fs.stat(full)
        if (st.isDirectory()) await getAllFiles(full, out)
        else out.push(full)
    }
    return out
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

export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params
        const entityPath = path.join(UPLOADS_BASE, entityType)

        await fs.access(entityPath).catch(() => {
            throw new HttpError(404, "No files found for this entity type")
        })

        const allFiles = await getAllFiles(entityPath)
        const fileUrls = allFiles.map((abs) => {
            const rel = path.relative(path.join(__dirname, ".."), abs)
            return `/${rel.replace(/\\/g, "/")}`
        })

        return res.status(200).json({ message: "Files retrieved successfully", data: fileUrls })
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
        return res.status(ok ? 200 : 404).json({
            message: ok ? "Files processed." : "No files were found to be deleted.",
            data: results,
        })
    } catch (err) {
        next(err)
    }
}
