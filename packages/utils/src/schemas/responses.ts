import { z } from "./zod-extended"
import { z as baseZ } from "zod"
import { UserReponseDTO } from "./entities"

export const createApiResponseSchema = <T extends baseZ.ZodTypeAny>(valuesSchema: T) =>
    BaseResponseSchema.extend({
        values: valuesSchema,
    })

export const BaseResponseSchema = z.object({
    message: z.string(),
    type: z.enum(["success"]),
})

export const ErrorValuesSchema = z.object({
    message: z.string(),
    type: z.enum(["error"]),
})

export const LoginResponseSchema = createApiResponseSchema(
    z.object({
        token: z.string(),
        user: UserReponseDTO,
    })
)
