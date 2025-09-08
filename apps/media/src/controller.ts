import { Request, Response } from "express"
import path from "path"
import fs from "fs/promises"
import { AppError } from "@repo/utils"

const getAllFiles = async (dirPath: string, arrayOfFiles: string[] = []) => {
    const files = await fs.readdir(dirPath)

    for (const file of files) {
        const fullPath = path.join(dirPath, file)
        const stats = await fs.stat(fullPath)
        if (stats.isDirectory()) {
            arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles)
        } else {
            arrayOfFiles.push(fullPath)
        }
    }

    return arrayOfFiles
}

export const postImage = (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
        throw new AppError(400, "No files were provided")
    }

    const { entityType, entityId } = req.params
    const uploadedImages = files.map((file) => {
        return {
            url: `/uploads/${entityType}/${entityId}/${file.filename}`,
            fileName: file.filename,
        }
    })

    return res.status(201).json({
        message: "Images uploaded succesfully",
        data: uploadedImages,
    })
}

export const getImages = async (req: Request, res: Response) => {
    const { entityType } = req.params
    const entityPath = path.join(__dirname, "..", "uploads", entityType)

    try {
        await fs.access(entityPath)
    } catch (error) {
        throw new AppError(404, "No images found for this entity type")
    }

    const allFiles = await getAllFiles(entityPath)

    const imageUrls = allFiles.map((filePath) => {
        const relativePath = path.relative(path.join(__dirname, ".."), filePath)
        return `/${relativePath.replace(/\\/g, "/")}`
    })

    return res.status(200).json({
        message: "Images retrieved successfully",
        data: imageUrls,
    })
}

export const deleteImage = async (req: Request, res: Response) => {
    const { entityType, entityId } = req.params
    const { imageNamesArray } = req.body

    if (!imageNamesArray) {
        throw new AppError(400, "Missing 'imageNamesArray' in the request body")
    }

    if (!entityType || !entityId || !Array.isArray(imageNamesArray)) {
        throw new AppError(
            400,
            "Missing or invalid parameters. 'imageNamesArray' must be a valid array."
        )
    }

    const results = {
        deleted: [] as string[],
        notFound: [] as string[],
    }

    const deletionPromises = imageNamesArray.map(async (imageName: string) => {
        const imagePath = path.join(__dirname, "..", "uploads", entityType, entityId, imageName)
        try {
            await fs.access(imagePath)
            await fs.unlink(imagePath)
            results.deleted.push(imageName)
        } catch (error: any) {
            if (error.code === "ENOENT") {
                results.notFound.push(imageName)
            } else {
                console.error(`Failed to delete ${imageName}:`, error)
            }
        }
    })

    await Promise.all(deletionPromises)

    if (results.deleted.length > 0) {
        return res.status(200).json({
            message: "Images processed.",
            data: results,
        })
    } else {
        return res.status(404).json({
            message: "No images were found to be deleted.",
            data: results,
        })
    }
}
