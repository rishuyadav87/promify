export type Platform = "instagram" | "youtube";
export type Tier = "tier1" | "tier2";

export type PriceBand =
  | { custom: true; label: string }
  | { custom: false; label: string; low: number; high: number };

const ELIGIBILITY_FLOOR = 1_000;
const TIER1_THRESHOLD = 10_000;
const YOUTUBE_MONETIZED_MULTIPLIER = 1.2;

export function getEligibleTier(
  platform: Platform,
  followerCount: number,
  youtubeMonetized = false,
): Tier | null {
  if (followerCount < ELIGIBILITY_FLOOR) return null;
  if (platform === "instagram") {
    return followerCount >= TIER1_THRESHOLD ? "tier1" : "tier2";
  }
  return youtubeMonetized || followerCount >= TIER1_THRESHOLD
    ? "tier1"
    : "tier2";
}

export function getPriceBand(
  platform: Platform,
  followerCount: number,
  youtubeMonetized = false,
): PriceBand {
  const multiplier =
    platform === "youtube" && youtubeMonetized
      ? YOUTUBE_MONETIZED_MULTIPLIER
      : 1;

  if (followerCount < ELIGIBILITY_FLOOR)
    return { custom: true, label: "Not yet eligible" };
  if (followerCount >= 500_000) return { custom: true, label: "Macro" };
  if (followerCount >= 100_000) {
    return {
      custom: false,
      label: "Mid",
      low: Math.round(15_000 * multiplier),
      high: Math.round(50_000 * multiplier),
    };
  }
  if (followerCount >= 10_000) {
    return {
      custom: false,
      label: "Micro",
      low: Math.round(2_000 * multiplier),
      high: Math.round(15_000 * multiplier),
    };
  }
  return {
    custom: false,
    label: "Nano",
    low: Math.round(500 * multiplier),
    high: Math.round(2_000 * multiplier),
  };
}
