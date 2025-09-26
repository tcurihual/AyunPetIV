import { z } from "./zod-extended"
import { z as baseZ } from "zod"
import { userReponseDTO } from "./entities"

export const createApiResponseSchema = <T extends baseZ.ZodTypeAny>(valuesSchema: T) =>
    baseResponseSchema.extend({
        values: valuesSchema,
    })

export const baseResponseSchema = z.object({
    message: z.string(),
    type: z.enum(["success"]),
})

export const errorValuesSchema = z.object({
    message: z.string(),
    type: z.enum(["error"]),
})

export const loginResponseSchema = createApiResponseSchema(
    z.object({
        token: z.string(),
        user: userReponseDTO,
    })
)
