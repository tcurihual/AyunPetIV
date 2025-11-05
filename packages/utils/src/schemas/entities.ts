import { z } from "./zod-extended"

export const RoleSchema = z.object({
    id: z.number(),
    roletype: z.enum(["admin", "user", "shelter", "giver"]),
})

export const UserSchema = z.object({
    id: z.number(),
    role: z.number(),
    rut: z.string(),
    email: z.email(),
    name: z.string(),
    password: z.string(),
    validated: z.boolean(),
    address: z.string().optional(),
    description: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
})

export const ReportSchema = z.object({
    id: z.number(),
    post_id: z.number(),
    user_id: z.number(),
    description: z.string(),
    resolved: z.boolean(),
    created_at: z.date(),
    updated_at: z.date(),
})

export const PostSchema = z.object({
    id: z.number(),
    creator_id: z.number(),
    pet_id: z.number(),
    title: z.string(),
    description: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const PetSchema = z.object({
    id: z.number(),
    owner_id: z.number(),
    name: z.string(),
    age_years: z.number(),
    age_months: z.number(),
    gender: z.string(),
    size: z.string(),
    species: z.string(),
    adopted: z.boolean(),
    sterilized: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
})

const postPart = PostSchema.pick({
    title: true,
    description: true,
})

const petPart = PetSchema.omit({
    id: true,
    owner_id: true,
    adopted: true,
    created_at: true,
    updated_at: true,
})

export const MessageSchema = z.object({
    id: z.number(),
    creator_id: z.number(),
    post_id: z.number(),
    description: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const MessageFormSchema = MessageSchema.pick({
    post_id: true,
    description: true,
})

export const AdoptionRequestSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    post_id: z.number(),
    message: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const AdoptionHistorySchema = z.object({
    id: z.number(),
    petid: z.number(),
    from_owner_id: z.number(),
    to_owner_id: z.number(),
    postid: z.number(),
    createdat: z.string(),
})

export const ReportFormSchema = ReportSchema.omit({
    id: true,
    resolved: true,
    created_at: true,
    updated_at: true,
})

export const PostFormSchema = z.object({
    ...postPart.shape,
    ...petPart.shape,
})

export const AdoptionRequestFormSchema = AdoptionRequestSchema.pick({
    post_id: true,
    description: true,
})
export const AdoptionHistoryFormSchema = AdoptionHistorySchema.omit({
    id: true,
    created_at: true,
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
    id_post: z.number().int().positive(),
    id_question: z.number().int().positive(),
})

export const ValidateGiverAccountParamsSchema = z.object({
    userId: z.string(),
})

export const ValidateGiverAccountDataSchema = UserSchema.pick({
    id: true,
    email: true,
    validated: true,
})

// Schema para solicitud de conversión de usuario a dador
export const SubmitGiverRequestSchema = z.object({
    userId: z.number().int().positive(),
})

export const CreateAdoptionHistoryRequestSchema = AdoptionHistorySchema.omit({
    id: true,
    createdat: true,
})

export const UpdateAdoptionHistoryRequestSchema = AdoptionHistorySchema.omit({
    id: true,
    createdat: true,
}).partial()

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

export const CreateVerificationCodeRequestSchema = VerificationCodeSchema.pick({
    user_id: true,
    type: true,
})

export const ValidateVerificationCodeRequestSchema = VerificationCodeSchema.pick({
    code: true,
    type: true,
    user_id: true,
})

// ============================================
// Esquemas extendidos con imágenes para comunicación entre microservicios
// ============================================

/**
 * Esquema de Post extendido con imágenes obtenidas desde el microservicio de Media
 */
// export const PostWithImagesSchema = PostSchema.extend({
//     images: z
//         .array(z.string())
//         .describe("URLs de imágenes del post obtenidas desde el microservicio de Media"),
// })

/**
 * Esquema de Pet extendido con imágenes obtenidas desde el microservicio de Media
 */
// export const PetWithImagesSchema = PetSchema.extend({
//     images: z
//         .array(z.string())
//         .describe("URLs de imágenes de la mascota obtenidas desde el microservicio de Media"),
// })

/**
 * Esquema de User extendido con imágenes obtenidas desde el microservicio de Media
 */
export const UserWithImagesSchema = UserSchema.omit({ password: true }).extend({
    images: z
        .array(z.string())
        .describe(
            "URLs de imágenes de perfil del usuario obtenidas desde el microservicio de Media"
        ),
})

/**
 * Respuesta de listado de usuarios con imágenes de perfil
 */
export const UsersWithImagesResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.object({
        items: z.array(UserWithImagesSchema),
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
    }),
})

/**
 * Respuesta de un usuario individual con imágenes
 */
export const UserByIdWithImagesResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: UserWithImagesSchema,
})

/**
 * Esquema de solicitud de adopción extendido con imágenes del post
 */
export const AdoptionRequestWithImagesSchema = AdoptionRequestSchema.extend({
    postImages: z
        .array(z.string())
        .describe("URLs de imágenes del post asociado obtenidas desde el microservicio de Media"),
})

/**
 * Respuesta de listado de solicitudes de adopción con imágenes
 */
export const AdoptionRequestsWithImagesResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: z.array(AdoptionRequestWithImagesSchema),
})

/**
 * Respuesta de una solicitud de adopción individual con imágenes
 */
export const AdoptionRequestByIdWithImagesResponseSchema = z.object({
    type: z.literal("success"),
    message: z.string(),
    data: AdoptionRequestWithImagesSchema,
})
