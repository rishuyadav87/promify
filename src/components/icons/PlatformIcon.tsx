import { FaInstagram, FaYoutube } from "react-icons/fa";

// Official brand colors — intentionally NOT themed with our teal/brick
// palette, per brand recognizability guidelines for third-party logos.
const BRAND_COLORS = {
  instagram: "#E4405F",
  youtube: "#FF0000",
} as const;

export function PlatformIcon({
  platform,
  className = "h-4 w-4",
}: {
  platform: "instagram" | "youtube";
  className?: string;
}) {
  const Icon = platform === "youtube" ? FaYoutube : FaInstagram;
  return (
    <Icon
      className={className}
      style={{ color: BRAND_COLORS[platform] }}
      aria-label={platform === "youtube" ? "YouTube" : "Instagram"}
    />
  );
}
