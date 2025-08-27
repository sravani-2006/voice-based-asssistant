import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let supabase: ReturnType<typeof supabaseCreateClient<Database>> | null = null;

export function createClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing required environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  try {
    supabase = supabaseCreateClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    return supabase;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
}
