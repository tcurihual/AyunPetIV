import { z } from "./zod-extended"

export const RoleSchema = z.object({
    id: z.number(),
    roletype: z.enum(["admin", "user", "shelter"]),
})

export const UserSchema = z.object({
    id: z.number(),
    role: z.number(),
    rut: z.string(),
    email: z.email(),
    name: z.string(),
    password: z.string(),
    validated: z.boolean(),
    address: z.string(),
    description: z.string(),
    createdat: z.date(),
    updatedat: z.date(),
})

export const ReportSchema = z.object({
    id: z.number(),
    postid: z.number(),
    userid: z.number(),
    description: z.string(),
    resolved: z.boolean(),
    createdat: z.date(),
    updatedat: z.date(),
})

export const PostSchema = z.object({
    id: z.number(),
    creatorid: z.number(),
    petid: z.number(),
    title: z.string(),
    description: z.string(),
    status: z.string(),
    createdat: z.string(),
    updatedat: z.string(),
})

export const PetSchema = z.object({
    id: z.number(),
    ownerid: z.number(),
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    size: z.string(),
    species: z.string(),
    adopted: z.boolean(),
    sterilized: z.boolean(),
    createdat: z.string(),
    updatedat: z.string(),
})

const postPart = PostSchema.pick({
    title: true,
    description: true,
})

const petPart = PetSchema.omit({
    id: true,
    ownerid: true,
    adopted: true,
    createdat: true,
    updatedat: true,
})

export const MessageSchema = z.object({
    id: z.number(),
    creatorid: z.number(),
    postid: z.number(),
    description: z.string(),
    status: z.string(),
    createdat: z.string(),
    updatedat: z.string(),
})

export const MessageFormSchema = MessageSchema.pick({
    postid: true,
    description: true,
})

export const AdoptionRequestSchema = z.object({
    id: z.number(),
    userid: z.number(),
    postid: z.number(),
    message: z.string(),
    status: z.string(),
    createdat: z.string(),
    updatedat: z.string(),
})

export const AdoptionHistorySchema = z.object({
    id: z.number(),
    petid: z.number(),
    fromownerid: z.number(),
    toownerid: z.number(),
    postid: z.number(),
    createdat: z.string(),
})

export const ReportFormSchema = ReportSchema.omit({
    id: true,
    resolved: true,
    createdat: true,
    updatedat: true,
})

export const PostFormSchema = z.object({
    ...postPart.shape,
    ...petPart.shape,
})

export const AdoptionRequestFormSchema = AdoptionRequestSchema.pick({
    postid: true,
    description: true,
})
export const AdoptionHistoryFormSchema = AdoptionHistorySchema.omit({
    id: true,
    createdat: true,
})

export const UserReponseDTO = UserSchema.omit({ password: true })

export const LoginSchema = UserSchema.pick({ email: true, password: true })
export const RegisterSchema = UserSchema.omit({
    id: true,
    validated: true,
    createdat: true,
    updatedat: true,
})

export const GiverRequestResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            role: z.number(),
            rut: z.string(),
            files: z.array(z.string()),
        })
    ),
})

export const AdoptionHistoryResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.array(
        z.object({
            id: z.number(),
            petid: z.number(),
            fromownerid: z.number(),
            toownerid: z.number(),
            postid: z.number(),
            createdat: z.string(),
        })
    ),
})

export const ValidateGiverAccountParamsSchema = z.object({
    userId: z.string(),
})

export const ValidateGiverAccountDataSchema = UserSchema.pick({
    id: true,
    email: true,
    validated: true,
})

export const ValidateGiverAccountResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: ValidateGiverAccountDataSchema,
})

export const AdoptionHistoryByIdResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: AdoptionHistorySchema,
})

export const CreateAdoptionHistoryRequestSchema = AdoptionHistorySchema.omit({
    id: true,
    createdat: true,
})

export const CreateAdoptionHistoryResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: AdoptionHistorySchema,
})

export const UpdateAdoptionHistoryRequestSchema = AdoptionHistorySchema.omit({
    id: true,
    createdat: true,
}).partial()

export const UpdateAdoptionHistoryResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: AdoptionHistorySchema,
})

export const DeleteAdoptionHistoryResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.object({
        id: z.number(),
    }),
})

// ===== VERIFICATION CODE SCHEMAS =====

export const VerificationCodeSchema = z.object({
    id: z.number(),
    code: z.string(),
    type: z.enum(["verify", "reset", "adoption"]),
    user_id: z.number(),
    used: z.boolean(),
    created_at: z.string(),
    expires_at: z.string(),
})

export const CreateVerificationCodeRequestSchema = z.object({
    type: z.enum(["verify", "reset", "adoption"]),
    userId: z.number().optional(),
    duration: z.number().min(1).max(1440).optional(), // Entre 1 minuto y 24 horas
})

export const CreateVerificationCodeResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.object({
        id: z.number(),
        code: z.string(),
        type: z.enum(["verify", "reset", "adoption"]),
        expires_at: z.string(),
        user_id: z.number(),
    }),
})

export const ValidateVerificationCodeRequestSchema = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos"),
    type: z.enum(["verify", "reset", "adoption"], "Tipo debe ser: verify, reset o adoption"),
    userId: z.number(),
})

export const ValidateVerificationCodeResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.object({
        id: z.number(),
        type: z.enum(["verify", "reset", "adoption"]),
        user_id: z.number(),
        validated_at: z.string(),
    }),
})

export const GetUserVerificationCodesResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.array(
        z.object({
            id: z.number(),
            type: z.enum(["verify", "reset", "adoption"]),
            used: z.boolean(),
            created_at: z.string(),
            expires_at: z.string(),
        })
    ),
})
