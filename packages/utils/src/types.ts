import { z } from "zod"
import { loginResponseSchema, userSchema } from "./schemas"

export type JsonResponse<T> = {
    status?: number
    message: string
    type: "success" | "error"
    data: T
}

export type loginResponseType = z.infer<typeof loginResponseSchema>
export type User = z.infer<typeof userSchema>
