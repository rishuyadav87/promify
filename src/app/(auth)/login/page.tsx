"use client";

import { useState } from "react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Separate from `error` -- this case needs a different UI (a resend
  // link, not just red text), so it's tracked as its own piece of state
  // rather than trying to detect it by string-matching error.message.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnconfirmedEmail(false);
    setResendState("idle");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // error.code is the stable identifier Supabase documents for this
      // case ('email_not_confirmed') -- error.message is human-readable
      // text meant for display, not for branching logic on, since its
      // exact wording isn't guaranteed to stay the same across versions.
      if (error.code === "email_not_confirmed") {
        setUnconfirmedEmail(true);
      } else {
        setError(error.message);
      }
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

  async function handleResendConfirmation() {
    setResendState("sending");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback/oauth-signin`,
      },
    });
    // Resend errors (rate limit, invalid email) aren't worth a separate
    // error state here -- falling back to "idle" just lets the person
    // press the button again, which is the same recovery either way.
    setResendState(error ? "idle" : "sent");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone px-4 py-16 sm:px-6">
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal/12 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full bg-brick/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/logo-icon.png"
            alt="Juncture"
            width={56}
            height={56}
            className="h-12 w-12 drop-shadow-[0_0_10px_rgba(56,185,172,0.45)]"
          />
          <span className="text-lg font-semibold tracking-tight text-ink">Juncture</span>
        </div>

        {/* Card */}
        <div
          className="flex flex-col gap-6 rounded-2xl p-7 sm:p-8"
          style={{
            background: "rgba(28,25,22,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(240,237,232,0.08)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,237,232,0.05)",
          }}
        >
          <div>
            <h1 className="font-display text-2xl text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-warmgray">Log in to your Juncture account</p>
          </div>

          {searchParams.get("reset") === "success" && (
            <p className="rounded-xl border border-teal/20 bg-teal-subtle/60 px-4 py-3 text-sm text-teal">
              Password updated — log in with your new password.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full gap-2"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(240,237,232,0.12))" }} />
            <span className="text-xs text-warmgray">or</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(240,237,232,0.12), transparent)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink/80">
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
                className="rounded-xl border border-ink/15 bg-surface/60 px-3.5 py-2.5 text-sm text-ink placeholder:text-warmgray focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink/80">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-teal hover:text-teal-hover transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-error/20 bg-error/10 px-3 py-2.5 text-sm text-error">
                {error}
              </p>
            )}

            {unconfirmedEmail && (
              <div className="rounded-xl border border-brick/20 bg-brick-subtle/60 px-4 py-3 text-sm text-ink">
                <p>
                  That email hasn&apos;t been confirmed yet. Check your inbox
                  for the confirmation link, or:
                </p>
                {resendState === "sent" ? (
                  <p className="mt-2 font-medium text-teal">
                    Confirmation email sent — check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendState === "sending"}
                    className="mt-2 font-medium text-teal hover:text-teal-hover transition-colors hover:underline disabled:opacity-50"
                  >
                    {resendState === "sending"
                      ? "Sending…"
                      : "Resend confirmation email"}
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-1 w-full py-2.5"
            >
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-warmgray">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-teal hover:text-teal-hover transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}