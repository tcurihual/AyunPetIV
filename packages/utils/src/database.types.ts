export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          createdat: string | null
          fromownerid: number | null
          id: number
          petid: number | null
          postid: number | null
          toownerid: number | null
        }
        Insert: {
          createdat?: string | null
          fromownerid?: number | null
          id?: number
          petid?: number | null
          postid?: number | null
          toownerid?: number | null
        }
        Update: {
          createdat?: string | null
          fromownerid?: number | null
          id?: number
          petid?: number | null
          postid?: number | null
          toownerid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_history_fromownerid_fkey"
            columns: ["fromownerid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_history_petid_fkey"
            columns: ["petid"]
            isOneToOne: false
            referencedRelation: "pet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_history_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_history_toownerid_fkey"
            columns: ["toownerid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      adoption_request: {
        Row: {
          createdat: string | null
          id: number
          message: string | null
          postid: number | null
          status: string | null
          updatedat: string | null
          userid: number | null
        }
        Insert: {
          createdat?: string | null
          id?: number
          message?: string | null
          postid?: number | null
          status?: string | null
          updatedat?: string | null
          userid?: number | null
        }
        Update: {
          createdat?: string | null
          id?: number
          message?: string | null
          postid?: number | null
          status?: string | null
          updatedat?: string | null
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_request_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_request_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          createdat: string | null
          creatorid: number | null
          description: string
          id: number
          postid: number | null
          status: string | null
          updatedat: string | null
        }
        Insert: {
          createdat?: string | null
          creatorid?: number | null
          description: string
          id?: number
          postid?: number | null
          status?: string | null
          updatedat?: string | null
        }
        Update: {
          createdat?: string | null
          creatorid?: number | null
          description?: string
          id?: number
          postid?: number | null
          status?: string | null
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_creatorid_fkey"
            columns: ["creatorid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      pet: {
        Row: {
          adopted: boolean | null
          age: number | null
          createdat: string | null
          gender: string
          id: number
          name: string | null
          ownerid: number | null
          size: string | null
          species: string
          sterilized: boolean
          updatedat: string | null
        }
        Insert: {
          adopted?: boolean | null
          age?: number | null
          createdat?: string | null
          gender: string
          id?: number
          name?: string | null
          ownerid?: number | null
          size?: string | null
          species: string
          sterilized: boolean
          updatedat?: string | null
        }
        Update: {
          adopted?: boolean | null
          age?: number | null
          createdat?: string | null
          gender?: string
          id?: number
          name?: string | null
          ownerid?: number | null
          size?: string | null
          species?: string
          sterilized?: boolean
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_ownerid_fkey"
            columns: ["ownerid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          createdat: string | null
          creatorid: number | null
          description: string | null
          id: number
          petid: number | null
          status: string | null
          title: string
          updatedat: string | null
        }
        Insert: {
          createdat?: string | null
          creatorid?: number | null
          description?: string | null
          id?: number
          petid?: number | null
          status?: string | null
          title: string
          updatedat?: string | null
        }
        Update: {
          createdat?: string | null
          creatorid?: number | null
          description?: string | null
          id?: number
          petid?: number | null
          status?: string | null
          title?: string
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_creatorid_fkey"
            columns: ["creatorid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_petid_fkey"
            columns: ["petid"]
            isOneToOne: false
            referencedRelation: "pet"
            referencedColumns: ["id"]
          },
        ]
      }
      report: {
        Row: {
          createdat: string | null
          description: string | null
          id: number
          postid: number | null
          resolved: boolean | null
          updatedat: string | null
          userid: number | null
        }
        Insert: {
          createdat?: string | null
          description?: string | null
          id?: number
          postid?: number | null
          resolved?: boolean | null
          updatedat?: string | null
          userid?: number | null
        }
        Update: {
          createdat?: string | null
          description?: string | null
          id?: number
          postid?: number | null
          resolved?: boolean | null
          updatedat?: string | null
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "report_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          id: number
          roletype: string
        }
        Insert: {
          id?: number
          roletype: string
        }
        Update: {
          id?: number
          roletype?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          createdat: string | null
          description: string | null
          email: string
          id: number
          name: string
          password: string
          role: number | null
          rut: string
          updatedat: string | null
          validated: boolean | null
        }
        Insert: {
          address?: string | null
          createdat?: string | null
          description?: string | null
          email: string
          id?: number
          name: string
          password: string
          role?: number | null
          rut: string
          updatedat?: string | null
          validated?: boolean | null
        }
        Update: {
          address?: string | null
          createdat?: string | null
          description?: string | null
          email?: string
          id?: number
          name?: string
          password?: string
          role?: number | null
          rut?: string
          updatedat?: string | null
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
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
      [_ in never]: never
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
    : never = never,
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
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
