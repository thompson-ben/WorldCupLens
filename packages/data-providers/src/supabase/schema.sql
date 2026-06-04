-- WorldCupLens — Supabase/Postgres schema.
-- Tournament-agnostic: a tournament's structure lives in the `format` JSONB
-- column, so new competition shapes need no schema changes.

create table if not exists teams (
  id           text primary key,
  name         text not null,
  short_name   text,
  code         text,
  country_code text,
  crest_url    text
);

create table if not exists tournaments (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  sport       text not null default 'football',
  competition text not null,
  season      text not null,
  start_date  date,
  end_date    date,
  hosts       text[],
  -- Matches the @worldcuplens/core FormatConfig union.
  format      jsonb not null
);

create table if not exists tournament_teams (
  tournament_id text not null references tournaments(id) on delete cascade,
  team_id       text not null references teams(id) on delete cascade,
  -- Elo-like strength rating used by the simulation engine.
  rating        numeric not null default 1500,
  primary key (tournament_id, team_id)
);

create table if not exists matches (
  id            text primary key,
  tournament_id text not null references tournaments(id) on delete cascade,
  stage_id      text not null,
  home_team_id  text not null references teams(id),
  away_team_id  text not null references teams(id),
  kickoff       timestamptz,
  status        text not null default 'scheduled',
  home_score    integer,
  away_score    integer
);

create index if not exists matches_tournament_idx on matches (tournament_id, kickoff);

-- Read-only public access for published data; writes go through the service role.
alter table teams            enable row level security;
alter table tournaments      enable row level security;
alter table tournament_teams enable row level security;
alter table matches          enable row level security;

create policy "public read teams"            on teams            for select using (true);
create policy "public read tournaments"      on tournaments      for select using (true);
create policy "public read tournament_teams" on tournament_teams for select using (true);
create policy "public read matches"          on matches          for select using (true);
