-- Lets creators store a direct link to their Instagram/YouTube profile,
-- shown to brands alongside the platform icon on the creator detail page.
alter table public.creators
  add column if not exists profile_url text null;

-- Re-expose it through the browsing view. security_invoker must stay FALSE
-- here — see 0005_repair_negotiation_schema.sql and 9999_lock_view_settings.sql
-- for the history on why this has broken silently before.
create or replace view public.public_creator_profiles
with (security_invoker = false) as
select id, display_name, platform, handle, follower_count, tier, niche,
       youtube_monetized, custom_price, profile_url
from public.creators;

grant select on public.public_creator_profiles to authenticated;