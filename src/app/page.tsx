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
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-teal/10 blur-[120px] opacity-60" />
        <div className="absolute top-1/3 -right-48 h-[500px] w-[500px] rounded-full bg-brick/10 blur-[120px] opacity-50" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-teal/8 blur-[100px] opacity-40" />
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
        {/*
          The signature moment: the hero is the "Two Sides" concept made
          literal rather than decorative. Two panels, brick and teal,
          meet at a center seam — creators on one side, brands on the
          other, each with their own headline and entry point.
        */}
        <section className="mt-4 grid overflow-hidden rounded-3xl sm:grid-cols-2">
          {/* Creator side */}
          <div
            className="relative flex flex-col justify-between gap-8 overflow-hidden p-8 sm:p-12"
            style={{
              background:
                "linear-gradient(145deg, #0a2a27 0%, #0e3a35 40%, #163d38 100%)",
            }}
          >
            {/* Grain / texture overlay */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
                backgroundSize: "150px 150px",
              }}
            />
            {/* Corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal/25 blur-[60px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
                For Creators
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
                Name your price.
                <br />
                <span className="text-gradient-teal">Get booked</span>
                <br />
                on your terms.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 sm:text-base">
                List your Instagram or YouTube, get an automatic price
                band from your following, and negotiate every offer
                before you agree to anything.
              </p>
            </div>

            <div className="relative">
              <Button
                href="/signup?role=creator"
                variant="primary"
                className="w-full justify-center py-3 text-base sm:w-auto sm:px-8"
              >
                Join as a creator
              </Button>
            </div>
          </div>

          {/* Divider line */}
          <div
            aria-hidden
            className="hidden sm:block absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-ink/20 to-transparent z-10"
          />

          {/* Brand side */}
          <div
            className="relative flex flex-col justify-between gap-8 overflow-hidden p-8 sm:p-12"
            style={{
              background:
                "linear-gradient(145deg, #2a1008 0%, #3d1a0a 40%, #4a2010 100%)",
            }}
          >
            {/* Grain / texture overlay */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
                backgroundSize: "150px 150px",
              }}
            />
            {/* Corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brick/25 blur-[60px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brick/30 bg-brick/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brick">
                For Brands
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
                Book the right creator.
                <br />
                <span className="text-gradient-brick">Know exactly</span>
                <br />
                what you're getting.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 sm:text-base">
                Browse verified creators, send a clear brief with your
                offer, and track every campaign from booking through to
                delivery.
              </p>
            </div>

            <div className="relative">
              <Button
                href="/signup?role=brand"
                variant="secondary"
                className="w-full justify-center py-3 text-base sm:w-auto sm:px-8"
              >
                Join as a brand
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-sm text-warmgray">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-teal hover:text-teal-hover transition-colors"
          >
            Log in
          </a>
        </p>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="divider-gradient mb-16" />
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-warmgray">
              How it works
            </span>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              Simple from start to finish
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
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
                <span className="rounded-full border border-brick/30 bg-brick/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brick">
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
            <span className="text-xs font-semibold uppercase tracking-widest text-warmgray">
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
          <p className="mt-5 text-center text-xs text-warmgray">
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
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{
              background: "linear-gradient(135deg, #0f1a18 0%, #141210 100%)",
              border: "1px solid rgba(240,237,232,0.07)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-teal/10 blur-[80px]"
            />
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-widest text-warmgray">
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
      <footer className="relative z-10 mx-auto max-w-6xl border-t border-ink/8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-warmgray">
            <Image src="/logo-icon.png" alt="" width={20} height={20} className="h-5 w-5 opacity-60" />
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
      wrapper: "border-teal/20",
      bg: "linear-gradient(145deg, #0a2a27 0%, #0f3035 100%)",
      labelColor: "text-teal",
      priceColor: "text-gradient-teal",
      glow: "0 0 24px rgba(56,185,172,0.12)",
    },
    brick: {
      wrapper: "border-brick/20",
      bg: "linear-gradient(145deg, #2a1008 0%, #351508 100%)",
      labelColor: "text-brick",
      priceColor: "text-gradient-brick",
      glow: "0 0 24px rgba(220,85,45,0.12)",
    },
    gold: {
      wrapper: "border-yellow-600/20",
      bg: "linear-gradient(145deg, #1a1505 0%, #221a06 100%)",
      labelColor: "text-yellow-400",
      priceColor: "text-gradient-gold",
      glow: "0 0 24px rgba(201,151,58,0.12)",
    },
  };

  const s = accentStyles[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 ${s.wrapper}`}
      style={{ background: s.bg, boxShadow: s.glow }}
    >
      <p className={`text-xs font-bold uppercase tracking-widest ${s.labelColor}`}>
        {label}
      </p>
      <p className={`mt-3 font-display text-2xl font-semibold ${s.priceColor}`}>
        {price}
      </p>
      <p className="mt-2 text-xs text-warmgray">{range}</p>
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
  const numberColor = accent === "teal" ? "text-teal" : "text-brick";
  return (
    <li className="flex gap-4 group">
      <span
        className={`mt-0.5 w-7 shrink-0 font-mono text-sm font-semibold tabular-nums ${numberColor} opacity-70 group-hover:opacity-100 transition-opacity`}
      >
        {number}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-warmgray">{text}</p>
      </div>
    </li>
  );
}