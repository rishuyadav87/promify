"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CreatorProfile } from "@/components/creators/CreatorCard";
import { GroupedCreatorCard } from "@/components/creators/GroupedCreatorCard";

type PlatformFilter = "all" | "instagram" | "youtube";
type TierFilter = "all" | "tier1" | "tier2";

export function BrowseFilters({ creators }: { creators: CreatorProfile[] }) {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [niche, setNiche] = useState("");

  const filtered = useMemo(() => {
    return creators.filter((c) => {
      if (platform !== "all" && c.platform !== platform) return false;
      if (tier !== "all" && c.tier !== tier) return false;
      if (
        niche.trim() &&
        !c.niche?.toLowerCase().includes(niche.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [creators, platform, tier, niche]);

  const grouped = useMemo(() => {
    const map = new Map<string, CreatorProfile[]>();
    for (const c of filtered) {
      const existing = map.get(c.user_id) ?? [];
      existing.push(c);
      map.set(c.user_id, existing);
    }
    return Array.from(map.values());
  }, [filtered]);

  const selectClasses =
    "rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray" />
          <input
            type="text"
            placeholder="Search by niche…"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
          className={selectClasses}
        >
          <option value="all">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
        </select>

        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as TierFilter)}
          className={selectClasses}
        >
          <option value="all">All tiers</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
        </select>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-warmgray">
          No creators match those filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((platforms) => (
            <GroupedCreatorCard
              key={platforms[0].user_id}
              platforms={platforms}
            />
          ))}
        </div>
      )}
    </div>
  );
}
