import { Request, Response } from "express"
import { AppError } from "@repo/utils"

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
    console.log("--------")
    return res.status(201).json({
        message: "Images uploaded succesfully",
        data: uploadedImages,
    })
}
