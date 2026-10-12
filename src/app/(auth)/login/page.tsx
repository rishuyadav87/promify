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
      if (error.code === "email_not_confirmed") {
        setUnconfirmedEmail(true);
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

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
    setResendState(error ? "idle" : "sent");
  }

  async function handleGoogleSignIn() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
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
          className="flex flex-col gap-6 rounded-2xl p-7 sm:p-8 border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-surface/75 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div>
            <h1 className="font-display text-2xl text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-warmgray">Log in to your Juncture account</p>
          </div>

          {searchParams.get("reset") === "success" && (
            <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal/20 dark:bg-teal-subtle/60 dark:text-teal">
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
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-xs text-warmgray">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
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
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 dark:border-ink/15 dark:bg-surface/60 dark:text-ink dark:placeholder:text-warmgray transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink">
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