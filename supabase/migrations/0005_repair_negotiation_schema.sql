-- 1. custom_price column
alter table public.creators
  add column if not exists custom_price numeric(12, 2) null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'creators_custom_price_check'
  ) then
    alter table public.creators
      add constraint creators_custom_price_check
      check (custom_price is null or custom_price > 0);
  end if;
end $$;

-- 2. 'declined' status
alter type public.campaign_status add value if not exists 'declined';

-- 3. offer_party enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'offer_party') then
    create type public.offer_party as enum ('creator', 'brand');
  end if;
end $$;

-- 4. campaign_offers table
create table if not exists public.campaign_offers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  offered_by public.offer_party not null,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_campaign_offers_campaign_id
  on public.campaign_offers (campaign_id);

-- 5. RLS — drop-then-create makes this idempotent (CREATE POLICY has no
-- IF NOT EXISTS in Postgres)
alter table public.campaign_offers enable row level security;

drop policy if exists campaign_offers_select_participant_or_admin on public.campaign_offers;
create policy campaign_offers_select_participant_or_admin on public.campaign_offers
  for select
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_offers.campaign_id
        and (c.creator_id = public.current_creator_id() or c.brand_id = public.current_brand_id())
    )
  );

drop policy if exists campaign_offers_insert_participant on public.campaign_offers;
create policy campaign_offers_insert_participant on public.campaign_offers
  for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_offers.campaign_id
        and (c.creator_id = public.current_creator_id() or c.brand_id = public.current_brand_id())
    )
  );

-- 6. Cross-party visibility for campaign detail pages
drop policy if exists brands_select_campaign_participant on public.brands;
create policy brands_select_campaign_participant on public.brands
  for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.brand_id = brands.id and c.creator_id = public.current_creator_id()
    )
  );

drop policy if exists creators_select_campaign_participant on public.creators;
create policy creators_select_campaign_participant on public.creators
  for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.creator_id = creators.id and c.brand_id = public.current_brand_id()
    )
  );

-- 7. View — safe to re-run, CREATE OR REPLACE
create or replace view public.public_creator_profiles
with (security_invoker = false) as
select id, display_name, platform, handle, follower_count, tier, niche,
       youtube_monetized, custom_price
from public.creators;

grant select on public.public_creator_profiles to authenticated;