-- Helix Health - Initial Schema
-- Patient-owned unified health record platform

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  date_of_birth date,
  blood_type text check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies text[] default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Health records
create table if not exists public.health_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  type text not null check (type in ('condition', 'medication', 'visit', 'lab', 'imaging', 'procedure', 'vaccination', 'allergy')),
  title text not null,
  description text,
  date date not null,
  end_date date,
  status text default 'active' check (status in ('active', 'resolved', 'discontinued')),
  provider_name text,
  specialty text,
  notes text,
  metadata jsonb default '{}',
  document_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Providers
create table if not exists public.providers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  specialty text,
  clinic_name text,
  email text,
  phone text,
  has_access boolean default false,
  access_level text default 'summary_only' check (access_level in ('full', 'relevant', 'summary_only')),
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Share links
create table if not exists public.share_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  token text unique not null,
  recipient_name text,
  purpose text,
  access_level text default 'summary' check (access_level in ('full', 'filtered', 'summary')),
  filter_specialties text[] default '{}',
  expires_at timestamptz,
  viewed_at timestamptz,
  view_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- AI summaries
create table if not exists public.ai_summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  specialty text not null,
  summary text not null,
  key_conditions text[] default '{}',
  current_medications text[] default '{}',
  recent_visits text[] default '{}',
  cautions text[] default '{}',
  generated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_health_records_user_id on public.health_records(user_id);
create index if not exists idx_health_records_type on public.health_records(type);
create index if not exists idx_health_records_date on public.health_records(date desc);
create index if not exists idx_providers_user_id on public.providers(user_id);
create index if not exists idx_share_links_token on public.share_links(token);
create index if not exists idx_share_links_user_id on public.share_links(user_id);
create index if not exists idx_ai_summaries_user_id on public.ai_summaries(user_id);

-- Updated at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_health_record_updated on public.health_records;
create trigger on_health_record_updated
  before update on public.health_records
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.users enable row level security;
alter table public.health_records enable row level security;
alter table public.providers enable row level security;
alter table public.share_links enable row level security;
alter table public.ai_summaries enable row level security;

-- Users: can only read/update own profile
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Health records: users can only CRUD their own
drop policy if exists "Users can view own records" on public.health_records;
drop policy if exists "Users can insert own records" on public.health_records;
drop policy if exists "Users can update own records" on public.health_records;
drop policy if exists "Users can delete own records" on public.health_records;
create policy "Users can view own records"
  on public.health_records for select using (auth.uid() = user_id);
create policy "Users can insert own records"
  on public.health_records for insert with check (auth.uid() = user_id);
create policy "Users can update own records"
  on public.health_records for update using (auth.uid() = user_id);
create policy "Users can delete own records"
  on public.health_records for delete using (auth.uid() = user_id);

-- Providers: users can only CRUD their own
drop policy if exists "Users can view own providers" on public.providers;
drop policy if exists "Users can insert own providers" on public.providers;
drop policy if exists "Users can update own providers" on public.providers;
drop policy if exists "Users can delete own providers" on public.providers;
create policy "Users can view own providers"
  on public.providers for select using (auth.uid() = user_id);
create policy "Users can insert own providers"
  on public.providers for insert with check (auth.uid() = user_id);
create policy "Users can update own providers"
  on public.providers for update using (auth.uid() = user_id);
create policy "Users can delete own providers"
  on public.providers for delete using (auth.uid() = user_id);

-- Share links: users can only CRUD their own + public token access
drop policy if exists "Users can view own share links" on public.share_links;
drop policy if exists "Users can insert own share links" on public.share_links;
drop policy if exists "Users can update own share links" on public.share_links;
drop policy if exists "Users can delete own share links" on public.share_links;
drop policy if exists "Anyone can view active share links by token" on public.share_links;
create policy "Users can view own share links"
  on public.share_links for select using (auth.uid() = user_id);
create policy "Users can insert own share links"
  on public.share_links for insert with check (auth.uid() = user_id);
create policy "Users can update own share links"
  on public.share_links for update using (auth.uid() = user_id);
create policy "Users can delete own share links"
  on public.share_links for delete using (auth.uid() = user_id);
create policy "Anyone can view active share links by token"
  on public.share_links for select using (
    is_active = true
    and (expires_at is null or expires_at > now())
  );

-- AI summaries: users can only CRUD their own
drop policy if exists "Users can view own AI summaries" on public.ai_summaries;
drop policy if exists "Users can insert own AI summaries" on public.ai_summaries;
drop policy if exists "Users can delete own AI summaries" on public.ai_summaries;
create policy "Users can view own AI summaries"
  on public.ai_summaries for select using (auth.uid() = user_id);
create policy "Users can insert own AI summaries"
  on public.ai_summaries for insert with check (auth.uid() = user_id);
create policy "Users can delete own AI summaries"
  on public.ai_summaries for delete using (auth.uid() = user_id);
