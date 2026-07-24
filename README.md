# Creator Marketplace

A responsive **website** (not a native app) connecting content creators with
brands for paid promotions — Next.js 14 (App Router) + TypeScript + Tailwind
CSS + Supabase.

It runs in any desktop or mobile browser: layouts are built mobile-first
with Tailwind's default breakpoints (`sm`/`md`/`lg`/`xl`/`2xl`), and the
root layout sets a standard responsive viewport (see `src/app/layout.tsx`).
There is no native shell, no app-store packaging, and nothing platform
-specific — just a server-rendered site.

## Folder structure

```
creator-marketplace/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout, responsive viewport
│   │   ├── page.tsx                # public landing page
│   │   ├── globals.css             # Tailwind directives
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx     # collects role: creator | brand
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # auth guard for every /dashboard/* route
│   │   │   ├── page.tsx            # redirects to the role-specific dashboard
│   │   │   ├── creator/page.tsx
│   │   │   ├── brand/page.tsx
│   │   │   └── admin/page.tsx
│   │   └── api/
│   │       ├── auth/signout/route.ts
│   │       └── campaigns/route.ts  # example authenticated write endpoint
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # browser client (Client Components)
│   │   │   ├── server.ts           # server client (Server Components/Actions)
│   │   │   └── middleware.ts       # session refresh helper
│   │   └── types/
│   │       └── database.types.ts   # placeholder — regenerate from your project
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql           # schema + RLS
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then
   copy the env file and fill it in from *Project Settings → API*:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Apply the migration.** Either paste
   `supabase/migrations/0001_init.sql` into the SQL editor in the Supabase
   dashboard, or, with the [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. **Enable email auth** (on by default) under *Authentication → Providers*
   in the dashboard — signup/login already work against it.

5. **Regenerate typed database types** once the migration has run, so
   Supabase queries are fully type-checked:
   ```bash
   npm run gen:types
   ```

6. **Run the dev server**
   ```bash
   npm run dev
   ```

## How the pieces fit together

- **`src/lib/supabase/client.ts`** — used in Client Components (forms,
  interactive widgets). Session lives in cookies via `@supabase/ssr`.
- **`src/lib/supabase/server.ts`** — used in Server Components, Server
  Actions, and Route Handlers. Create a fresh instance per request; never
  cache it at module scope.
- **`src/middleware.ts`** — refreshes the auth session cookie on every
  request so Server Components always see a valid session.
- **RLS does the authorization**, not application code: every Supabase
  query above just does `.from("campaigns").select()` with no manual
  `.eq("creator_id", ...)` filter — the database only returns rows the
  signed-in user is allowed to see, per `supabase/migrations/0001_init.sql`.

## Notes on the schema/RLS design

- `creators` and `brands` rows are auto-created by a `handle_new_user`
  trigger on `auth.users`, reading the role from `signUp(..., { options:
  { data: { role } } })` (see the signup page). No manual "create profile"
  step is required after signup.
- The `creators`/`brands`/`campaigns` policies restrict rows strictly to
  their owner (or the campaign's two participants), per the requirement.
  Since a marketplace also needs brands to *discover* creators, there's a
  `public_creator_profiles` view with a handful of non-sensitive columns
  that any authenticated user can browse, without loosening the base
  `creators` table's policy — see the comment above it in the migration.
- `payouts` are admin-write only from the browser client. In production,
  write payouts from a trusted server process (e.g. a payment-provider
  webhook using the service-role key, which bypasses RLS) rather than
  directly from client code.
- Column-level rules (e.g. "only a creator can set `post_url`", "only a
  brand can set `price`") aren't expressible in table-level RLS alone —
  the migration leaves a note where you'll want a trigger or API-layer
  check once you build out the status-transition logic.
