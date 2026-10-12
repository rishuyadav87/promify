import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-stone">
      {/* Subtle ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-64 -left-64 h-[700px] w-[700px] rounded-full bg-teal/8 blur-[160px]" />
        <div className="absolute top-1/2 -right-64 h-[500px] w-[500px] rounded-full bg-brick/6 blur-[140px]" />
      </div>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b border-ink/[0.07]"
        style={{
          background: "rgba(14,12,11,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-icon.png"
              alt=""
              width={44}
              height={44}
              className="h-9 w-9 drop-shadow-[0_0_6px_rgba(56,185,172,0.35)]"
            />
            <span className="text-lg font-semibold tracking-tight text-ink">
              Juncture
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="outline" className="text-xs px-4 py-2">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}