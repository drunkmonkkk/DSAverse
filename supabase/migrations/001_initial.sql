-- Apply in a Supabase project. Authentication is supplied by Supabase Auth.
create table public.topics (id text primary key, data jsonb not null);
create table public.problems (id text primary key, data jsonb not null);
alter table public.topics enable row level security;
alter table public.problems enable row level security;
create policy public_topics on public.topics for select using (true);
create policy public_problems on public.problems for select using (true);
grant select on public.topics,public.problems to anon,authenticated;
create table public.user_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null,
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
create policy own_state on public.user_state for select to authenticated using (user_id=(select auth.uid()));
grant select on public.user_state to authenticated;
revoke insert,update,delete on public.user_state from anon,authenticated;
create or replace function public.save_progress(payload jsonb,expected_revision bigint) returns bigint
language plpgsql security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); next_revision bigint;
begin
 if actor is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if expected_revision is null or expected_revision<0 then raise exception 'Invalid revision'; end if;
 if payload is null or octet_length(payload::text)>2000000 or jsonb_typeof(payload)<>'object' or payload->>'version' is distinct from '1'
 or jsonb_typeof(payload->'topics') is distinct from 'object'
 or jsonb_typeof(payload->'problems') is distinct from 'object'
 or jsonb_typeof(payload->'preferences') is distinct from 'object'
 or jsonb_typeof(payload->'notes') is distinct from 'object'
 or jsonb_typeof(payload->'revisions') is distinct from 'object'
 or jsonb_typeof(payload->'bookmarks') is distinct from 'array'
 or jsonb_typeof(payload->'events') is distinct from 'array'
 then raise exception 'Invalid progress document'; end if;
 if expected_revision=0 then
  insert into public.user_state(user_id,state,revision) values(actor,payload,1) on conflict do nothing returning revision into next_revision;
 else
  update public.user_state set state=payload,revision=revision+1,updated_at=now() where user_id=actor and revision=expected_revision returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Progress conflict: reload before writing' using errcode='40001'; end if;
 return next_revision;
end $$;
revoke all on function public.save_progress(jsonb,bigint) from public,anon;
grant execute on function public.save_progress(jsonb,bigint) to authenticated;
