"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
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
            className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
            style={{
              background: "rgba(28,25,22,0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(240,237,232,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,237,232,0.05)",
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal/25 bg-teal-subtle/60">
              <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-display text-xl text-ink">Check your email</h1>
            <p className="text-sm text-warmgray">
              If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a link to reset your password.
            </p>
            <a
              href="/login"
              className="mt-2 text-sm font-medium text-teal hover:text-teal-hover transition-colors"
            >
              Back to log in
            </a>
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
            <h1 className="font-display text-2xl text-ink">Reset password</h1>
            <p className="mt-1 text-sm text-warmgray">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>
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
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-warmgray">
          <a
            href="/login"
            className="font-medium text-teal hover:text-teal-hover transition-colors"
          >
            ← Back to log in
          </a>
        </p>
      </div>
    </div>
  );
}