"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Image from "next/image";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error_description");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Clicking the emailed link makes supabase-js process the URL and
    // establish a temporary "recovery" session automatically -- this
    // waits for that event before showing the form, so it doesn't flash
    // before the recovery session actually exists.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login?reset=success");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone px-4 py-16 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal/12 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full bg-brick/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
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
          {!ready ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              {linkError ? (
                <>
                  <h1 className="font-display text-xl text-ink">
                    This link has expired
                  </h1>
                  <p className="text-sm text-warmgray">
                    Password reset links only work for a short time. Request a new one below.
                  </p>
                  <a
                    href="/forgot-password"
                    className="mt-2 text-sm font-medium text-teal hover:text-teal-hover transition-colors"
                  >
                    Send a new reset link
                  </a>
                </>
              ) : (
                <p className="text-sm text-warmgray">
                  Verifying your reset link…
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <h1 className="font-display text-2xl text-ink">
                  Set a new password
                </h1>
                <p className="mt-1 text-sm text-warmgray">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-ink/80"
                  >
                    New password
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

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-ink/80"
                  >
                    Confirm new password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? "Saving…" : "Save new password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}