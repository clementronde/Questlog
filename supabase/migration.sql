-- QuestLog — Leaderboard schema
-- Run this in your Supabase project → SQL Editor

create table if not exists leaderboard (
  player_id     text primary key,          -- = auth.uid()
  username      text unique not null,
  level         int  not null default 1,
  total_xp      int  not null default 0,
  quests_done   int  not null default 0,
  streak        int  not null default 0,
  theme_id      text not null default 'arcane',
  updated_at    timestamptz not null default now()
);

-- Index for the ranking query
create index if not exists leaderboard_xp_idx on leaderboard (total_xp desc);

-- Row Level Security
alter table leaderboard enable row level security;

-- Anyone can read the full leaderboard
create policy "Public read"
  on leaderboard for select
  using (true);

-- Only authenticated users can insert their own row
create policy "Own insert"
  on leaderboard for insert
  with check (auth.uid()::text = player_id);

-- Only authenticated users can update their own row
create policy "Own update"
  on leaderboard for update
  using (auth.uid()::text = player_id);

-- Enable real-time on this table
alter publication supabase_realtime add table leaderboard;
