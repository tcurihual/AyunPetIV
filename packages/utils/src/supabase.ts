import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_KEY } from "./constants"

export const createSupabaseClient = () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error("Supabase URL and KEY is required")
    }
    return createClient(SUPABASE_URL, SUPABASE_KEY)
}
