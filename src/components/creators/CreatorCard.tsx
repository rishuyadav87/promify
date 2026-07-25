import Link from "next/link";
import { Camera, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type CreatorProfile = {
  id: string;
  display_name: string;
  platform: "instagram" | "youtube";
  handle: string;
  follower_count: number;
  tier: "tier1" | "tier2" | null;
  niche: string | null;
};

export function CreatorCard({ creator }: { creator: CreatorProfile }) {
  const PlatformIcon = creator.platform === "youtube" ? Play : Camera;

  return (
    <Link href={`/dashboard/brand/browse/${creator.id}`} className="block">
      <Card className="flex h-full flex-col gap-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            {creator.display_name}
          </h3>
          {creator.tier && (
            <Badge variant={creator.tier === "tier1" ? "brick" : "teal"}>
              {creator.tier === "tier1" ? "Tier 1" : "Tier 2"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-warmgray">
          <PlatformIcon className="h-4 w-4" />
          <span>@{creator.handle}</span>
        </div>

        {creator.niche && (
          <p className="text-sm text-warmgray">{creator.niche}</p>
        )}

        <div className="mt-auto pt-2">
          <p className="text-lg font-semibold text-ink">
            {creator.follower_count.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide text-warmgray">
            Followers
          </p>
        </div>
      </Card>
    </Link>
  );
}
