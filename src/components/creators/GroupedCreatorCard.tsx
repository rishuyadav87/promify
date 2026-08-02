import Link from "next/link";
import { Camera, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CreatorProfile } from "@/components/creators/CreatorCard";

export function GroupedCreatorCard({
  platforms,
}: {
  platforms: CreatorProfile[];
}) {
  const primary = platforms[0];

  return (
    <Card className="flex h-full flex-col gap-3">
      <h3 className="text-base font-semibold text-ink">
        {primary.display_name}
      </h3>
      <ul className="flex flex-col gap-2">
        {platforms.map((p) => {
          const PlatformIcon = p.platform === "youtube" ? Play : Camera;
          return (
            <li key={p.id}>
              <Link
                href={`/dashboard/brand/browse/${p.id}`}
                className="block rounded-md border border-ink/10 p-3 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-ink">
                    <PlatformIcon className="h-4 w-4 text-warmgray" />
                    <span>@{p.handle}</span>
                  </div>
                  {p.tier && (
                    <Badge variant={p.tier === "tier1" ? "brick" : "teal"}>
                      {p.tier === "tier1" ? "Tier 1" : "Tier 2"}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-warmgray">
                  <span>{p.niche ?? "no niche set"}</span>
                  <span>
                    {p.follower_count.toLocaleString("en-IN")} followers
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
