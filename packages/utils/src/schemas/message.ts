import { z } from "zod"

export const MessageBaseSchema = z.object({
  id: z.number().optional(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string().min(1, "El mensaje no puede estar vacío."),
  created_at: z.string().optional(),
})

export const MessageInsertSchema = MessageBaseSchema.omit({ id: true, created_at: true })

export const MessageUpdateSchema = MessageInsertSchema.partial()

export const MessageResponseSchema = MessageBaseSchema

export type MessageInsert = z.infer<typeof MessageInsertSchema>
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>
export type MessageResponse = z.infer<typeof MessageResponseSchema>
