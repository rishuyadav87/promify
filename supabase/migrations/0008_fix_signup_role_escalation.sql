-- ---------------------------------------------------------------------------
-- Fix: unauthenticated admin account creation via signup metadata
-- ---------------------------------------------------------------------------
-- handle_new_user() previously cast whatever `role` value arrived in
-- signUp's options.data.role directly to the user_role enum:
--
--   chosen_role public.user_role := coalesce(
--     (new.raw_user_meta_data ->> 'role')::public.user_role,
--     'creator'
--   );
--
-- The signup page's UI only offers "creator"/"brand" as dropdown choices,
-- but that's a client-side restriction only -- nothing stopped a direct
-- call like:
--   supabase.auth.signUp({ email, password,
--     options: { data: { role: "admin" } } })
-- from creating a brand-new admin account with no existing account and no
-- login required, since user_role's enum values include 'admin'.
--
-- Fix: explicitly whitelist only 'brand' as a valid self-selected value;
-- anything else (including 'admin', typos, or missing data) falls back to
-- 'creator'. Admin accounts should only ever be created by an existing
-- admin promoting a user directly in the database/dashboard -- never
-- through public signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role public.user_role := case
    when (new.raw_user_meta_data ->> 'role') = 'brand' then 'brand'::public.user_role
    else 'creator'::public.user_role
  end;
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

-- No need to recreate the trigger itself (on_auth_user_created) -- it
-- already points at this function by name, so replacing the function body
-- is enough; Postgres will use the new version going forward.
