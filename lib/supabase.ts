import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

//Cliente padrão para autenticação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseSession = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true },
});
