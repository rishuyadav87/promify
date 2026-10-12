import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/icons/PlatformIcon";

export type CreatorProfile = {
  id: string;
  user_id: string;
  display_name: string;
  platform: "instagram" | "youtube";
  handle: string;
  follower_count: number;
  tier: "tier1" | "tier2" | null;
  niche: string | null;
};

export function CreatorCard({ creator }: { creator: CreatorProfile }) {
  return (
    <Link href={`/dashboard/brand/browse/${creator.id}`} className="block group">
      <div
        className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: "rgba(28,25,22,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(240,237,232,0.08)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(240,237,232,0.05)",
        }}
      >
        {/* Hover glow */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-[30px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
            creator.platform === "youtube" ? "bg-brick/25" : "bg-teal/20"
          }`}
        />

        {/* Header row */}
        <div className="relative flex items-start justify-between gap-3">
          {/* Avatar placeholder with platform colour */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-stone ${
              creator.platform === "youtube"
                ? "bg-gradient-brick"
                : "bg-gradient-teal"
            }`}
          >
            {creator.display_name.charAt(0).toUpperCase()}
          </div>

          {creator.tier && (
            <Badge variant={creator.tier === "tier1" ? "brick" : "teal"}>
              {creator.tier === "tier1" ? "Tier 1" : "Tier 2"}
            </Badge>
          )}
        </div>

        {/* Name & handle */}
        <div className="relative">
          <h3 className="text-sm font-semibold text-ink leading-snug">
            {creator.display_name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-warmgray">
            <PlatformIcon platform={creator.platform} className="h-3.5 w-3.5" />
            <span>@{creator.handle}</span>
          </div>
          {creator.niche && (
            <p className="mt-1.5 text-xs text-warmgray/80">{creator.niche}</p>
          )}
        </div>

        {/* Follower count */}
        <div className="relative mt-auto pt-2 border-t border-ink/[0.07]">
          <p
            className={`font-mono text-lg font-semibold ${
              creator.platform === "youtube"
                ? "text-gradient-brick"
                : "text-gradient-teal"
            }`}
          >
            {creator.follower_count.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-warmgray">
            Followers
          </p>
        </div>
      </div>
    </Link>
  );
}
