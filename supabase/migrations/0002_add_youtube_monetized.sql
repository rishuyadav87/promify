-- Documents a column that already exists on the live database (added by hand
-- in the SQL Editor, never committed). `if not exists` makes this a no-op in
-- production and a real column creation on any fresh/rebuilt database.
alter table public.creators
  add column if not exists youtube_monetized boolean not null default false;