-- Named to sort after every other migration on purpose. If 0001_init.sql
-- (or anything else that redefines this view with security_invoker=true)
-- ever gets re-run against this database, run this file immediately after
-- to restore the correct setting. Safe to run any number of times.
alter view public.public_creator_profiles set (security_invoker = false);