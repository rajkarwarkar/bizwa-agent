import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase client environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured in .env.local"
    );
  }

  if (!_supabaseClientInstance) {
    _supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabaseClientInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const instance = getSupabaseClient();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
