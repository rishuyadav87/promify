-- ---------------------------------------------------------------------------
-- Manual creator payouts: storage for where to send money, and a
-- reference field to record how it was actually sent
-- ---------------------------------------------------------------------------
-- Context: Razorpay Route (automatic payment splitting to creators) needs
-- either a minimum business turnover or a case-by-case RBI compliance
-- approval that a brand-new company won't have yet. Until Route is
-- available, payouts are sent manually (UPI/bank transfer, outside
-- Razorpay) and just tracked here so the product experience doesn't have
-- to wait on that approval.

-- A creator's UPI ID lives in its own table rather than as a new column
-- on `creators`, because `creators` is broadly readable -- brands browse
-- it, and 0006_restore_public_creator_profiles_view.sql exposes a public
-- view over it. A payout UPI ID has no reason to be visible to anyone but
-- the creator themselves and admins, so isolating it here means no
-- existing broad-read policy or view can ever accidentally leak it --
-- there's nothing to remember to exclude.
--
-- Keyed by user_id, not creator_id: a single person can have two rows in
-- `creators` (one per platform -- unique(user_id, platform) in
-- 0001_init.sql), but a payout UPI ID belongs to the person, not to
-- whichever platform profile happened to run a given campaign. Keying by
-- creator_id would mean a creator with two platforms has to set this
-- twice, and campaigns tied to whichever platform they didn't fill in for
-- would wrongly show "no payout details on file."
create table public.creator_payout_details (
  user_id uuid primary key references public.users (id) on delete cascade,
  upi_vpa text not null,
  updated_at timestamptz not null default now()
);

alter table public.creator_payout_details enable row level security;

create policy creator_payout_details_select_own_or_admin
  on public.creator_payout_details
  for select
  using (
    user_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy creator_payout_details_insert_own
  on public.creator_payout_details
  for insert
  with check (user_id = auth.uid());

create policy creator_payout_details_update_own
  on public.creator_payout_details
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admins can also manage entries directly (e.g. correcting a creator's
-- UPI ID on a support request), on top of the owner policies above.
create policy creator_payout_details_write_admin
  on public.creator_payout_details
  for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- A place to record proof a payout actually happened -- the UPI/bank
-- transaction reference (UTR) -- since with no Razorpay API call
-- confirming the transfer, this text field is the only audit trail that
-- a 'released' payout really was sent.
alter table public.payouts add column reference text;

-- payouts had no created_at at all (0001_init.sql) -- fine when nothing
-- read it, but the new admin payouts list (/dashboard/admin/payouts)
-- needs to sort pending payouts oldest-first so nothing sits forgotten.
alter table public.payouts add column created_at timestamptz not null default now();
