-- ─────────────────────────────────────────────────────────────────────────────
-- JUST US APP — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  username      text not null unique,
  phone_number  text not null,
  location_name text not null default 'New York, NY',
  location_lat  float not null default 40.7128,
  location_lon  float not null default -74.0060,
  zodiac_sign   text not null default 'Libra',
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Read all profiles"  on public.profiles for select to authenticated using (true);
create policy "Insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
create table public.tasks (
  id                uuid default uuid_generate_v4() primary key,
  title             text not null,
  description       text,
  completed         boolean default false,
  completed_by_id   uuid references public.profiles(id),
  completed_by_name text,
  completed_at      timestamptz,
  created_by_id     uuid references public.profiles(id),
  created_by_name   text,
  created_at        timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Read all tasks"   on public.tasks for select to authenticated using (true);
create policy "Create tasks"     on public.tasks for insert to authenticated with check (auth.uid() = created_by_id);
create policy "Update tasks"     on public.tasks for update to authenticated using (true);
create policy "Delete own tasks" on public.tasks for delete to authenticated using (auth.uid() = created_by_id);

alter publication supabase_realtime add table public.tasks;

-- ─── DAILY SONGS ─────────────────────────────────────────────────────────────
create table public.daily_songs (
  id          uuid default uuid_generate_v4() primary key,
  date        date not null unique,
  title       text not null,
  artist      text not null,
  reason      text,
  zodiac_pair text not null,
  created_at  timestamptz default now()
);

alter table public.daily_songs enable row level security;
create policy "Read all songs"  on public.daily_songs for select to authenticated using (true);
create policy "Service insert"  on public.daily_songs for insert using (true);
