-- 0005_repair_negotiation_schema.sql used `create or replace view` to add
-- custom_price to public_creator_profiles. Because CREATE OR REPLACE VIEW
-- requires the new SELECT list to match the existing column order/set, and
-- the replacement list here didn't include everything the *live* view had,
-- it silently dropped `user_id`, `profile_url`, and the `where approved =
-- true` filter that 0003 had deliberately restored (see 0003's comments —
-- this is the exact regression that file was written to prevent).
--
-- This broke two live queries that select user_id/profile_url directly off
-- this view (src/app/dashboard/brand/browse/page.tsx and
-- .../browse/[creatorId]/page.tsx), and removed the approval gate, meaning
-- unapproved creators would appear in brand-facing browsing.
--
-- Fix: DROP + CREATE (never CREATE OR REPLACE on this view — see 0003 and
-- 9999 for why), restoring the full column list and the approval filter.
-- 9999_lock_view_settings.sql only re-asserts security_invoker = false and
-- does NOT restore columns, so it does not cover this — this migration is
-- still required and must run after 9999 in the deploy order (it will
-- re-run 9999's guard implicitly since CREATE VIEW here also sets
-- security_invoker = false explicitly).

drop view if exists public.public_creator_profiles;

create view public.public_creator_profiles
with (security_invoker = false) as
select id, user_id, display_name, platform, handle, follower_count, tier,
       niche, youtube_monetized, custom_price, profile_url
from public.creators
where approved = true;

grant select on public.public_creator_profiles to authenticated;

-- Before applying this against production, verify the live view's current
-- column set first:
--   select column_name from information_schema.columns
--   where table_name = 'public_creator_profiles';
-- per this project's standing rule of never trusting migration files alone
-- for this particular view.