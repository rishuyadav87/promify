import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone">
      {/* ── Ambient background orbs ───────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-teal/10 blur-[120px] opacity-40 dark:opacity-60" />
        <div className="absolute top-1/3 -right-48 h-[500px] w-[500px] rounded-full bg-brick/10 blur-[120px] opacity-30 dark:opacity-50" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-teal/8 blur-[100px] opacity-30 dark:opacity-40" />
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <span className="flex items-center gap-2.5">
          <Image
            src="/logo-icon.png"
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 drop-shadow-[0_0_8px_rgba(56,185,172,0.4)]"
          />
          <span className="text-xl font-semibold tracking-tight text-ink">
            Juncture
          </span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Button href="/dashboard" variant="primary">
              Dashboard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="outline">
                Log in
              </Button>
              <Button href="/signup" variant="primary">
                Get started
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* ── Hero: Two Sides ──────────────────────────────────────── */}
        <section className="mt-4 grid overflow-hidden rounded-3xl sm:grid-cols-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Creator side */}
          <div
            className="relative flex flex-col justify-between gap-8 overflow-hidden p-8 sm:p-12"
            style={{
              background:
                "linear-gradient(145deg, #0d3834 0%, #164e48 40%, #1d615a 100%)",
            }}
          >
            {/* Corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal/25 blur-[60px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/40 bg-teal-950/50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-200">
                For Creators
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                Name your price.
                <br />
                <span className="text-teal-300">Get booked</span>
                <br />
                on your terms.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-50/90 sm:text-base font-normal">
                List your Instagram or YouTube, get an automatic price
                band from your following, and negotiate every offer
                before you agree to anything.
              </p>
            </div>

            <div className="relative">
              <Button
                href="/signup?role=creator"
                variant="primary"
                className="w-full justify-center py-3 text-base sm:w-auto sm:px-8 shadow-glow-teal"
              >
                Join as a creator
              </Button>
            </div>
          </div>

          {/* Brand side */}
          <div
            className="relative flex flex-col justify-between gap-8 overflow-hidden p-8 sm:p-12"
            style={{
              background:
                "linear-gradient(145deg, #3d170a 0%, #52210e 40%, #692c15 100%)",
            }}
          >
            {/* Corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brick/25 blur-[60px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/40 bg-orange-950/50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-200">
                For Brands
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                Book the right creator.
                <br />
                <span className="text-orange-300">Know exactly</span>
                <br />
                what you're getting.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-orange-50/90 sm:text-base font-normal">
                Browse verified creators, send a clear brief with your
                offer, and track every campaign from booking through to
                delivery.
              </p>
            </div>

            <div className="relative">
              <Button
                href="/signup?role=brand"
                variant="secondary"
                className="w-full justify-center py-3 text-base sm:w-auto sm:px-8 shadow-glow-brick"
              >
                Join as a brand
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-warmgray">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-teal hover:underline underline-offset-4 transition-colors"
          >
            Log in
          </a>
        </p>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="divider-gradient mb-16" />
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-teal">
              How it works
            </span>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              Simple from start to finish
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-500/40 dark:bg-[#0A2A27] dark:text-[#4EE5D5]">
                  For creators
                </span>
              </div>
              <ol className="flex flex-col gap-7">
                <Step
                  number="01"
                  title="List your platforms"
                  text="Add your Instagram or YouTube handle, follower count, and niche. Each platform you're on gets its own listing, so a creator active on both shows up separately for each."
                  accent="teal"
                />
                <Step
                  number="02"
                  title="Get a price band automatically"
                  text="Your price range is calculated from your follower count and platform — from ₹500–₹2,000 for nano creators up to ₹15,000–₹50,000 for accounts over 100K followers."
                  accent="teal"
                />
                <Step
                  number="03"
                  title="Review campaign offers"
                  text="Brands book you with a content brief and their offer. Accept it, decline it, or counter with a different number — either side can keep countering until you land on a price."
                  accent="teal"
                />
                <Step
                  number="04"
                  title="Submit your content"
                  text="Once a price is accepted, submit the link to your posted content. The brand then has a review window to confirm it's good."
                  accent="teal"
                />
                <Step
                  number="05"
                  title="Get confirmed or resolve an issue"
                  text="The brand can confirm they're happy right away, or the campaign completes automatically once the review window passes."
                  accent="teal"
                />
              </ol>
            </div>

            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-800 dark:border-orange-500/40 dark:bg-[#34160C] dark:text-[#FF8566]">
                  For brands
                </span>
              </div>
              <ol className="flex flex-col gap-7">
                <Step
                  number="01"
                  title="Browse verified creators"
                  text="Filter by platform, tier, and niche. YouTube creators can connect their account for a real, API-verified subscriber count instead of a self-reported one."
                  accent="brick"
                />
                <Step
                  number="02"
                  title="Book with a clear brief"
                  text="Tell the creator exactly what you need — content type, key messaging, deadlines, usage rights — alongside your offer."
                  accent="brick"
                />
                <Step
                  number="03"
                  title="Negotiate to a number you both agree on"
                  text="Either side can counter until you settle on a final price. Nothing is locked in until it's actually accepted by both parties."
                  accent="brick"
                />
                <Step
                  number="04"
                  title="Review the delivered content"
                  text="Once the creator submits their post, you get a review window to check it against your brief before the campaign completes."
                  accent="brick"
                />
                <Step
                  number="05"
                  title="Confirm or raise an issue"
                  text="Happy with it? Confirm and the campaign completes. Something off? Report the issue — the campaign pauses for review."
                  accent="brick"
                />
              </ol>
            </div>
          </div>
        </section>

        {/* ── Pricing tiers ─────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="divider-gradient mb-16" />
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Pricing
            </span>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              How pricing works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-warmgray">
              Every creator's price band is calculated automatically from
              their follower count and platform — nobody has to guess what to
              charge or offer.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <PriceTierCard label="Nano" range="1,000–9,999 followers" price="₹500–₹2,000" accent="teal" />
            <PriceTierCard label="Micro" range="10,000–99,999 followers" price="₹2,000–₹15,000" accent="gold" />
            <PriceTierCard label="Mid-tier" range="100,000–499,999 followers" price="₹15,000–₹50,000" accent="brick" />
          </div>
          <p className="mt-6 text-center text-xs text-warmgray leading-relaxed max-w-3xl mx-auto">
            Below 1,000 followers, a creator isn't yet eligible for a
            listing. Above 500,000, pricing is handled case-by-case.
            YouTube creators with monetization enabled get a higher band than the
            same follower count on Instagram.
          </p>
        </section>

        {/* ── Dispute flow ──────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="divider-gradient mb-16" />
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-[#0f1a18] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-teal/10 blur-[80px]"
            />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">
                Dispute protection
              </span>
              <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                What happens if something goes wrong
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-warmgray">
                Either the brand or the creator can report an issue on an
                active campaign — a mismatched brief, a post that came down
                early, or anything else that doesn't match what was agreed.
                Reporting an issue pauses the campaign immediately and puts it
                in front of an admin for review, and the creator can submit
                corrected content to move things forward while it's being
                looked at.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto max-w-6xl border-t border-slate-200/80 dark:border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-warmgray">
            <Image src="/logo-icon.png" alt="" width={20} height={20} className="h-5 w-5 opacity-70" />
            Juncture
          </span>
          <a
            href="/privacy"
            className="text-sm text-warmgray hover:text-ink transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}

function PriceTierCard({
  label,
  range,
  price,
  accent,
}: {
  label: string;
  range: string;
  price: string;
  accent: "teal" | "brick" | "gold";
}) {
  const accentStyles = {
    teal: {
      wrapper:
        "border-teal-200 bg-teal-50/60 dark:border-teal-500/30 dark:bg-[#0a2a27]/80 dark:shadow-[0_0_24px_rgba(56,185,172,0.15)]",
      labelColor: "text-teal-800 dark:text-[#4EE5D5]",
    },
    brick: {
      wrapper:
        "border-orange-200 bg-orange-50/60 dark:border-orange-500/30 dark:bg-[#2a1008]/80 dark:shadow-[0_0_24px_rgba(220,85,45,0.15)]",
      labelColor: "text-orange-800 dark:text-[#FF8566]",
    },
    gold: {
      wrapper:
        "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-[#1a1505]/80 dark:shadow-[0_0_24px_rgba(201,151,58,0.15)]",
      labelColor: "text-amber-800 dark:text-[#FFD166]",
    },
  };

  const s = accentStyles[accent];

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${s.wrapper}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${s.labelColor}`}>
        {label}
      </p>
      <p className="mt-3 font-display text-2xl font-bold text-ink">
        {price}
      </p>
      <p className="mt-2 text-xs text-warmgray font-medium">{range}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
  accent,
}: {
  number: string;
  title: string;
  text: string;
  accent: "teal" | "brick";
}) {
  const numberColor =
    accent === "teal"
      ? "text-teal-700 dark:text-[#38B9AC]"
      : "text-orange-700 dark:text-[#FF8566]";

  return (
    <li className="flex gap-4 group">
      <span
        className={`mt-0.5 w-7 shrink-0 font-mono text-base font-bold tabular-nums ${numberColor}`}
      >
        {number}
      </span>
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-warmgray font-normal">{text}</p>
      </div>
    </li>
  );
}