import { Request } from "express"
import { z } from "zod"
import { LoginResponseSchema } from "./schemas"
import { Database, Tables, TablesInsert, TablesUpdate, Enums } from "database.types"

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number
        role: number | null
    }
}

export type JsonResponse<T> = {
    status?: number
    message: string
    type: "success" | "error"
    data: T
}

export type loginResponseType = z.infer<typeof LoginResponseSchema>

export type User = {
    Row: Tables<"users">
    Insert: TablesInsert<"users">
    Update: TablesUpdate<"users">
}

export type Role = {
    Row: Tables<"role">
    Insert: TablesInsert<"role">
    Update: TablesUpdate<"role">
}

export type Pet = {
    Row: Tables<"pet">
    Insert: TablesInsert<"pet">
    Update: TablesUpdate<"pet">
}

export type Post = {
    Row: Tables<"post">
    Insert: TablesInsert<"post">
    Update: TablesUpdate<"post">
}

export type Message = {
    Row: Tables<"message">
    Insert: TablesInsert<"message">
    Update: TablesUpdate<"message">
}

export type Report = {
    Row: Tables<"report">
    Insert: TablesInsert<"report">
    Update: TablesUpdate<"report">
}

export type AdoptionRequest = {
    Row: Tables<"adoption_request">
    Insert: TablesInsert<"adoption_request">
    Update: TablesUpdate<"adoption_request">
}

export type AdoptionHistory = {
    Row: Tables<"adoption_history">
    Insert: TablesInsert<"adoption_history">
    Update: TablesUpdate<"adoption_history">
}

export type SavedPost = {
    Row: Tables<"saved_post">
    Insert: TablesInsert<"saved_post">
    Update: TablesUpdate<"saved_post">
}

export type Question = {
    Row: Tables<"question">
    Insert: TablesInsert<"question">
    Update: TablesUpdate<"question">
}

export type PostForm = {
    Row: Tables<"post_form">
    Insert: TablesInsert<"post_form">
    Update: TablesUpdate<"post_form">
}

export type FormResponse = {
    Row: Tables<"form_response">
    Insert: TablesInsert<"form_response">
    Update: TablesUpdate<"form_response">
}

export type VerificationCode = {
    Row: Tables<"verification_code">
    Insert: TablesInsert<"verification_code">
    Update: TablesUpdate<"verification_code">
}

export type News = {
    Row: Tables<"new">
    Insert: TablesInsert<"new">
    Update: TablesUpdate<"new">
}

export type AdoptionStatus = Enums<"adoption_status_enum">
export type PetGender = Enums<"pet_gender_enum">
export type PetSize = Enums<"pet_size_enum">
export type PetSpecies = Enums<"pet_species_enum">
export type PostStatus = Enums<"post_status_enum">
export type RoleType = Enums<"role_type_enum">
export type VerificationType = Enums<"verification_type_enum">
