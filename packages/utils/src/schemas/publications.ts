import { PetSchema, PostSchema } from "./entities"
import { createApiResponseSchema } from "./responses"
import { z } from "./zod-extended"

export const PostWithImagesSchema = z.object({
    ...PostSchema.shape,
    images: z.array(z.string()).default([]),
})

export const PetWithImagesSchema = z.object({
    ...PetSchema.shape,
    images: z.array(z.string()).default([]),
})

export const PublicationBodySchema = PostSchema.pick({
    title: true,
    description: true,
    status: true,
}).extend(
    PetSchema.omit({
        id: true,
        created_at: true,
        updated_at: true,
        adopted: true,
    }).shape
)

export const CreatePublicationBodySchema = z.object({
    ...PublicationBodySchema.shape,
    files: z.array(z.string()),
})

export const UpdatePublicationBodySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    species: z.string().optional(),
    gender: z.string().optional(),
    age_months: z.coerce.number().optional(),
    age_years: z.coerce.number().optional(),
    size: z.string().optional(),
    sterilized: z.boolean(),
    name: z.string(),
    files: z.array(z.string()),
})

export const PetByIdWithImagesResponseSchema = createApiResponseSchema(
    z.object({ pet: PetWithImagesSchema })
)
export const CreatePublicationResponseSchema = createApiResponseSchema(
    z.object({ post: PostSchema, pet: PetSchema, images: z.array(z.string()) })
)
export const UpdatePublicationResponseSchema = createApiResponseSchema(
    z.object({
        post: PostSchema,
        pet: z.union([PetSchema, z.null()]),
        images: z.array(z.string()),
        newImages: z.array(z.string()),
    })
)
export const DeletePublicationResponseSchema = createApiResponseSchema(
    z.object({ post: PostSchema, pet: z.union([PetSchema, z.null()]), deletedImages: z.number() })
)

export const PublicationsWithImagesResponseSchema = createApiResponseSchema(
    z.object({
        items: z.array(
            z.object({
                post: PostWithImagesSchema,
                pet: PetWithImagesSchema,
            })
        ),
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
    })
)

export const PublicationByIdWithImagesResponseSchema = createApiResponseSchema(
    z.object({ post: PostWithImagesSchema, pet: PetWithImagesSchema })
)
