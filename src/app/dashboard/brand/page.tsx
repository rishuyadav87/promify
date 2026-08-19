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
      {searchParams.booked && (
        <Card className="border-teal/30 bg-teal-subtle">
          <p className="text-sm font-medium text-teal">
            Booking sent! The creator will be notified to accept or decline.
          </p>
        </Card>
      )}
      <Card className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-ink">
            {brand?.company_name ?? "Your company"}
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
          className="self-start text-xs"
        >
          Edit profile
        </Button>
      </Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Your campaigns
        </h1>
        <Button href="/dashboard/brand/browse" variant="primary">
          Browse creators
        </Button>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      {!error && campaigns?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-subtle">
            <Megaphone className="h-6 w-6 text-teal" />
          </div>
          <h3 className="text-base font-medium text-ink">No campaigns yet</h3>
          <p className="max-w-sm text-sm text-warmgray">
            Browse creators to start your first promotion.
          </p>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
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
                className="flex flex-col gap-1 rounded-md border border-ink/10 bg-surface p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <Badge variant={statusBadgeVariant(c.status)}>
                  {c.status.replace("_", " ")}
                </Badge>
                <span className="text-sm text-warmgray">
                  {showingNegotiatedOffer ? (
                    <>
                      Latest offer: ₹{latestOffer.toLocaleString("en-IN")}
                    </>
                  ) : (
                    <>₹{c.price.toLocaleString("en-IN")}</>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}