import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Megaphone } from "lucide-react";
import { redirect } from "next/navigation";
import { autoCompleteExpiredCampaigns } from "@/lib/campaignLifecycle";
import { statusBadgeVariant } from "@/lib/campaignStatus";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function BrandDashboardPage({
  searchParams,
}: {
  searchParams: { booked?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: brand } = await supabase
    .from("brands")
    .select("company_name, created_at")
    .eq("user_id", user.id)
    .single();

  // RLS on `campaigns` restricts rows to campaigns owned by this brand.
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      "id, status, price, post_url, measurement_window_ends_at, created_at",
    )
    .order("created_at", { ascending: false });

  const liveCampaigns = campaigns
    ? await autoCompleteExpiredCampaigns(supabase, campaigns)
    : campaigns;

  // campaigns.price only reflects a real accepted offer (enforced by a DB
  // trigger) -- while a campaign is still "pending" and under active
  // negotiation, that column stays frozen at the original booking price,
  // even after a counter-offer changes it. This list was showing that
  // stale number with no indication a newer offer existed. Fetching the
  // latest campaign_offers row per pending campaign fixes that.
  const pendingIds = (liveCampaigns ?? [])
    .filter((c) => c.status === "pending")
    .map((c) => c.id);

  const latestOfferByCampaign = new Map<string, number>();
  if (pendingIds.length > 0) {
    const { data: offers } = await supabase
      .from("campaign_offers")
      .select("campaign_id, amount, created_at")
      .in("campaign_id", pendingIds)
      .order("created_at", { ascending: false });
    for (const offer of offers ?? []) {
      // Offers come back newest-first, so the first one seen per
      // campaign_id is the latest -- skip any campaign already recorded.
      if (!latestOfferByCampaign.has(offer.campaign_id)) {
        latestOfferByCampaign.set(offer.campaign_id, offer.amount);
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Booked success banner ───────────────────────────────── */}
      {searchParams.booked && (
        <div className="rounded-2xl border border-teal/25 bg-teal-subtle/50 px-5 py-4">
          <p className="text-sm font-medium text-teal">
            ✓ Booking sent! The creator will be notified to accept or decline.
          </p>
        </div>
      )}

      {/* ── Profile card ─────────────────────────────────────────── */}
      <Card
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(42,16,8,0.6) 0%, rgba(14,12,11,0.8) 100%)",
          border: "1px solid rgba(220,85,45,0.15)",
        } as React.CSSProperties}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-brick/15 blur-[50px]"
        />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl text-ink">
              {userRow?.username
                ? `@${userRow.username}`
                : (brand?.company_name ?? "Your company")}
            </h2>
            <p className="text-sm text-warmgray">
              Member since{" "}
              {brand?.created_at
                ? new Date(brand.created_at).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <Button
            href="/dashboard/brand/profile"
            variant="outline"
            className="self-start text-xs px-3 py-1.5"
          >
            Edit profile
          </Button>
        </div>
      </Card>

      {/* ── Campaigns header ────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl text-ink">Your campaigns</h1>
        <Button href="/dashboard/brand/browse" variant="primary">
          Browse creators
        </Button>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!error && campaigns?.length === 0 && (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal/25 bg-teal-subtle/60">
            <Megaphone className="h-6 w-6 text-teal" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">No campaigns yet</h3>
            <p className="mt-1 max-w-sm text-sm text-warmgray">
              Browse creators to start your first promotion.
            </p>
          </div>
        </Card>
      )}

      {/* ── Campaign list ───────────────────────────────────────── */}
      <ul className="flex flex-col gap-2.5">
        {liveCampaigns?.map((c) => {
          const latestOffer = latestOfferByCampaign.get(c.id);
          const showingNegotiatedOffer =
            c.status === "pending" &&
            latestOffer !== undefined &&
            latestOffer !== c.price;
          return (
            <li key={c.id}>
              <Link
                href={`/dashboard/brand/campaigns/${c.id}`}
                className="group flex items-center justify-between rounded-2xl border border-ink/[0.07] bg-surface/60 px-5 py-4 backdrop-blur-sm transition-all hover:border-brick/20 hover:bg-surface/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                <Badge variant={statusBadgeVariant(c.status)}>
                  {c.status.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">
                    {showingNegotiatedOffer ? (
                      <>Latest offer: ₹{latestOffer.toLocaleString("en-IN")}</>
                    ) : (
                      <>₹{c.price.toLocaleString("en-IN")}</>
                    )}
                  </span>
                  <svg
                    className="h-4 w-4 text-warmgray opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}