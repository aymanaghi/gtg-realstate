export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until the Supabase env vars are set. The site then runs on sample data. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
