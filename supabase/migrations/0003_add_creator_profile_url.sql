-- Lets creators store a direct link to their Instagram/YouTube profile,
-- shown to brands alongside the platform icon on the creator detail page.
alter table public.creators
  add column if not exists profile_url text null;

-- `approved` also already exists live and was never captured in any
-- committed migration (same undocumented-drift problem as user_id below).
-- This add is a no-op in production; it's here so a fresh database matches.
alter table public.creators
  add column if not exists approved boolean not null default false;

-- NOTE: the live view also carries a `user_id` column AND a
-- `where approved = true` filter that were added by hand at some point and
-- never captured in any committed migration — discovered the hard way when
-- a plain `create or replace view` (which requires matching existing column
-- order) wiped user_id, and a bare drop+create wiped the approval filter.
-- Using drop+create here with both restored, so this file actually
-- reproduces the real production view.
drop view if exists public.public_creator_profiles;

create view public.public_creator_profiles
with (security_invoker = false) as
select id, user_id, display_name, platform, handle, follower_count, tier, niche,
       youtube_monetized, custom_price, profile_url
from public.creators
where approved = true;

grant select on public.public_creator_profiles to authenticated;