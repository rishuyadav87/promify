"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import Image from "next/image";
type Role = "creator" | "brand";

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
  const [role, setRole] = useState<Role>(
    searchParams.get("role") === "brand" ? "brand" : "creator",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        redirectTo: `${window.location.origin}/auth/callback/oauth-signin?role=${role}`,
      },
    });
  }

  if (checkEmail) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone px-4 py-16 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal/12 blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Image src="/logo-icon.png" alt="Juncture" width={56} height={56} className="h-12 w-12 drop-shadow-[0_0_10px_rgba(56,185,172,0.45)]" />
          </div>
          <div
            className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-surface/75 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-200 bg-teal-50 dark:border-teal/25 dark:bg-teal-subtle/60">
              <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h1 className="font-display text-xl text-ink">Check your email</h1>
            <p className="text-sm text-warmgray">
              We sent a confirmation link to{" "}
              <span className="font-medium text-ink">{email}</span>.
            </p>
            {resendState === "sent" ? (
              <p className="text-sm font-medium text-teal">
                Sent again — check your inbox.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendState === "sending"}
                className="text-sm font-medium text-teal hover:text-teal-hover transition-colors hover:underline disabled:opacity-50"
              >
                {resendState === "sending" ? "Sending…" : "Didn't get it? Resend"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
            <h1 className="font-display text-2xl text-ink">Create an account</h1>
            <p className="mt-1 text-sm text-warmgray">Join Juncture — free to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role picker */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">I am a…</span>
              <div className="grid grid-cols-2 gap-2">
                {(["creator", "brand"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                      role === r
                        ? r === "creator"
                          ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-brick/50 dark:bg-brick/20 dark:text-brick shadow-sm"
                          : "border-teal-500 bg-teal-50 text-teal-800 dark:border-teal/50 dark:bg-teal/20 dark:text-teal shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-ink/15 dark:bg-surface/50 dark:text-warmgray dark:hover:border-ink/30 dark:hover:text-ink"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full gap-2"
            >
              <GoogleIcon />
              Continue with Google as{" "}
              {role === "brand" ? "a brand" : "a creator"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs text-warmgray">or sign up with email</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
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
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 dark:border-ink/15 dark:bg-surface/60 dark:text-ink dark:placeholder:text-warmgray transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-error/20 bg-error/10 px-3 py-2.5 text-sm text-error">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-1 w-full py-2.5"
            >
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-warmgray">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-teal hover:text-teal-hover transition-colors"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}