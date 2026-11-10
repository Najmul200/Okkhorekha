create table if not exists public.about_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint about_content_singleton check (id = 'about')
);

alter table public.about_content enable row level security;

grant select on public.about_content to anon, authenticated;
grant insert, update on public.about_content to authenticated;

drop policy if exists "Public can read About Us content" on public.about_content;
create policy "Public can read About Us content"
  on public.about_content for select
  using (true);

drop policy if exists "Authenticated admins can manage About Us content" on public.about_content;
create policy "Authenticated admins can manage About Us content"
  on public.about_content for all
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
      and tablename = 'about_content'
  ) then
    alter publication supabase_realtime add table public.about_content;
  end if;
end
$$;
