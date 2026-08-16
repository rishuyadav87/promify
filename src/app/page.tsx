import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <span className="text-lg font-semibold tracking-tight text-ink">
          Creo
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
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="rounded-full bg-teal-subtle px-3 py-1 text-xs font-medium uppercase tracking-wide text-teal">
            For creators & brands
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Where creators and brands agree on the deal — and both sides get
            paid on time.
          </h1>
          <p className="max-w-xl text-base text-warmgray sm:text-lg">
            Set your price, agree on usage rights, and track every campaign from
            pitch to payout — with TDS handled automatically.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/signup"
              variant="primary"
              className="px-8 py-3 text-base"
            >
              Get started
            </Button>
            <Button
              href="/login"
              variant="outline"
              className="px-8 py-3 text-base"
            >
              Log in
            </Button>
          </div>
        </section>

        <section className="grid gap-10 border-t border-ink/10 py-16 sm:py-20 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-brick">
              For creators
            </h2>
            <ol className="mt-6 flex flex-col gap-6">
              <Step
                number="01"
                title="List your platforms"
                text="Add your Instagram or YouTube handle, follower count, and niche. Each platform you're on gets its own listing, so a creator active on both shows up separately for each."
              />
              <Step
                number="02"
                title="Get a price band automatically"
                text="Your price range is calculated from your follower count and platform — from ₹500–₹2,000 for nano creators up to ₹15,000–₹50,000 for accounts over 100K followers. YouTube creators with monetization on get a higher band than the same follower count on Instagram."
              />
              <Step
                number="03"
                title="Review campaign offers"
                text="Brands book you with a content brief and either your suggested price or their own opening offer. Accept it, decline it, or counter with a different number — either side can keep countering until you land on a price."
              />
              <Step
                number="04"
                title="Submit your content"
                text="Once a price is accepted, submit the link to your posted content. The brand then has a review window to confirm it's good."
              />
              <Step
                number="05"
                title="Get confirmed or resolve an issue"
                text="The brand can confirm they're happy right away, or the campaign completes automatically once the review window passes. If either side flags a problem, the campaign pauses and you can fix and resubmit your content."
              />
            </ol>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-teal">
              For brands
            </h2>
            <ol className="mt-6 flex flex-col gap-6">
              <Step
                number="01"
                title="Browse verified creators"
                text="Filter by platform, tier, and niche. YouTube creators can connect their account for a real, API-verified subscriber count instead of a self-reported one."
              />
              <Step
                number="02"
                title="Book with a clear brief"
                text="Tell the creator exactly what you need — content type, key messaging, deadlines, usage rights — alongside your offer. Use their suggested price or propose your own to start the negotiation."
              />
              <Step
                number="03"
                title="Negotiate to a number you both agree on"
                text="Either side can counter until you settle on a final price. Nothing is locked in until it's actually accepted by both parties."
              />
              <Step
                number="04"
                title="Review the delivered content"
                text="Once the creator submits their post, you get a review window to check it against your brief before the campaign completes."
              />
              <Step
                number="05"
                title="Confirm or raise an issue"
                text="Happy with it? Confirm and the campaign completes. Something off? Report the issue with a reason — the campaign pauses for review and the creator can submit a correction."
              />
            </ol>
          </div>
        </section>

        <section className="border-t border-ink/10 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            How pricing works
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-warmgray">
            Every creator's price band is calculated automatically from
            their follower count and platform — nobody has to guess what to
            charge or offer.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PriceTierCard
              label="Nano"
              range="1,000–9,999 followers"
              price="₹500–₹2,000"
            />
            <PriceTierCard
              label="Micro"
              range="10,000–99,999 followers"
              price="₹2,000–₹15,000"
            />
            <PriceTierCard
              label="Mid-tier"
              range="100,000–499,999 followers"
              price="₹15,000–₹50,000"
            />
          </div>
          <p className="mt-4 text-xs text-warmgray">
            Below 1,000 followers, a creator isn't yet eligible for a
            listing. Above 500,000, pricing is handled case-by-case rather
            than by a fixed band. YouTube creators with monetization
            enabled get a higher band than the same follower count would
            get on Instagram, since a monetized channel is a stronger
            signal of real audience reach.
          </p>
        </section>

        <section className="border-t border-ink/10 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            What happens if something goes wrong
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-warmgray">
            Either the brand or the creator can report an issue on an
            active campaign — a mismatched brief, a post that came down
            early, or anything else that doesn't match what was agreed.
            Reporting an issue pauses the campaign immediately and puts it
            in front of an admin for review, and the creator can submit
            corrected content to move things forward while it's being
            looked at.
          </p>
        </section>

      </main>

      <footer className="mx-auto max-w-6xl border-t border-ink/10 px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-warmgray">
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-ink"
          >
            Privacy Policy
          </a>
        </p>
      </footer>
    </>
  );
}

function PriceTierCard({
  label,
  range,
  price,
}: {
  label: string;
  range: string;
  price: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-warmgray">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-ink">{price}</p>
      <p className="mt-1 text-xs text-warmgray">{range}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="text-sm font-medium text-warmgray">{number}</span>
      <div>
        <h3 className="font-medium text-ink">{title}</h3>
        <p className="mt-1 text-sm text-warmgray">{text}</p>
      </div>
    </li>
  );
}