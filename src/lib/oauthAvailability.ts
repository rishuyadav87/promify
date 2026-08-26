// Toggle these to true once Google/Meta approve OAuth verification for
// real users beyond manually-added testers. Until then, showing "Connect"
// buttons to real creators just sends them to a scary "unverified app"
// error screen instead of the real consent flow -- so these flags let us
// hide those buttons everywhere at once and quietly fall back to manual
// entry, without touching the OAuth code itself.
export const OAUTH_LIVE: Record<"youtube" | "instagram", boolean> = {
  youtube: false,
  instagram: false,
};