import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Megaphone } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { autoCompleteExpiredCampaigns } from "@/lib/campaignLifecycle";
import { statusBadgeVariant } from "@/lib/campaignStatus";
import { PlatformIcon } from "@/components/icons/PlatformIcon";

export default async function CreatorDashboardPage() {
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

  const { data: creatorRows } = await supabase
    .from("creators")
    .select("display_name, platform, handle, follower_count, tier, niche")
    .eq("user_id", user.id)
    .order("follower_count", { ascending: false });

  const creator = creatorRows?.[0] ?? null;

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
      {/* ── Profile card ─────────────────────────────────────────── */}
      <Card
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(10,42,39,0.6) 0%, rgba(14,12,11,0.8) 100%)",
          border: "1px solid rgba(56,185,172,0.15)",
        } as React.CSSProperties}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal/15 blur-[50px]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl text-ink">
                {userRow?.username
                  ? `@${userRow.username}`
                  : (creator?.display_name ?? "Your profile")}
              </h2>
              {creator?.tier && (
                <Badge variant={creator.tier === "tier1" ? "brick" : "teal"}>
                  {creator.tier === "tier1" ? "Tier 1" : "Tier 2"}
                </Badge>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-sm text-warmgray">
              {creator && (
                <PlatformIcon platform={creator.platform} className="h-3.5 w-3.5" />
              )}
              {creator?.platform === "youtube" ? "YouTube" : "Instagram"} · @
              {creator?.handle ?? "not set"}
            </p>

            {creator?.niche && (
              <p className="text-sm text-warmgray">{creator.niche}</p>
            )}

            <Button
              href="/dashboard/creator/profile"
              variant="outline"
              className="mt-1 self-start text-xs px-3 py-1.5"
            >
              Edit profile
            </Button>
          </div>

          <div className="sm:text-right">
            <p className="font-mono text-3xl font-semibold text-gradient-teal">
              {(creator?.follower_count ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-warmgray">
              Followers
            </p>
          </div>
        </div>
      </Card>

      {/* ── Campaigns header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Your campaigns</h1>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!error && campaigns?.length === 0 && (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brick/25 bg-brick-subtle/60">
            <Megaphone className="h-6 w-6 text-brick" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">No campaigns yet</h3>
            <p className="mt-1 max-w-sm text-sm text-warmgray">
              Brands will reach out here once they invite you to a promotion.
            </p>
          </div>
        </Card>
      )}

      {/* ── Campaign list ───────────────────────────────────────── */}
      <ul className="flex flex-col gap-2.5">
        {liveCampaigns?.map((c) => (
          <li key={c.id}>
            <Link
              href={`/dashboard/creator/campaigns/${c.id}`}
              className="group flex items-center justify-between rounded-2xl border border-ink/[0.07] bg-surface/60 px-5 py-4 backdrop-blur-sm transition-all hover:border-teal/20 hover:bg-surface/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <Badge variant={statusBadgeVariant(c.status)}>
                {c.status.replace("_", " ")}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono font-semibold text-ink">
                  ₹{c.price.toLocaleString("en-IN")}
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
        ))}
      </ul>
    </div>
  );
}