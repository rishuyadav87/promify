/**
 * Placeholder types so the app compiles before you connect a real project.
 *
 * Once your Supabase project exists and the migration in
 * supabase/migrations/0001_init.sql has been applied, regenerate this file
 * with the real, fully-typed schema:
 *
 *   npx supabase login
 *   npx supabase link --project-ref <your-project-ref>
 *   npm run gen:types
 *
 * Everything in src/lib/supabase is already typed against `Database`, so
 * once you regenerate this file, `.from("campaigns").select()` etc. will
 * be fully type-checked against your actual columns automatically.
 */
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
    Enums: Record<string, string>;
  };
};
