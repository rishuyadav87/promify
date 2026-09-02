-- ---------------------------------------------------------------------------
-- Add a sanity ceiling on creators.follower_count
-- ---------------------------------------------------------------------------
-- 0001_init.sql only checked `follower_count >= 0`. The server action in
-- src/app/dashboard/creator/profile/actions.ts now also rejects values
-- above FOLLOWER_COUNT_MAX (src/lib/pricing.ts) before the write reaches
-- Supabase, but per the project's established pattern (see 0007-0009,
-- 0012, 0019: RLS/actions alone were repeatedly not enough), the database
-- stays the last line of defense in case a future code path writes to this
-- table directly. Added as a new named constraint rather than trying to
-- replace the original unnamed `>= 0` check, since Postgres auto-named
-- that one and guessing its generated name to DROP it is fragile -- adding
-- a second constraint achieves the same result without that risk.
--
-- 1,000,000,000 mirrors FOLLOWER_COUNT_MAX in src/lib/pricing.ts. If that
-- constant ever changes, this constraint needs a follow-up migration to
-- match -- there's no way for a SQL CHECK to read a TS constant directly.
alter table public.creators
  add constraint creators_follower_count_max_check
  check (follower_count <= 1000000000);