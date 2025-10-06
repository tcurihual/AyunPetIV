import { Request } from "express"
import { z } from "zod"
import { LoginResponseSchema } from "./schemas"
import { Database } from "database.types"

export interface AuthenticatedRequest extends Request {
    user: {
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
    Row: Database["public"]["Tables"]["users"]["Row"]
    Insert: Database["public"]["Tables"]["users"]["Insert"]
    Update: Database["public"]["Tables"]["users"]["Update"]
}

export type Role = {
    Row: Database["public"]["Tables"]["role"]["Row"]
    Insert: Database["public"]["Tables"]["role"]["Insert"]
    Update: Database["public"]["Tables"]["users"]["Update"]
}

export type Pet = {
    Row: Database["public"]["Tables"]["pet"]["Row"]
    Insert: Database["public"]["Tables"]["pet"]["Insert"]
    Update: Database["public"]["Tables"]["pet"]["Update"]
}

export type Post = {
    Row: Database["public"]["Tables"]["post"]["Row"]
    Insert: Database["public"]["Tables"]["post"]["Insert"]
    Update: Database["public"]["Tables"]["post"]["Update"]
}

export type Message = {
    Row: Database["public"]["Tables"]["message"]["Row"]
    Insert: Database["public"]["Tables"]["message"]["Insert"]
    Update: Database["public"]["Tables"]["message"]["Update"]
}

export type Report = {
    Row: Database["public"]["Tables"]["report"]["Row"]
    Insert: Database["public"]["Tables"]["report"]["Insert"]
    Update: Database["public"]["Tables"]["report"]["Update"]
}

export type AdoptionRequest = {
    Row: Database["public"]["Tables"]["adoption_request"]["Row"]
    Insert: Database["public"]["Tables"]["adoption_request"]["Insert"]
    Update: Database["public"]["Tables"]["adoption_request"]["Update"]
}

export type AdoptionHistory = {
    Row: Database["public"]["Tables"]["adoption_history"]["Row"]
    Insert: Database["public"]["Tables"]["adoption_history"]["Insert"]
    Update: Database["public"]["Tables"]["adoption_history"]["Update"]
}
