import { Response, Request, NextFunction } from "express"
import { HttpError } from "../middleware/upload"
import { AppResponse } from "@repo/utils"

export const giverPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rut } = req.params

        const many = (req.files as Express.Multer.File[]) ?? []
        const one = req.file as Express.Multer.File | undefined
        const files = many.length ? many : one ? [one] : []

        if (!files.length) throw new HttpError(400, "No files were provided")

        const uploaded = files.map((file) => ({
            url: `/uploads/account-request/${rut}/${file.filename}`,
            fileName: file.filename,
            size: file.size,
            mime: file.mimetype,
        }))

        return AppResponse(res, 201, "Files uploaded successfully", uploaded)
    } catch (err) {
        next(err)
    }
}
