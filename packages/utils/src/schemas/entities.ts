import { z } from "./zod-extended"

export const userSchema = z.object({
    id: z.number(),
    role: z.number(),
    rut: z.string(),
    email: z.email(),
    name: z.string(),
    password: z.string(),
    validated: z.boolean(),
    address: z.string().optional(),
    description: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
})

export const userReponseDTO = userSchema.omit({ password: true })

export const loginSchema = userSchema.pick({ email: true, password: true })
export const registerSchema = userSchema.omit({
    id: true,
    validated: true,
    createdAt: true,
    updatedAt: true,
})
