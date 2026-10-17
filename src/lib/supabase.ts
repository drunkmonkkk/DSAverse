import { createBrowserClient } from "@supabase/ssr";
export const cloudConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
let client: ReturnType<typeof createBrowserClient> | undefined;
export function browserSupabase() {
  if (!cloudConfigured) return null;
  return (client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ));
}
