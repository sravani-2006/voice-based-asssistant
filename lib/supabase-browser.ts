"use client";

import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Create a single supabase client for browser side
let browserClient: ReturnType<typeof supabaseCreateClient<Database>> | null =
  null;

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  browserClient = supabaseCreateClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: "supabase-browser-auth",
    },
  });

  return browserClient;
}
