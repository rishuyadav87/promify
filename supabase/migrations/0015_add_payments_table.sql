-- ---------------------------------------------------------------------------
-- payments: tracks what the brand is charged for a campaign
-- ---------------------------------------------------------------------------
-- The existing `payouts` table (0001_init.sql) already tracks what the
-- creator receives, but nothing tracked the brand's side of the money --
-- the actual charge. This adds that missing half.
--
-- commission_percent is deliberately snapshotted here, per-payment, rather
-- than read fresh from a settings table every time it's needed. Juncture
-- is launching commission-free and will introduce a rate later -- storing
-- it at charge time means a future rate change can never retroactively
-- apply to a campaign that was already agreed and charged under the old
-- (free) rate. Whatever the rate was the moment this row was created is
-- the rate that applies to it forever.
--
-- Actual charging happens through Razorpay, and this table's writes are
-- expected to come from a Razorpay webhook using the service-role client
-- (same pattern as the YouTube OAuth callback in
-- src/lib/supabase/serviceRole.ts) -- never from a regular brand/creator
-- session, since payment status must reflect what Razorpay actually
-- confirmed, not what a client claims happened.
create type public.payment_status as enum (
  'created', -- Razorpay order created, brand hasn't paid yet
  'paid',    -- brand successfully paid, funds held by Juncture
  'failed',
  'refunded'
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0), -- gross amount charged to the brand
  commission_percent numeric(5, 2) not null default 0
    check (commission_percent >= 0 and commission_percent <= 100),
  razorpay_order_id text,
  razorpay_payment_id text,
  status public.payment_status not null default 'created',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_payments_campaign_id on public.payments (campaign_id);

alter table public.payments enable row level security;

-- Same visibility pattern as payouts: either participant can see their
-- own campaign's payment record (so a brand can see what they were
-- charged, a creator can see the campaign was actually paid for).
create policy payments_select_participant_or_admin on public.payments
  for select
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.campaigns c
      where c.id = payments.campaign_id
        and (
          c.creator_id = public.current_creator_id()
          or c.brand_id = public.current_brand_id()
        )
    )
  );

-- Writes are admin/service-role only -- never a regular brand or creator
-- session. Regular sessions creating or editing their own "I paid"
-- record would be exactly the kind of self-reported financial claim
-- this whole table exists to avoid; real payment confirmation has to
-- come from Razorpay itself via a service-role webhook handler.
create policy payments_write_admin on public.payments
  for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
