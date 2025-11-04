import { z } from "./zod-extended"

import { UserSchema } from "./entities"
import { DocumentsSchema } from "./media"

// Requests

export const LoginSchema = UserSchema.pick({ email: true, password: true })

export const UserRegisterSchema = UserSchema.pick({
    name: true,
    email: true,
    password: true,
    rut: true,
    address: true,
    description: true,
})

export const GiverRegisterSchema = z.object({
    ...UserRegisterSchema.shape,
    ...DocumentsSchema.shape,
})

export const VerifyEmailRequestSchema = z.object({
    token: z.string(),
})

export const ForgotPasswordRequestSchema = UserSchema.pick({
    email: true,
})

export const ResetPasswordRequestSchema = z.object({
    ...VerifyEmailRequestSchema.shape,
    ...ForgotPasswordRequestSchema.shape,
})

export const CheckUserExistsSchema = z.object({
    email: z.string().email("Debe ser un email válido").optional(),
    rut: z.string().optional(),
})

// Responses
export const UserReponseDTO = UserSchema.omit({ password: true })
