-- Run this in Supabase SQL Editor

-- Goals table
create table if not exists goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text,
  type text not null default 'count',
  unit text not null,
  target integer not null,
  period text not null default 'daily',
  nudge text default 'smart',
  quick_amounts integer[] default '{5,10,20,25}',
  color text default '#f97316',
  mastery_tracking boolean default false,
  active boolean default true,
  created_at bigint not null
);

-- Entries table
create table if not exists entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id text references goals(id) on delete cascade not null,
  amount integer not null,
  unit text not null,
  date text not null,
  ts bigint not null,
  note text default ''
);

-- Indexes for fast lookups
create index if not exists entries_user_id_idx on entries(user_id);
create index if not exists entries_goal_id_idx on entries(goal_id);
create index if not exists entries_date_idx on entries(date);
create index if not exists goals_user_id_idx on goals(user_id);

-- Row Level Security — users can only see their own data
alter table goals enable row level security;
alter table entries enable row level security;

create policy "users can manage their own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can manage their own entries"
  on entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
