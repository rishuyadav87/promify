import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import type { CreatorProfile } from "@/components/creators/CreatorCard";

export function GroupedCreatorCard({
  platforms,
}: {
  platforms: CreatorProfile[];
}) {
  const primary = platforms[0];

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-teal text-sm font-bold text-stone shadow-[0_0_12px_rgba(56,185,172,0.3)]">
          {primary.display_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-display text-base text-ink">
            {primary.display_name}
          </h3>
          {primary.niche && (
            <p className="text-xs text-warmgray">{primary.niche}</p>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {platforms.map((p) => {
          return (
            <li key={p.id}>
              <Link
                href={`/dashboard/brand/browse/${p.id}`}
                className="group block rounded-xl border border-ink/[0.08] bg-surface/50 p-3 transition-all duration-150 hover:border-teal/30 hover:bg-surface/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-ink">
                    <PlatformIcon platform={p.platform} className="h-4 w-4" />
                    <span className="font-medium">@{p.handle}</span>
                  </div>
                  {p.tier && (
                    <Badge variant={p.tier === "tier1" ? "brick" : "teal"}>
                      {p.tier === "tier1" ? "Tier 1" : "Tier 2"}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-warmgray">
                  <span className="capitalize">{p.platform}</span>
                  <span className="font-mono font-medium text-ink/80">
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
