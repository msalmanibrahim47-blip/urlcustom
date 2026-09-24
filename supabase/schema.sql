-- White-Label Platform — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: guarded with IF NOT EXISTS / DROP POLICY IF EXISTS.

create extension if not exists "uuid-ossp";

-- ============================================================================
-- platform_settings — single-row table of global white-label settings
-- ============================================================================
create table if not exists platform_settings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  platform_name text not null default 'White Label Platform',
  logo_url text,
  favicon_url text,
  primary_color text not null default '#6366f1',
  default_background text not null default '#0b0c10',
  footer_text text,
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

-- ============================================================================
-- projects — one row per customer website project
-- ============================================================================
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  customer_name text not null,
  website_url text not null,
  description text,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  embed_mode text not null default 'unknown' check (embed_mode in ('unknown', 'embeddable', 'blocked')),
  fallback_behavior text not null default 'show_fallback' check (fallback_behavior in ('show_fallback', 'redirect')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_owner on projects(owner_id);
create index if not exists idx_projects_slug on projects(slug);
create index if not exists idx_projects_status on projects(status);

-- ============================================================================
-- project_settings — one row per project, all editor/customization state.
-- Kept separate from `projects` so the frequently-autosaved JSON blob
-- doesn't bloat updates to the lightweight project record.
-- ============================================================================
create table if not exists project_settings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  branding jsonb not null default '{
    "logoUrl": null,
    "faviconUrl": null,
    "brandName": null,
    "theme": "light",
    "accentColor": "#6366f1",
    "backgroundColor": "#ffffff"
  }'::jsonb,
  presentation jsonb not null default '{
    "borderRadius": 12,
    "frameWidth": "100%",
    "frameHeight": "100%",
    "defaultDevice": "desktop"
  }'::jsonb,
  overlays jsonb not null default '[]'::jsonb,
  cta jsonb not null default '{
    "enabled": false,
    "text": "Contact Us",
    "url": "",
    "position": "bottom-right"
  }'::jsonb,
  whatsapp jsonb not null default '{
    "enabled": false,
    "phoneNumber": "",
    "message": "Hi! I have a question.",
    "position": "bottom-left",
    "color": "#25D366",
    "size": "md"
  }'::jsonb,
  updated_at timestamptz not null default now(),
  unique (project_id)
);

-- ============================================================================
-- domains — custom domains attached to the platform or a specific project
-- ============================================================================
create table if not exists domains (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  domain text not null unique,
  is_primary boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'verified', 'error')),
  ssl_status text not null default 'pending' check (ssl_status in ('pending', 'active', 'error')),
  created_at timestamptz not null default now()
);

create index if not exists idx_domains_owner on domains(owner_id);

-- ============================================================================
-- analytics_events — lightweight public-page view tracking
-- ============================================================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  event_type text not null default 'page_view',
  visitor_hash text, -- salted hash of IP+UA for rough uniqueness, no raw IP stored
  referrer text,
  device_type text check (device_type in ('desktop', 'tablet', 'mobile', 'unknown')),
  country text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_project on analytics_events(project_id);
create index if not exists idx_analytics_created on analytics_events(created_at);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table platform_settings enable row level security;
alter table projects enable row level security;
alter table project_settings enable row level security;
alter table domains enable row level security;
alter table analytics_events enable row level security;

-- platform_settings: owner-only
drop policy if exists "platform_settings_owner_all" on platform_settings;
create policy "platform_settings_owner_all" on platform_settings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- projects: owner-only for writes; published projects are readable by anyone
-- (needed so the public /p/[slug] route, running as the anon key, can fetch them).
drop policy if exists "projects_owner_all" on projects;
create policy "projects_owner_all" on projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "projects_public_read_published" on projects;
create policy "projects_public_read_published" on projects
  for select using (status = 'published');

-- project_settings: owner-only for writes; readable publicly only when the
-- parent project is published.
drop policy if exists "project_settings_owner_all" on project_settings;
create policy "project_settings_owner_all" on project_settings
  for all using (
    exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid())
  );

drop policy if exists "project_settings_public_read_published" on project_settings;
create policy "project_settings_public_read_published" on project_settings
  for select using (
    exists (select 1 from projects p where p.id = project_id and p.status = 'published')
  );

-- domains: owner-only
drop policy if exists "domains_owner_all" on domains;
create policy "domains_owner_all" on domains
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- analytics_events: owner can read their own projects' events; anyone
-- (anon key, from the public page) can INSERT a view event for a published
-- project, but cannot read or modify events.
drop policy if exists "analytics_owner_read" on analytics_events;
create policy "analytics_owner_read" on analytics_events
  for select using (
    exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid())
  );

drop policy if exists "analytics_public_insert" on analytics_events;
create policy "analytics_public_insert" on analytics_events
  for insert with check (
    exists (select 1 from projects p where p.id = project_id and p.status = 'published')
  );

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();

drop trigger if exists trg_project_settings_updated_at on project_settings;
create trigger trg_project_settings_updated_at before update on project_settings
  for each row execute function set_updated_at();

drop trigger if exists trg_platform_settings_updated_at on platform_settings;
create trigger trg_platform_settings_updated_at before update on platform_settings
  for each row execute function set_updated_at();
