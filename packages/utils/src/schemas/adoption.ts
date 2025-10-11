import { z } from "./zod-extended"

export const MineRequestResponseSchema = z.object({
  type: z.literal("success"),
  message: z.string(),
  data: z.object({
    as: z.enum(["giver", "adopter"]),
    requests: z.array(
      z.object({
        id: z.number(),
        postid: z.number(),
        status: z.string(),
        createdat: z.string(),
        updatedat: z.string(),
      })
    ),
  }),
})

export const ConfirmAcceptResponseSchema = z.object({
  type: z.literal("success"),
  message: z.string(),
  data: z.object({
    confirmation_code: z.string(),
  }),
})

export const ValidateCodeRequestSchema = z.object({
  code: z.string(),
})

export const ValidateCodeResponseSchema = z.object({
  type: z.literal("success"),
  message: z.string(),
  data: z.object({
    status: z.enum(["pendiente", "aprobado", "denegado", "completada"]),
  }),
})