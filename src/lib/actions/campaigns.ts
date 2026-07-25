"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error: string | null };

async function resolveParty(campaignId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, brand_id, creator_id, status, price")
    .eq("id", campaignId)
    .single();
  if (!campaign) return { error: "Campaign not found." };

  const { data: creatorRow } = await supabase
    .from("creators")
    .select("id")
    .eq("id", campaign.creator_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (creatorRow) return { supabase, campaign, party: "creator" as const };

  const { data: brandRow } = await supabase
    .from("brands")
    .select("id")
    .eq("id", campaign.brand_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (brandRow) return { supabase, campaign, party: "brand" as const };

  return { error: "You're not a participant in this campaign." };
}

function revalidateCampaign(id: string) {
  revalidatePath(`/dashboard/creator/campaigns/${id}`);
  revalidatePath(`/dashboard/brand/campaigns/${id}`);
  revalidatePath("/dashboard/creator");
  revalidatePath("/dashboard/brand");
}

export async function counterOffer(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = formData.get("campaign_id") as string;
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter a valid amount." };

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error };
  const { supabase, campaign, party } = resolved;

  if (campaign.status !== "pending")
    return { error: "This campaign is no longer open for negotiation." };

  const { error } = await supabase.from("campaign_offers").insert({
    campaign_id: campaignId,
    offered_by: party,
    amount: Math.round(amount),
  });
  if (error) return { error: error.message };

  revalidateCampaign(campaignId);
  return { error: null };
}

export async function acceptOffer(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = formData.get("campaign_id") as string;
  const amount = Number(formData.get("amount"));

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error };
  const { supabase, campaign, party } = resolved;

  if (campaign.status !== "pending")
    return { error: "This campaign is no longer open for negotiation." };

  const { data: latestOffer } = await supabase
    .from("campaign_offers")
    .select("offered_by")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestOffer?.offered_by === party) {
    return { error: "Waiting for the other side to respond to your offer." };
  }

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "accepted", price: Math.round(amount) })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  revalidateCampaign(campaignId);
  return { error: null };
}

export async function declineCampaign(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = formData.get("campaign_id") as string;

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error };
  const { supabase, campaign } = resolved;

  if (campaign.status !== "pending")
    return { error: "This campaign is no longer open." };

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "declined" })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  revalidateCampaign(campaignId);
  return { error: null };
}
