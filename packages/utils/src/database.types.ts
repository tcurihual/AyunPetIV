export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.4"
    }
    public: {
        Tables: {
            adoption_history: {
                Row: {
                    created_at: string | null
                    from_owner_id: number | null
                    id: number
                    pet_id: number | null
                    to_owner_id: number | null
                }
                Insert: {
                    created_at?: string | null
                    from_owner_id?: number | null
                    id?: number
                    pet_id?: number | null
                    to_owner_id?: number | null
                }
                Update: {
                    created_at?: string | null
                    from_owner_id?: number | null
                    id?: number
                    pet_id?: number | null
                    to_owner_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "adoption_history_from_owner_id_fkey"
                        columns: ["from_owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "adoption_history_pet_id_fkey"
                        columns: ["pet_id"]
                        isOneToOne: false
                        referencedRelation: "pet"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "adoption_history_to_owner_id_fkey"
                        columns: ["to_owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            adoption_request: {
                Row: {
                    created_at: string | null
                    message: string | null
                    id: number
                    post_id: number | null
                    post_owner_id: number | null
                    requester_id: number | null
                    status: Database["public"]["Enums"]["adoption_status_enum"] | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    message?: string | null
                    id?: number
                    post_id?: number | null
                    post_owner_id?: number | null
                    requester_id?: number | null
                    status?: Database["public"]["Enums"]["adoption_status_enum"] | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    message?: string | null
                    id?: number
                    post_id?: number | null
                    post_owner_id?: number | null
                    requester_id?: number | null
                    status?: Database["public"]["Enums"]["adoption_status_enum"] | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "adoption_request_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "post"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "adoption_request_post_owner_id_fkey"
                        columns: ["post_owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "adoption_request_requester_id_fkey"
                        columns: ["requester_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            form_response: {
                Row: {
                    answer: string | null
                    created_at: string | null
                    id: number
                    id_post_form: number | null
                    id_user: number | null
                }
                Insert: {
                    answer?: string | null
                    created_at?: string | null
                    id?: number
                    id_post_form?: number | null
                    id_user?: number | null
                }
                Update: {
                    answer?: string | null
                    created_at?: string | null
                    id?: number
                    id_post_form?: number | null
                    id_user?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "form_response_id_post_form_fkey"
                        columns: ["id_post_form"]
                        isOneToOne: false
                        referencedRelation: "post_form"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "form_response_id_user_fkey"
                        columns: ["id_user"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            message: {
                Row: {
                    created_at: string | null
                    creator_id: number | null
                    description: string
                    id: number
                    post_id: number | null
                    status: Database["public"]["Enums"]["post_status_enum"] | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    creator_id?: number | null
                    description: string
                    id?: number
                    post_id?: number | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    creator_id?: number | null
                    description?: string
                    id?: number
                    post_id?: number | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "message_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "message_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "post"
                        referencedColumns: ["id"]
                    }
                ]
            }
            new: {
                Row: {
                    created_at: string | null
                    creator_id: number | null
                    date: string | null
                    description: string | null
                    end_time: string | null
                    id: number
                    start_time: string | null
                    status: Database["public"]["Enums"]["post_status_enum"] | null
                    title: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    creator_id?: number | null
                    date?: string | null
                    description?: string | null
                    end_time?: string | null
                    id?: number
                    start_time?: string | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    title?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    creator_id?: number | null
                    date?: string | null
                    description?: string | null
                    end_time?: string | null
                    id?: number
                    start_time?: string | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    title?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "new_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            pet: {
                Row: {
                    adopted: boolean | null
                    age_months: number | null
                    age_years: number | null
                    created_at: string | null
                    gender: Database["public"]["Enums"]["pet_gender_enum"]
                    id: number
                    name: string | null
                    owner_id: number | null
                    size: Database["public"]["Enums"]["pet_size_enum"] | null
                    species: Database["public"]["Enums"]["pet_species_enum"]
                    sterilized: boolean
                    updated_at: string | null
                }
                Insert: {
                    adopted?: boolean | null
                    age_months?: number | null
                    age_years?: number | null
                    created_at?: string | null
                    gender: Database["public"]["Enums"]["pet_gender_enum"]
                    id?: number
                    name?: string | null
                    owner_id?: number | null
                    size?: Database["public"]["Enums"]["pet_size_enum"] | null
                    species: Database["public"]["Enums"]["pet_species_enum"]
                    sterilized: boolean
                    updated_at?: string | null
                }
                Update: {
                    adopted?: boolean | null
                    age_months?: number | null
                    age_years?: number | null
                    created_at?: string | null
                    gender?: Database["public"]["Enums"]["pet_gender_enum"]
                    id?: number
                    name?: string | null
                    owner_id?: number | null
                    size?: Database["public"]["Enums"]["pet_size_enum"] | null
                    species?: Database["public"]["Enums"]["pet_species_enum"]
                    sterilized?: boolean
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pet_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post: {
                Row: {
                    created_at: string | null
                    creator_id: number | null
                    description: string | null
                    id: number
                    pet_id: number | null
                    status: Database["public"]["Enums"]["post_status_enum"] | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    creator_id?: number | null
                    description?: string | null
                    id?: number
                    pet_id?: number | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    creator_id?: number | null
                    description?: string | null
                    id?: number
                    pet_id?: number | null
                    status?: Database["public"]["Enums"]["post_status_enum"] | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "post_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_pet_id_fkey"
                        columns: ["pet_id"]
                        isOneToOne: false
                        referencedRelation: "pet"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post_form: {
                Row: {
                    created_at: string | null
                    id: number
                    id_post: number | null
                    id_question: number | null
                }
                Insert: {
                    created_at?: string | null
                    id?: number
                    id_post?: number | null
                    id_question?: number | null
                }
                Update: {
                    created_at?: string | null
                    id?: number
                    id_post?: number | null
                    id_question?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "post_form_id_post_fkey"
                        columns: ["id_post"]
                        isOneToOne: false
                        referencedRelation: "post"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_form_id_question_fkey"
                        columns: ["id_question"]
                        isOneToOne: false
                        referencedRelation: "question"
                        referencedColumns: ["id"]
                    }
                ]
            }
            question: {
                Row: {
                    content: string
                    created_at: string | null
                    id: number
                    type: string | null
                    updated_at: string | null
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: number
                    type?: string | null
                    updated_at?: string | null
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: number
                    type?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            report: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: number
                    post_id: number | null
                    resolved: boolean | null
                    updated_at: string | null
                    user_id: number | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: number
                    post_id?: number | null
                    resolved?: boolean | null
                    updated_at?: string | null
                    user_id?: number | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: number
                    post_id?: number | null
                    resolved?: boolean | null
                    updated_at?: string | null
                    user_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "report_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "post"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "report_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            role: {
                Row: {
                    id: number
                    role_type: Database["public"]["Enums"]["role_type_enum"]
                }
                Insert: {
                    id?: number
                    role_type: Database["public"]["Enums"]["role_type_enum"]
                }
                Update: {
                    id?: number
                    role_type?: Database["public"]["Enums"]["role_type_enum"]
                }
                Relationships: []
            }
            saved_post: {
                Row: {
                    id: number
                    post_id: number | null
                    user_id: number | null
                }
                Insert: {
                    id?: number
                    post_id?: number | null
                    user_id?: number | null
                }
                Update: {
                    id?: number
                    post_id?: number | null
                    user_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "saved_post_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "post"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "saved_post_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    address: string | null
                    created_at: string | null
                    description: string | null
                    email: string
                    id: number
                    name: string
                    password: string
                    push_token: string | null
                    push_token_updated_at: string | null
                    role: number | null
                    rut: string
                    updated_at: string | null
                    validated: boolean | null
                }
                Insert: {
                    address?: string | null
                    created_at?: string | null
                    description?: string | null
                    email: string
                    id?: number
                    name: string
                    password: string
                    push_token?: string | null
                    push_token_updated_at?: string | null
                    role?: number | null
                    rut: string
                    updated_at?: string | null
                    validated?: boolean | null
                }
                Update: {
                    address?: string | null
                    created_at?: string | null
                    description?: string | null
                    email?: string
                    id?: number
                    name?: string
                    password?: string
                    push_token?: string | null
                    push_token_updated_at?: string | null
                    role?: number | null
                    rut?: string
                    updated_at?: string | null
                    validated?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_role_fkey"
                        columns: ["role"]
                        isOneToOne: false
                        referencedRelation: "role"
                        referencedColumns: ["id"]
                    }
                ]
            }
            verification_code: {
                Row: {
                    code: string
                    created_at: string | null
                    expires_at: string | null
                    id: number
                    type: Database["public"]["Enums"]["verification_type_enum"]
                    used: boolean | null
                    user_id: number | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    expires_at?: string | null
                    id?: number
                    type: Database["public"]["Enums"]["verification_type_enum"]
                    used?: boolean | null
                    user_id?: number | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    expires_at?: string | null
                    id?: number
                    type?: Database["public"]["Enums"]["verification_type_enum"]
                    used?: boolean | null
                    user_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "verification_code_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            adoption_status_enum: "pending" | "approved" | "rejected" | "completed"
            pet_gender_enum: "male" | "female"
            pet_size_enum: "small" | "medium" | "large"
            pet_species_enum: "dog" | "cat" | "other"
            post_status_enum: "active" | "inactive" | "closed"
            role_type_enum: "admin" | "user" | "shelter" | "giver"
            verification_type_enum: "reset" | "verify" | "adoption"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
          DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
          Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Insert: infer I
      }
        ? I
        : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Update: infer U
      }
        ? U
        : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            adoption_status_enum: ["pending", "approved", "rejected", "completed"],
            pet_gender_enum: ["male", "female"],
            pet_size_enum: ["small", "medium", "large"],
            pet_species_enum: ["dog", "cat", "other"],
            post_status_enum: ["active", "inactive", "closed"],
            role_type_enum: ["admin", "user", "shelter", "giver"],
            verification_type_enum: ["reset", "verify", "adoption"],
        },
    },
} as const
