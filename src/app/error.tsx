"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sends this to the same Sentry project set up earlier, so a broken
    // page in production shows up in your inbox instead of just being
    // whatever a user happened to notice and not mention.
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Something went wrong
        </h1>
        <p className="text-sm text-warmgray">
          This has been reported and we'll take a look. Try again, or head
          back to the dashboard.
        </p>
        <div className="mt-2 flex gap-2">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button href="/dashboard" variant="outline">
            Dashboard
          </Button>
        </div>
      </Card>
    </main>
  );
}