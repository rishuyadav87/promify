-- ---------------------------------------------------------------------------
-- Fix: campaigns.status could be set to any value directly
-- ---------------------------------------------------------------------------
-- Same underlying gap as 0009 (price): campaigns_update_participant_or_admin
-- only checks that you're a participant, not which status transitions are
-- legitimate. A brand could jump a campaign straight from 'pending' to
-- 'completed' via a direct client call, skipping content submission and
-- the creator's agreement entirely.
--
-- This only allows the transitions actually used by the app today:
--   pending            -> accepted            (acceptOffer)
--   pending            -> declined             (declineCampaign)
--   accepted           -> content_submitted    (submitContent)
--   content_submitted  -> live
--   content_submitted  -> completed
--   live               -> measuring
--   live               -> completed
--   measuring          -> completed
-- (live/measuring have no *entry* code path yet either -- they're already
-- referenced as reachable in src/lib/campaignLifecycle.ts's
-- COMPLETABLE_STATUSES, so allowing exits from them now avoids this
-- trigger blocking that feature once it's built.)
--
-- 'disputed' and 'refunded' are deliberately NOT reachable by non-admins
-- yet, since nothing in the app creates them today -- when the dispute
-- UI and refund logic get built, this trigger's transition map will need
-- a follow-up migration adding those transitions. Admins bypass this
-- check entirely (same pattern as 0007/0009), so admin-driven dispute
-- resolution isn't blocked by that gap in the meantime.
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
      or (old.status = 'accepted' and new.status = 'content_submitted')
      or (old.status = 'content_submitted' and new.status in ('live', 'completed'))
      or (old.status = 'live' and new.status in ('measuring', 'completed'))
      or (old.status = 'measuring' and new.status = 'completed')
    ) then
      -- Reject outright rather than silently reverting (unlike the price
      -- trigger) -- a status change is usually one field in an update
      -- that's entirely about that transition, so silently keeping the
      -- old status would leave the rest of the update looking like it
      -- succeeded when the actual intent failed.
      raise exception 'Invalid campaign status transition: % -> %',
        old.status, new.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_campaign_status_transition on public.campaigns;
create trigger validate_campaign_status_transition
  before update on public.campaigns
  for each row
  execute function public.validate_campaign_status_transition();
