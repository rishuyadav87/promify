-- Adds creator-set custom pricing and YouTube monetization status,
-- both used by the brand-facing creator detail page's price display.
alter table public.creators
  add column custom_price numeric(12, 2) check (custom_price >= 0),
  add column youtube_monetized boolean not null default false;

-- Rebuild the browsable directory view to expose the two new columns.
create or replace view public.public_creator_profiles
with (security_invoker = true) as
select id, display_name, platform, handle, follower_count, tier, niche,
       custom_price, youtube_monetized
from public.creators;