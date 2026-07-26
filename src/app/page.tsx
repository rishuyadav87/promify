import { Button } from "@/components/ui/Button";
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
                text="Add your Instagram or YouTube handle, follower count, and niche."
              />
              <Step
                number="02"
                title="Review campaign offers"
                text="Brands propose a price and usage rights — you accept, decline, or negotiate."
              />
              <Step
                number="03"
                title="Get paid on schedule"
                text="Payouts release once the campaign's measurement window closes, TDS already deducted."
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
                title="Find the right creator"
                text="Browse by platform, tier, and niche to match your campaign."
              />
              <Step
                number="02"
                title="Set the terms upfront"
                text="Price, usage rights, and approval requirements are agreed before content goes live."
              />
              <Step
                number="03"
                title="Track performance"
                text="Follow each campaign from live to measured, with dispute support if something's off."
              />
            </ol>
          </div>
        </section>
      </main>
    </>
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
