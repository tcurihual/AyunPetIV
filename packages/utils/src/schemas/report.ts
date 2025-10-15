import { z } from "zod"

export const ReportBaseSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  postId: z.number(),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres."),
  created_at: z.string().optional(),
})


export const ReportInsertSchema = ReportBaseSchema.omit({ id: true, created_at: true })

export const ReportUpdateSchema = ReportInsertSchema.partial()

export const ReportResponseSchema = ReportBaseSchema

export type ReportInsert = z.infer<typeof ReportInsertSchema>
export type ReportUpdate = z.infer<typeof ReportUpdateSchema>
export type ReportResponse = z.infer<typeof ReportResponseSchema>
