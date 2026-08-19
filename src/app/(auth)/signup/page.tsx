"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
type Role = "creator" | "brand";

// useSearchParams requires a Suspense boundary in the App Router, or
// `npm run build` fails even though `npm run dev` looks fine -- this
// split (outer wrapper + inner form) is the standard fix: the boundary
// has to sit *above* the component that calls useSearchParams, not
// around itself.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Preselects based on ?role=creator|brand if the person arrived from
  // the homepage's split hero (see src/app/page.tsx) -- falls back to
  // "creator" for anyone landing here directly, same as before.
  const [role, setRole] = useState<Role>(
    searchParams.get("role") === "brand" ? "brand" : "creator",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // `role` is stored in user_metadata; a DB trigger (see the migration's
    // handle_new_user function) reads it to create the row in `users` and
    // the matching `creators`/`brands` row automatically.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCheckEmail(true);
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-semibold text-ink">Check your email</h1>
          <p className="text-sm text-warmgray">
            We sent a confirmation link to {email}.
          </p>
        </Card>
      </main>
    );
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Sign up
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">I am a…</span>
            <div className="flex gap-2">
              {(["creator", "brand"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? r === "creator"
                        ? "border-brick bg-brick text-stone"
                        : "border-teal bg-teal text-stone"
                      : "border-ink/20 text-ink hover:bg-ink/5"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="mt-2 w-full"
          >
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-warmgray">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-ink underline underline-offset-2"
        >
          Log in
        </a>
      </p>
    </main>
  );
}