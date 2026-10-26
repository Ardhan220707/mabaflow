import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are missing');
    return null as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
}
