alter table public.users
  add column username text unique;

alter table public.users
  add constraint username_format check (
    username is null or username ~ '^[a-z0-9_]{3,20}$'
  );