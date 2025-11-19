import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ""
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || ""

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_API_KEY")
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY)

export default supabase