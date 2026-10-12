import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

// Called the moment a campaign reaches 'completed' -- from confirmSatisfaction
// (src/lib/actions/campaigns.ts) and from both autoCompleteExpiredCampaign*
// functions (src/lib/campaignLifecycle.ts). Runs on the service-role client
// because payouts_write_admin (0001_init.sql) only allows admin writes --
// neither the brand's session (confirmSatisfaction) nor whichever session
// happens to load the page and trigger the lazy auto-complete should be able
// to write here directly, since a payout record is a financial fact, not
// something either party to the deal should be able to self-report.
//
// This only creates the 'pending' record for an admin to action manually --
// see the 0023 migration comment for why payouts aren't automatic yet
// (Route eligibility).
export async function ensurePayoutRecord(campaignId: string, amount: number) {
  const serviceRoleClient = createServiceRoleClient();

  // Idempotent: confirmSatisfaction and the two autoComplete* functions
  // could all reach 'completed' for the same campaign under slightly
  // different timings (e.g. the brand confirms right as the measurement
  // window also expires) -- checking for an existing row first means
  // whichever path runs first "wins" and no duplicate payout is ever
  // created for the same campaign.
  const { data: existing } = await serviceRoleClient
    .from("payouts")
    .select("id")
    .eq("campaign_id", campaignId)
    .maybeSingle();
  if (existing) return;

  const { error } = await serviceRoleClient.from("payouts").insert({
    campaign_id: campaignId,
    amount,
    status: "pending",
  });
  if (error) {
    // Doesn't throw -- the campaign status change itself already
    // succeeded by the time this runs, and failing the whole request
    // over a payout-record bookkeeping issue would be worse than just
    // logging it. Visible in Vercel's function logs if it ever happens.
    console.error(
      "Failed to create payout record for campaign",
      campaignId,
      error,
    );
  }
}
