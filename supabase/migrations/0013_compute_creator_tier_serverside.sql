-- ---------------------------------------------------------------------------
-- Fix: creators.tier was self-writable to any value
-- ---------------------------------------------------------------------------
-- tier is supposed to be derived from follower_count (see
-- src/lib/pricing.ts's getEligibleTier), but the app only enforces that
-- in the profile-edit Server Action -- RLS on `creators` still lets a row
-- owner update any column directly, so a raw client call could set
-- tier to 'tier1' regardless of actual follower_count.
--
-- Rather than try to block writes to `tier` (which would need to
-- distinguish a trusted server write from a raw client one -- impossible
-- with RLS/triggers alone, since both use the same user session), this
-- makes tier fully computed on every insert/update. Whatever value a
-- client sends for `tier` is simply overwritten with the correct one
-- calculated from follower_count/platform/youtube_monetized. This closes
-- it completely regardless of code path, without needing a service role.
--
-- Thresholds mirror src/lib/pricing.ts exactly -- if those constants
-- change, this function needs the same update to stay in sync
-- (ELIGIBILITY_FLOOR = 1000, TIER1_THRESHOLD = 10000).
create or replace function public.compute_creator_tier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.follower_count < 1000 then
    new.tier := null;
  elsif new.platform = 'instagram' then
    new.tier := case when new.follower_count >= 10000 then 'tier1' else 'tier2' end;
  else -- youtube
    new.tier := case
      when new.youtube_monetized or new.follower_count >= 10000 then 'tier1'
      else 'tier2'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists compute_creator_tier on public.creators;
-- Named with a "02_" prefix on purpose. Postgres fires multiple triggers
-- on the same table/event in alphabetical order by trigger NAME (not
-- creation order), and this one must run AFTER
-- 01_protect_youtube_verified_columns (0014) -- otherwise tier would get
-- computed from a spoofed follower_count before that trigger has a
-- chance to revert it back to the real value.
create trigger "02_compute_creator_tier"
  before insert or update on public.creators
  for each row
  execute function public.compute_creator_tier();
