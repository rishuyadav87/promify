import { notFound } from "next/navigation";
import { Camera, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPriceBand } from "@/lib/pricing";
import { BookCreatorButton } from "./BookCreatorButton";

export default async function CreatorDetailPage({
  params,
}: {
  params: { creatorId: string };
}) {
  const supabase = createClient();

  const { data: creator, error } = await supabase
    .from("public_creator_profiles")
    .select(
      "id, display_name, platform, handle, follower_count, tier, niche, youtube_monetized, custom_price",
    )
    .eq("id", params.creatorId)
    .single();

  if (error || !creator) notFound();

  const hasCustomPrice = creator.custom_price != null;
  const band = hasCustomPrice
    ? null
    : getPriceBand(
        creator.platform!,
        creator.follower_count!,
        creator.youtube_monetized!,
      );
  const priceDisplay = hasCustomPrice
    ? `₹${creator.custom_price!.toLocaleString()}`
    : band!.custom
      ? band!.label === "Not yet eligible"
        ? "—"
        : "Custom"
      : `₹${band!.low.toLocaleString()}–₹${band!.high.toLocaleString()}`;
  const priceLabel = hasCustomPrice
    ? "Creator's set price"
    : band!.custom
      ? band!.label
      : `${band!.label} price band`;
  const PlatformIcon = creator.platform === "youtube" ? Play : Camera;

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {creator.display_name}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-warmgray">
              <PlatformIcon className="h-4 w-4" />
              <span>@{creator.handle}</span>
            </div>
          </div>
          {creator.tier && (
            <Badge variant={creator.tier === "tier1" ? "brick" : "teal"}>
              {creator.tier === "tier1" ? "Tier 1" : "Tier 2"}
            </Badge>
          )}
        </div>

        {creator.niche && (
          <p className="text-sm text-warmgray">{creator.niche}</p>
        )}

        <div className="grid grid-cols-2 gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xl font-semibold text-ink">
              {creator.follower_count.toLocaleString()!}
            </p>
            <p className="text-xs uppercase tracking-wide text-warmgray">
              Followers
            </p>
          </div>
          {creator.platform === "youtube" && (
            <div>
              <p className="text-xl font-semibold text-ink">
                {creator.youtube_monetized ? "Yes" : "No"}
              </p>
              <p className="text-xs uppercase tracking-wide text-warmgray">
                Monetized
              </p>
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-ink">{priceDisplay}</p>
            <p className="text-xs uppercase tracking-wide text-warmgray">
              {priceLabel}
            </p>
          </div>
        </div>
      </Card>

      {hasCustomPrice || !band!.custom ? (
        <BookCreatorButton
          creatorId={creator.id!}
          displayName={creator.display_name!}
          platform={creator.platform!}
          handle={creator.handle!}
          price={
            hasCustomPrice
              ? creator.custom_price!
              : Math.round((band!.low + band!.high) / 2)
          }
          low={hasCustomPrice ? creator.custom_price! : band!.low}
          high={hasCustomPrice ? creator.custom_price! : band!.high}
        />
      ) : (
        <Card>
          <p className="text-sm text-warmgray">
            {band!.label === "Macro"
              ? "This creator's reach is priced individually — contact us to arrange custom pricing."
              : "This creator hasn't reached the marketplace's minimum eligibility yet."}
          </p>
        </Card>
      )}
    </div>
  );
}
