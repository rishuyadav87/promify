-- ---------------------------------------------------------------------------
-- Extends the status state machine (0012/0016) to allow resubmission
-- ---------------------------------------------------------------------------
-- Once a campaign is disputed, there was no way forward at all -- the
-- creator couldn't fix the content and try again, since 'disputed' had
-- no outgoing transitions for non-admins. This adds disputed ->
-- content_submitted, so a creator can submit a corrected post URL and
-- put the campaign back in front of the brand (see resubmitContent in
-- src/lib/actions/campaigns.ts). The dispute row itself is left alone --
-- an admin still reviews and formally resolves it separately; this only
-- unblocks the campaign from being stuck with no path forward.
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
      or (old.status = 'disputed' and new.status = 'content_submitted')
    ) then
      raise exception 'Invalid campaign status transition: % -> %',
        old.status, new.status;
    end if;
  end if;
  return new;
end;
$$;
-- No need to recreate the trigger itself -- see 0012's comment.
