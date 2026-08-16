-- ---------------------------------------------------------------------------
-- Extends the status state machine (0012) to allow 'disputed'
-- ---------------------------------------------------------------------------
-- 0012 deliberately left 'disputed' unreachable by non-admins, since
-- nothing in the app created disputes yet. Now that the dispute-opening
-- feature is being built (openDispute action + disputes table, which
-- already existed with correct RLS since 0001), this adds the missing
-- transitions: either party can move an active campaign into 'disputed'
-- from any state after acceptance and before completion.
--
-- Resolving a dispute back out (disputed -> completed / refunded) is
-- intentionally NOT added here for non-admins -- only an admin should
-- resolve a dispute, and admins already bypass this trigger entirely
-- (see the `current_user_role() <> 'admin'` check in the function body),
-- so that path already works without needing anything added here.
create or replace function public.validate_campaign_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and public.current_user_role() <> 'admin' then
    if not (
      (old.status = 'pending' and new.status in ('accepted', 'declined'))
      or (old.status = 'accepted' and new.status in ('content_submitted', 'disputed'))
      or (old.status = 'content_submitted' and new.status in ('live', 'completed', 'disputed'))
      or (old.status = 'live' and new.status in ('measuring', 'completed', 'disputed'))
      or (old.status = 'measuring' and new.status in ('completed', 'disputed'))
    ) then
      raise exception 'Invalid campaign status transition: % -> %',
        old.status, new.status;
    end if;
  end if;
  return new;
end;
$$;
-- No need to recreate the trigger itself -- it already points at this
-- function by name (see 0012), so replacing the function body is enough.
