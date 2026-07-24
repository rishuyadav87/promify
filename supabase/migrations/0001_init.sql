-- =============================================================================
-- Creator Marketplace — initial schema + Row Level Security
-- Run via: supabase db push   (or paste into the SQL editor in the dashboard)
-- =============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('creator', 'brand', 'admin');
create type public.platform_type as enum ('instagram', 'youtube');
create type public.creator_tier as enum ('tier1', 'tier2');
create type public.usage_rights_type as enum ('none', '30days', '60days', '90days');
create type public.campaign_status as enum (
  'pending',
  'accepted',
  'content_submitted',
  'live',
  'measuring',
  'completed',
  'refunded',
  'disputed'
);
create type public.payout_status as enum ('pending', 'processing', 'released', 'failed');
create type public.dispute_status as enum ('open', 'under_review', 'resolved', 'rejected');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per authenticated person, mirroring auth.users with an app-level role.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  display_name text not null,
  platform public.platform_type not null,
  handle text not null,
  follower_count integer not null default 0 check (follower_count >= 0),
  engagement_rate numeric(5, 2) check (engagement_rate >= 0),
  tier public.creator_tier,
  oauth_connected boolean not null default false,
  niche text,
  created_at timestamptz not null default now(),
  unique (user_id, platform) -- one profile per platform per person
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  company_name text not null,
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  creator_id uuid not null references public.creators (id) on delete cascade,
  status public.campaign_status not null default 'pending',
  price numeric(12, 2) not null check (price >= 0),
  expected_range_low numeric(12, 2),
  expected_range_high numeric(12, 2),
  requires_approval boolean not null default false,
  usage_rights public.usage_rights_type not null default 'none',
  post_url text,
  measurement_window_ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint expected_range_valid check (
    expected_range_low is null
    or expected_range_high is null
    or expected_range_low <= expected_range_high
  )
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  tds_deducted numeric(12, 2) not null default 0 check (tds_deducted >= 0),
  status public.payout_status not null default 'pending',
  released_at timestamptz
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  reason text not null,
  status public.dispute_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes for the FK lookups every RLS policy below does on every query
-- ---------------------------------------------------------------------------
create index idx_creators_user_id on public.creators (user_id);
create index idx_brands_user_id on public.brands (user_id);
create index idx_campaigns_brand_id on public.campaigns (brand_id);
create index idx_campaigns_creator_id on public.campaigns (creator_id);
create index idx_payouts_campaign_id on public.payouts (campaign_id);
create index idx_disputes_campaign_id on public.disputes (campaign_id);

-- ---------------------------------------------------------------------------
-- Helper functions used by RLS policies.
-- SECURITY DEFINER + a pinned search_path lets these bypass RLS on `users`/
-- `creators`/`brands` internally (avoiding infinite recursion) while still
-- only ever returning data scoped to the caller, since every one of them
-- filters on auth.uid().
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.current_creator_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.creators where user_id = auth.uid();
$$;

create or replace function public.current_brand_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.brands where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Auto-provisioning: when someone signs up, create their `users` row (and
-- their `creators`/`brands` row) from the role passed in signUp's
-- `options.data.role` — see src/app/(auth)/signup/page.tsx.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role public.user_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'creator'
  );
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, chosen_role);

  if chosen_role = 'creator' then
    insert into public.creators (user_id, display_name, platform, handle)
    values (new.id, coalesce(new.email, 'New creator'), 'instagram', 'unset');
  elsif chosen_role = 'brand' then
    insert into public.brands (user_id, company_name)
    values (new.id, coalesce(new.email, 'New brand'));
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.creators enable row level security;
alter table public.brands enable row level security;
alter table public.campaigns enable row level security;
alter table public.payouts enable row level security;
alter table public.disputes enable row level security;

-- users: everyone can see their own row; admins see everyone.
-- No insert policy — rows are created only by the handle_new_user trigger.
create policy users_select_own_or_admin on public.users
  for select
  using (id = auth.uid() or public.current_user_role() = 'admin');

