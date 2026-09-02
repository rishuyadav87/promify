import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="text-sm text-warmgray">
          This page doesn't exist, or the link may be out of date.
        </p>
        <Button href="/" variant="primary" className="mt-2">
          Back to Juncture
        </Button>
      </Card>
    </main>
  );
}