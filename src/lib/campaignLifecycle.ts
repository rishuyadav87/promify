import { createClient } from "@/lib/supabase/server";

const COMPLETABLE_STATUSES = [
  "content_submitted",
  "live",
  "measuring",
] as const;

type CampaignLike = {
  id: string;
  status: string;
  measurement_window_ends_at: string | null;
};

/**
 * Single-campaign check, used on detail pages. If the measurement window
 * has passed and the campaign is still pre-completion, flips it to
 * 'completed' and returns the (possibly updated) status to render with —
 * no second fetch needed.
 */
export async function autoCompleteExpiredCampaign<T extends CampaignLike>(
  supabase: ReturnType<typeof createClient>,
  campaign: T,
): Promise<string> {
  if (
    !(COMPLETABLE_STATUSES as readonly string[]).includes(campaign.status) ||
    !campaign.measurement_window_ends_at
  ) {
    return campaign.status;
  }
  if (new Date(campaign.measurement_window_ends_at) > new Date()) {
    return campaign.status;
  }

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "completed" })
    .eq("id", campaign.id)
    .in("status", COMPLETABLE_STATUSES);

  return error ? campaign.status : "completed";
}

/**
 * Bulk version for list pages — flips every expired campaign among the
 * given rows in one query, returns the rows with status patched locally
 * so the list reflects it without a second fetch.
 */
export async function autoCompleteExpiredCampaigns<T extends CampaignLike>(
  supabase: ReturnType<typeof createClient>,
  campaigns: T[],
): Promise<T[]> {
  const nowIso = new Date().toISOString();
  const expiredIds = campaigns
    .filter(
      (c) =>
        (COMPLETABLE_STATUSES as readonly string[]).includes(c.status) &&
        c.measurement_window_ends_at &&
        c.measurement_window_ends_at < nowIso,
    )
    .map((c) => c.id);

  if (expiredIds.length === 0) return campaigns;

  await supabase
    .from("campaigns")
    .update({ status: "completed" })
    .in("id", expiredIds)
    .in("status", COMPLETABLE_STATUSES);

  return campaigns.map((c) =>
    expiredIds.includes(c.id) ? { ...c, status: "completed" } : c,
  );
}
