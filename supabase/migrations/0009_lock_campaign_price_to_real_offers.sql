-- ---------------------------------------------------------------------------
-- Fix: campaigns.price / status changeable by direct client writes
-- ---------------------------------------------------------------------------
-- campaigns_update_participant_or_admin (0001_init.sql) only checks that
-- you're a participant in the campaign -- it never restricted which
-- columns change or what values they can take. The acceptOffer fix in
-- 0006/the app code stops this happening through the app's own UI, but
-- RLS is what actually decides what's allowed at the database, and
-- anyone could still bypass the app entirely with a direct client call:
--
--   supabase.from('campaigns')
--     .update({ status: 'accepted', price: 1 })
--     .eq('id', campaignId)
--
-- This closes it at the source: a trigger that only allows `price` to
-- change when the new value exactly matches a real row already recorded
-- in campaign_offers for that campaign -- so the price actually agreed
-- through negotiation is the only price that can ever be written,
-- regardless of which code path (app UI or a raw API call) attempts the
-- write. Admins are exempt, since they may need to make manual
-- corrections (e.g. resolving a dispute).
create or replace function public.protect_campaigns_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.price is distinct from old.price
     and public.current_user_role() <> 'admin' then
    if not exists (
      select 1 from public.campaign_offers
      where campaign_id = new.id and amount = new.price
    ) then
      -- Silently reject the price change by keeping the old value,
      -- rather than throwing -- this matches the same pattern used for
      -- creators.approved in 0007, and avoids breaking a legitimate
      -- update that also touches other columns at the same time.
      new.price := old.price;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_campaigns_price on public.campaigns;
create trigger protect_campaigns_price
  before update on public.campaigns
  for each row
  execute function public.protect_campaigns_price();

-- Follow-up (not done in this migration): campaigns.status can still be
-- set to any value by either participant directly (e.g. a brand jumping
-- straight from 'pending' to 'completed', skipping content_submitted and
-- the other party's agreement entirely). A full state-machine trigger
-- validating allowed transitions per role is a larger piece of work --
-- flagged here, not fixed in this migration.