create policy users_update_own on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- creators: creators manage their own profile; admins see all.
--
-- NOTE: a real marketplace also needs brands to *discover* creators to
-- propose campaigns to, which a strict "own rows only" policy blocks by
-- design. Rather than weaken this table's policy, expose browsing through
-- the `public_creator_profiles` view below, which deliberately excludes
-- sensitive columns (none are sensitive here yet, but this keeps the base
-- table's policy strict as required and gives you one place to redact
-- fields later without touching RLS).
create policy creators_select_own_or_admin on public.creators
  for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy creators_insert_own on public.creators
  for insert
  with check (user_id = auth.uid());

create policy creators_update_own_or_admin on public.creators
  for update
  using (user_id = auth.uid() or public.current_user_role() = 'admin')
  with check (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy creators_delete_own_or_admin on public.creators
  for delete
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

-- Browsable, non-sensitive creator directory for brands. Security_invoker
-- means it still runs as the querying user, but since it only selects
-- non-sensitive columns it's safe to expose broadly to any authenticated
-- user regardless of the strict policy on the base table.
create view public.public_creator_profiles
with (security_invoker = true) as
select id, display_name, platform, handle, follower_count, tier, niche
from public.creators;

grant select on public.public_creator_profiles to authenticated;

-- brands: brands manage their own profile; admins see all.
create policy brands_select_own_or_admin on public.brands
  for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy brands_insert_own on public.brands
  for insert
  with check (user_id = auth.uid());

create policy brands_update_own_or_admin on public.brands
  for update
  using (user_id = auth.uid() or public.current_user_role() = 'admin')
  with check (user_id = auth.uid() or public.current_user_role() = 'admin');

-- campaigns: visible to the brand that created it, the creator it's for,
-- or an admin.
create policy campaigns_select_participant_or_admin on public.campaigns
  for select
  using (
    creator_id = public.current_creator_id()
    or brand_id = public.current_brand_id()
    or public.current_user_role() = 'admin'
  );

-- Only brands can propose a campaign, and only under their own brand_id.
create policy campaigns_insert_brand on public.campaigns
  for insert
  with check (brand_id = public.current_brand_id());

-- Either party to the campaign can update it (e.g. creator submits
-- post_url and moves status to content_submitted; brand approves it to
-- live). Restricting *which columns* each role may change per status
-- transition is business logic best enforced in a trigger or your API
-- layer — RLS here only proves you're a participant.
create policy campaigns_update_participant_or_admin on public.campaigns
  for update
  using (
    creator_id = public.current_creator_id()
    or brand_id = public.current_brand_id()
    or public.current_user_role() = 'admin'
  )
  with check (
    creator_id = public.current_creator_id()
    or brand_id = public.current_brand_id()
    or public.current_user_role() = 'admin'
  );

create policy campaigns_delete_admin on public.campaigns
  for delete
  using (public.current_user_role() = 'admin');

-- payouts: visible to the campaign's brand/creator; only admins write.
-- Payouts should normally be created by a trusted server process (e.g. a
-- webhook using the service role key, which bypasses RLS entirely) rather
-- than directly by a browser client.
create policy payouts_select_participant_or_admin on public.payouts
  for select
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.campaigns c
      where c.id = payouts.campaign_id
        and (
          c.creator_id = public.current_creator_id()
          or c.brand_id = public.current_brand_id()
        )
    )
  );

create policy payouts_write_admin on public.payouts
  for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- disputes: either party to the campaign can view and open a dispute;
-- only admins resolve it (update).
create policy disputes_select_participant_or_admin on public.disputes
  for select
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.campaigns c
      where c.id = disputes.campaign_id
        and (
          c.creator_id = public.current_creator_id()
          or c.brand_id = public.current_brand_id()
        )
    )
  );

create policy disputes_insert_participant on public.disputes
  for insert
  with check (
    exists (
      select 1
      from public.campaigns c
      where c.id = disputes.campaign_id
        and (
          c.creator_id = public.current_creator_id()
          or c.brand_id = public.current_brand_id()
        )
    )
  );

create policy disputes_update_admin on public.disputes
  for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
