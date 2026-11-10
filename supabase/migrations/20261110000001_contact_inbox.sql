create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 10000),
  is_read boolean not null default false,
  replies jsonb not null default '[]'::jsonb check (jsonb_typeof(replies) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke insert on public.contact_messages from anon;
grant insert (name, email, subject, message) on public.contact_messages to anon;
grant select, insert, update on public.contact_messages to authenticated;

drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
create policy "Visitors can submit contact messages"
  on public.contact_messages for insert
  to anon
  with check (
    is_read = false
    and replies = '[]'::jsonb
  );

drop policy if exists "Authenticated admins can read contact messages" on public.contact_messages;
create policy "Authenticated admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can manage contact messages" on public.contact_messages;
create policy "Authenticated admins can manage contact messages"
  on public.contact_messages for all
  to authenticated
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contact_messages'
  ) then
    alter publication supabase_realtime add table public.contact_messages;
  end if;
end
$$;
