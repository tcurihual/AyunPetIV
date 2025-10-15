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

export const QuestionSchema = z.object({
    id: z.number(),
    content: z.string(),
    type: z.enum(["text", "number", "boolean", "select", "multiselect"]),
    created_at: z.string(),
    updated_at: z.string(),
    active: z.boolean(),
})

export const QuestionCreateSchema = QuestionSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    active: z.boolean().default(true),
})

export const QuestionUpdateSchema = QuestionSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).partial()

export const PostFormCreateSchema = z.object({
    post_id: z.number(),
    question_id: z.number(),
    answer: z.string(),
    active: z.boolean().default(true),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
})

export const PostFormUpdateSchema = PostFormCreateSchema.omit({ post_id: true }).partial()

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
