-- Optional Supabase schema for turning the local MVP into a real multi-user app.
-- Execute this in Supabase SQL Editor after creating a project.

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  flat text not null,
  district text not null,
  city text not null,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  author_display_name text not null,
  live_period text not null,
  comments text not null,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  casero_rating integer not null check (casero_rating between 1 and 5),
  mantenimiento_rating integer not null check (mantenimiento_rating between 1 and 5),
  vecindad_rating integer not null check (vecindad_rating between 1 and 5),
  tags text[] not null default '{}',
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'published', 'reported', 'hidden')),
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.property_alerts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_properties_city_district on public.properties(city, district);
create index if not exists idx_reviews_property_id on public.reviews(property_id);
create index if not exists idx_reviews_moderation_status on public.reviews(moderation_status);
create index if not exists idx_reviews_verification_status on public.reviews(verification_status);
