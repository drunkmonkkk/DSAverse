import { it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { emptyProgress } from "../src/lib/progress";
it("isolates users, rejects stale writes and anonymous access", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as 'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid'; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`,
    );
    await db.exec(readFileSync("supabase/migrations/001_initial.sql", "utf8"));
    await db.exec(
      `set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001'`,
    );
    const payload = JSON.stringify(emptyProgress());
    expect(
      (
        await db.query<{ r: number }>(
          "select public.save_progress($1::jsonb,0) as r",
          [payload],
        )
      ).rows[0].r,
    ).toBe(1);
    await expect(
      db.query("select public.save_progress($1::jsonb,0)", [payload]),
    ).rejects.toThrow(/conflict/);
    await expect(db.exec("delete from public.user_state")).rejects.toThrow(
      /permission/,
    );
    await db.exec(
      `set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002'`,
    );
    expect(
      (await db.query("select * from public.user_state")).rows,
    ).toHaveLength(0);
    await db.exec("reset role; set role anon");
    await expect(
      db.query("select public.save_progress($1::jsonb,0)", [payload]),
    ).rejects.toThrow(/permission/);
  } finally {
    await db.close();
  }
}, 30000);
