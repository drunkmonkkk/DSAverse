import { createClient } from "@supabase/supabase-js";
import { topics } from "../src/data/curriculum";
import { problems } from "../src/data/problems";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY.",
  );
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
for (const [table, rows] of [
  ["topics", topics],
  ["problems", problems],
] as const) {
  const { error } = await client
    .from(table)
    .upsert(rows.map((row) => ({ id: row.id, data: row })));
  if (error) throw error;
  console.log(`Seeded ${rows.length} ${table}.`);
}
