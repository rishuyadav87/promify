-- ---------------------------------------------------------------------------
-- Fix 1: users.role privilege escalation
-- ---------------------------------------------------------------------------
-- users_update_own (from 0001_init.sql) only checked *whose* row was being
-- updated (id = auth.uid()), with no restriction on *which columns* could
-- change. Since `role` is a plain column on the same row, any logged-in
-- user could run:
--   supabase.from('users').update({ role: 'admin' }).eq('id', <own id>)
-- directly from the browser console and become an admin. No code in this
-- app actually updates the users table client-side, so this policy has no
-- legitimate use — safe to remove entirely rather than try to patch it.
drop policy if exists users_update_own on public.users;

-- ---------------------------------------------------------------------------
-- Fix 2: creators.approved self-approval
-- ---------------------------------------------------------------------------
-- creators_update_own_or_admin has the same shape of gap: it checks row
-- ownership but not which columns changed, so a creator could set their own
-- `approved` column to true directly, bypassing the admin approval flow
-- entirely (src/app/dashboard/admin/creators/actions.ts is the only place
-- in the app that's supposed to set this).
--
-- Unlike `tier`/`oauth_connected`/`follower_count` — which are legitimately
-- written by a user's own session today via the profile-edit action and the
-- YouTube OAuth callback — nothing in the app ever legitimately sets
-- `approved` from a non-admin session. So this one column can be locked
-- down safely right now with a trigger, without touching the others.
--
-- The admin approval action already runs as an authenticated admin, so
-- public.current_user_role() = 'admin' correctly allows it through; any
-- other session attempting to change `approved` has that change silently
-- reverted back to its previous value.
create or replace function public.protect_creators_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.approved is distinct from old.approved
     and public.current_user_role() <> 'admin' then
    new.approved := old.approved;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_creators_approved on public.creators;
create trigger protect_creators_approved
  before update on public.creators
  for each row
  execute function public.protect_creators_approved();

-- Follow-up (not done in this migration): tier / oauth_connected /
-- follower_count on creators are still writable by a user's own session,
-- since the OAuth callback and profile-edit action both write as the
-- logged-in user rather than a trusted service role. Locking those down
-- properly needs those two write paths moved to a service-role process
-- first — flagged for a later migration, not safe to block here without
-- breaking the working YouTube connect flow.