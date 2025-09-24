import z from "zod"
import {
    LoginFormSchema,
    RegisterFormSchema,
    PostFormSchema,
    PetFormSchema,
    MessageFormSchema,
    GiverRegisterFormSchema,
} from "@/utils/schemas"

interface Role {
    id: number
    roletype: string
}

export interface User {
    id: number
    role: Role
    rut: string
    email: string
    name: string
    password: string
    validated: boolean
    address: string | null
    description: string | null
    createdAt: Date
    updatedAt: Date | null
}

export interface UserResponse extends Omit<User, "password"> {}

export interface Pet {
    id: number
    owner: User
    species: string
    name: string | null
    gender: string
    age: number | null
    size: string | null
    sterilized: boolean
    adopted: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Post {
    id: number
    creator: User
    pet: Pet
    title: string
    description: string | null
    status: string
    createdAt: Date
    updatedAt: Date
}

export type PostPreview = Pick<Post, "id"> & {
    pet: Pick<Pet, "name" | "gender" | "age">
    creator: Pick<User, "id" | "name">
}

export interface Message {
    id: number
    creator: User
    post: Post
    description: string
    status: string | null
    createdAt: Date
    updatedAt: Date
}

export interface AdoptionRequest {
    id: number
    post: Post
    user: User
    message: string | null
    status: string
    createdAt: Date
    updatedAt: Date | null
}

export interface AdoptionHistory {
    id: number
    pet: Pet
    fromOwner: User
    toOwner: User
    post: Post
    createdAt: Date
}

export interface Report {
    id: number
    user: User
    post: Post
    description: string | null
    resolved: boolean
    createdAt: Date
    updatedAt: Date | null
}

export type LoginFormType = z.infer<typeof LoginFormSchema>
export type RegisterFormType = z.infer<typeof RegisterFormSchema>
export type GiverRegisterFormType = z.infer<typeof GiverRegisterFormSchema>
export type PostFormType = z.infer<typeof PostFormSchema>
export type PetFormType = z.infer<typeof PetFormSchema>
export type MessageFormType = z.infer<typeof MessageFormSchema>
