-- ---------------------------------------------------------------------------
-- Fix: creators.profile_url could store a javascript: URI (stored XSS)
-- ---------------------------------------------------------------------------
-- The app's own edit-profile action now validates the protocol (see
-- src/app/dashboard/creator/profile/actions.ts), but RLS on `creators`
-- still allows a row owner to update any column directly, so a raw client
-- call could bypass the app entirely:
--   supabase.from('creators')
--     .update({ profile_url: 'javascript:alert(document.cookie)' })
--     .eq('id', myCreatorRowId)
-- This value is rendered as a real <a href> on the brand-facing browse
-- page, so anything other than a normal http(s) link there is a stored
-- XSS risk against whichever brand clicks it. A database-level check
-- constraint closes this regardless of which code path writes the value.
alter table public.creators
  add constraint creators_profile_url_http_only
  check (
    profile_url is null
    or profile_url ~* '^https?://'
  );
