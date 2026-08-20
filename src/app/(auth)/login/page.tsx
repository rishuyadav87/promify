"use client";

import { useState } from "react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // A hard navigation here (not router.push) is intentional. router.push
    // does a soft client-side transition, which can serve an already-cached
    // "logged out" version of /dashboard from before this sign-in, since
    // Next.js prefetches routes in the background. That caused the
    // "have to log in twice" symptom: first submit set the session cookie
    // correctly, but the dashboard's redirect check ran against stale
    // cached content and bounced back to /login; the second submit then
    // "worked" only because the cache had caught up by then.
    // window.location.href forces a full reload straight through
    // middleware.ts with the fresh cookie, avoiding the stale cache
    // entirely.
    window.location.href = "/dashboard";
  }
  async function handleGoogleSignIn() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // No ?role= param here -- this is the login page, an existing
        // user's role is already decided. That param only matters on the
        // signup page's Google button.
        redirectTo: `${window.location.origin}/auth/callback/oauth-signin`,
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Log in
        </h1>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full gap-2"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-warmgray">
          <div className="h-px flex-1 bg-ink/10" />
          or
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              required
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
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-warmgray">
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          className="font-medium text-ink underline underline-offset-2"
        >
          Sign up
        </a>
      </p>
    </main>
  );
}