-- ---------------------------------------------------------------------------
-- Close INSERT-time gap in the verified-columns and approved-column guards
-- ---------------------------------------------------------------------------
-- 0014/0018 (oauth_connected, follower_count) and 0007 (approved) only ran
-- `before update`. creators_insert_own's RLS policy (0001) only checks row
-- ownership, not column values -- so a creator's very first insert of a
-- platform could set oauth_connected/approved/follower_count to anything,
-- fabricating a "Verified" badge and skipping admin review entirely, with
-- no OAuth callback or admin ever involved. This extends both triggers to
-- also run on INSERT, and switches the trusted-write check from an
-- implicit NULL comparison to an explicit one, since relying on
-- "NULL <> 'admin' short-circuits an IF" is fragile to read and easy to
-- accidentally break in a future edit.
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

  -- Admins, and trusted service-role connections (no auth.uid() at all --
  -- this is how both OAuth callbacks write), are allowed through freely.
  if public.current_user_role() = 'admin' or auth.uid() is null then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    if new.oauth_connected then
      new.oauth_connected := false;
      new.follower_count := 0;
    end if;
  elsif TG_OP = 'UPDATE' then
    if new.oauth_connected is distinct from old.oauth_connected
       or new.follower_count is distinct from old.follower_count then
      new.oauth_connected := old.oauth_connected;
      new.follower_count := old.follower_count;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists "01_protect_youtube_verified_columns" on public.creators;
create trigger "01_protect_youtube_verified_columns"
  before insert or update on public.creators
  for each row
  execute function public.protect_youtube_verified_columns();

create or replace function public.protect_creators_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() = 'admin' or auth.uid() is null then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    if new.approved then
      new.approved := false;
    end if;
  elsif TG_OP = 'UPDATE' then
    if new.approved is distinct from old.approved then
      new.approved := old.approved;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_creators_approved on public.creators;
create trigger protect_creators_approved
  before insert or update on public.creators
  for each row
  execute function public.protect_creators_approved();