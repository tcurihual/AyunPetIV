import { z } from "schemas/zod-extended"

import { UserSchema } from "schemas/entities"
import { DocumentsSchema } from "schemas/media"

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

// Responses
export const UserReponseDTO = UserSchema.omit({ password: true })

export const VerifyEmailResponseSchema = z.object({
    message: z.string(),
    type: z.enum(["success", "error"]),
    data: z.record(z.string(), z.unknown()).optional(),
})

export const ForgotPasswordResponseSchema = z.object({
    message: z.string(),
    type: z.enum(["success", "error"]),
    data: z.record(z.string(), z.unknown()).optional(),
})

export const ResetPasswordResponseSchema = z.object({
    message: z.string(),
    type: z.enum(["success", "error"]),
    data: z.record(z.string(), z.unknown()).optional(),
})
