-- ---------------------------------------------------------------------------
-- Extend the YouTube column-protection trigger (0014) to Instagram
-- ---------------------------------------------------------------------------
-- 0014 deliberately scoped this protection to platform = 'youtube', because
-- at the time Instagram had no OAuth and creators were meant to self-report
-- their Instagram follower_count by hand. Now that real Instagram OAuth
-- exists (src/app/auth/callback/instagram/route.ts), that stopgap no longer
-- applies: a creator could verify Instagram once, then edit follower_count
-- afterward through the normal profile form while still showing as
-- "verified" -- the same hole 0014 closed for YouTube.
--
-- Rather than editing 0014's function (past migrations should stay
-- immutable), this replaces it with a version that covers both platforms.
create or replace function public.protect_youtube_verified_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.platform in ('youtube', 'instagram')
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