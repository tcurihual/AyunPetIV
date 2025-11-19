import { z } from "zod"

export const createVerificationCodeR = z.object({
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number().optional(),
    duration: z.number().min(1).max(1440).optional(),
})

export const validateVerificationCodeR = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos"),
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number(),
})

export const userIdParamR = z.object({
    user_id: z.string().transform((val) => parseInt(val, 10)),
})
