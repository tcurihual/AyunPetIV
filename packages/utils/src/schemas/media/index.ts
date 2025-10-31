import { z } from "schemas/zod-extended"

export const DocumentsSchema = z.object({
    documents: z.array(z.string()),
})
