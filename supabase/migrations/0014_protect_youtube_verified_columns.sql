-- ---------------------------------------------------------------------------
-- Fix: creators.oauth_connected / follower_count self-writable on YouTube rows
-- ---------------------------------------------------------------------------
-- Unlike `tier` (0013), these two can't be "computed" -- they legitimately
-- come from an external source (Google's API) and there's no formula to
-- derive them from other columns. The only real fix is distinguishing a
-- trusted write from an untrusted one, which RLS/triggers can't do when
-- both come from the same user session -- so the OAuth callback route was
-- changed to write using a service-role client instead (see
-- src/lib/supabase/serviceRole.ts and src/app/auth/callback/google/route.ts).
--
-- This trigger is the database-side half of that fix: a service-role
-- connection has no auth.uid() (no user JWT at all), so this only blocks
-- the columns for an actual logged-in user's own session -- exactly the
-- case that was exploitable before. It does NOT affect service-role
-- writes (the real OAuth flow) or admins.
--
-- Deliberately scoped to platform = 'youtube' only. Instagram creators are
-- meant to self-report follower_count as a stopgap until Instagram OAuth
-- exists (documented, accepted limitation) -- this must keep working
-- exactly as before for Instagram rows.
create or replace function public.protect_youtube_verified_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.platform = 'youtube'
     and auth.uid() is not null
     and public.current_user_role() <> 'admin'
     and (
       new.oauth_connected is distinct from old.oauth_connected
       or new.follower_count is distinct from old.follower_count
     ) then
    new.oauth_connected := old.oauth_connected;
    new.follower_count := old.follower_count;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_youtube_verified_columns on public.creators;
-- Named with a "01_" prefix so it fires before 02_compute_creator_tier
-- (0013) -- see that migration's comment for why the order matters here.
create trigger "01_protect_youtube_verified_columns"
  before update on public.creators
  for each row
  execute function public.protect_youtube_verified_columns();
