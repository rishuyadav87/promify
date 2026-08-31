-- ---------------------------------------------------------------------------
-- Fix: manual (unverified) follower_count edits were being silently reverted
-- ---------------------------------------------------------------------------
-- 0014 (and 0018, which widened it to Instagram) reverted oauth_connected/
-- follower_count on ANY update to a youtube/instagram row, regardless of
-- whether that row was actually OAuth-verified yet. That was too broad --
-- it correctly stopped someone from tampering with an already-verified
-- count, but also silently blocked a creator from ever editing their own
-- self-reported (unverified) follower_count after the initial manual add,
-- since it reverted the change back to the old value with no error shown.
-- This adds the missing "only if already verified" condition.
create or replace function public.protect_youtube_verified_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.platform not in ('youtube', 'instagram') then
    return new;
  end if;

  if public.current_user_role() = 'admin' or auth.uid() is null then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    if new.oauth_connected then
      new.oauth_connected := false;
      new.follower_count := 0;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- Only lock these columns once a row is ALREADY OAuth-verified.
    -- A manually self-reported row must stay freely editable by its
    -- owner, including follower_count, right up until they connect
    -- via OAuth for real.
    if old.oauth_connected
       and (
         new.oauth_connected is distinct from old.oauth_connected
         or new.follower_count is distinct from old.follower_count
       ) then
      new.oauth_connected := old.oauth_connected;
      new.follower_count := old.follower_count;
    end if;
  end if;

  return new;
end;
$$;