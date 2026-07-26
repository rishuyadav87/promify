import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Megaphone } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { autoCompleteExpiredCampaigns } from "@/lib/campaignLifecycle";
import { statusBadgeVariant } from "@/lib/campaignStatus";
export default async function CreatorDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name, platform, handle, follower_count, tier, niche")
    .eq("user_id", user.id)
    .single();
  // No need to filter by user_id in the query — the RLS policy on
  // `campaigns` already restricts rows to this creator's own campaigns.
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      "id, status, price, post_url, measurement_window_ends_at, created_at",
    )
    .order("created_at", { ascending: false });
  const liveCampaigns = campaigns
    ? await autoCompleteExpiredCampaigns(supabase, campaigns)
    : campaigns;

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-ink">
              {creator?.display_name ?? "Your profile"}
            </h2>
            {creator?.tier && (
              <Badge variant={creator.tier === "tier1" ? "brick" : "teal"}>
                {creator.tier === "tier1" ? "Tier 1" : "Tier 2"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-warmgray">
            {creator?.platform === "youtube" ? "YouTube" : "Instagram"} · @
            {creator?.handle ?? "not set"}
          </p>
          {creator?.niche && (
            <p className="text-sm text-warmgray">{creator.niche}</p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold text-ink">
            {(creator?.follower_count ?? 0).toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide text-warmgray">
            Followers
          </p>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button href="/dashboard/creator/profile" variant="outline">
          Edit profile
        </Button>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Your campaigns
      </h1>
      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {!error && campaigns?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brick-subtle">
            <Megaphone className="h-6 w-6 text-brick" />
          </div>
          <h3 className="text-base font-medium text-ink">No campaigns yet</h3>
          <p className="max-w-sm text-sm text-warmgray">
            Brands will reach out here once they invite you to a promotion.
          </p>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {liveCampaigns?.map((c) => (
          <li key={c.id}>
            <Link
              href={`/dashboard/creator/campaigns/${c.id}`}
              className="flex flex-col gap-1 rounded-md border border-ink/10 bg-white/70 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <Badge variant={statusBadgeVariant(c.status)}>
                {c.status.replace("_", " ")}
              </Badge>
              <span className="text-sm text-warmgray">₹{c.price}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
