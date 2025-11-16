import { UserReponseDTO } from "./auth"
import {
    AdoptionHistorySchema,
    ReportFormSchema,
    ReportSchema,
    UserWithImagesPrivateSchema,
    ValidateGiverAccountDataSchema,
    VerificationCodeSchema,
} from "./entities"
import { z } from "./zod-extended"
import { z as baseZ } from "zod"

export const createApiResponseSchema = <T extends baseZ.ZodTypeAny>(valuesSchema: T) =>
    BaseResponseSchema.extend({
        data: valuesSchema,
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

export const ReportResponseSchema = createApiResponseSchema(ReportSchema)

const userResponseGiverDTO = UserReponseDTO.omit({
    created_at: true,
    updated_at: true,
    validated: true,
    address: true,
    description: true,
})

export const GiverRequestResponseSchema = createApiResponseSchema(
    z.object({
        ...userResponseGiverDTO.shape,
        files: z.object(z.string),
    })
)

export const AdoptionHistoryResponseSchema = createApiResponseSchema(
    z.object({
        id: z.number(),
        petid: z.number(),
        from_owner_id: z.number(),
        to_owner_id: z.number(),
        post_id: z.number(),
        created_at: z.string(),
    })
)
export const ValidateGiverAccountResponseSchema = createApiResponseSchema(
    ValidateGiverAccountDataSchema
)

export const AdoptionHistoryByIdResponseSchema = createApiResponseSchema(AdoptionHistorySchema)

export const CreateAdoptionHistoryResponseSchema = createApiResponseSchema(AdoptionHistorySchema)

export const UpdateAdoptionHistoryResponseSchema = createApiResponseSchema(AdoptionHistorySchema)

export const DeleteAdoptionHistoryResponseSchema = createApiResponseSchema(
    AdoptionHistorySchema.pick({ id: true })
)
export const CreateVerificationCodeResponseSchema = createApiResponseSchema(
    VerificationCodeSchema.pick({ code: true, expires_at: true })
)

export const ValidateVerificationCodeResponseSchema = createApiResponseSchema(
    VerificationCodeSchema.pick({ id: true, type: true, user_id: true })
)

export const GetUserVerificationCodesResponseSchema = createApiResponseSchema(
    VerificationCodeSchema.omit({ code: true, user_id: true })
)

export const ConfirmAcceptResponseSchema = createApiResponseSchema(
    z.object({
        id: z.number(),
        confirmation_code: z.string(),
        expiresAt: z.string(),
    })
)

export const ValidateCodeResponseSchema = createApiResponseSchema(
    z.object({
        status: z.enum(["pendiente", "aprobado", "denegado", "completada"]),
    })
)

export const UserWithImagesResponseSchema = createApiResponseSchema(UserWithImagesPrivateSchema)
