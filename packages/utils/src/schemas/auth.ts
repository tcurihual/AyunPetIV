import { z } from "zod"

export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(10, "El token es requerido."),
})
export const VerifyEmailResponseSchema = z.object({
  message: z.string(),
  type: z.enum(["success", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Debe ser un correo válido."),
})
export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
  type: z.enum(["success", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres."),
})
export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
  type: z.enum(["success", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
})
