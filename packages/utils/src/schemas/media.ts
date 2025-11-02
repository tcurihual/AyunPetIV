import { z } from "schemas/zod-extended"

export const DocumentsSchema = z.object({
    documents: z.array(z.string()),
})

export const FilesSchema = z.object({
    files: z.array(z.string()),
})

export const ImagesSchema = z.object({
    images: z.array(z.string()),
})
