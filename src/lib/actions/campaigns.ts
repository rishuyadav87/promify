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
  // Sane upper bound — prevents spam/griefing offers with no real ceiling.
  // Adjust if you have legitimate campaigns priced above this.
  if (amount > 10_000_000)
    return { error: "That amount looks too high — please double-check it." };

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error ?? null };
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
  // NOTE: we deliberately do NOT read "amount" from formData here.
  // It used to be trusted directly from a hidden form field, which meant
  // anyone could edit it in devtools (or send a raw request) and accept
  // at any price they chose, since RLS on campaigns only checks that
  // you're a participant — it doesn't constrain the price value. We now
  // always re-read the real latest offer from the database instead.

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error ?? null };
  const { supabase, campaign, party } = resolved;

  if (campaign.status !== "pending")
    return { error: "This campaign is no longer open for negotiation." };

  const { data: latestOffer } = await supabase
    .from("campaign_offers")
    .select("offered_by, amount")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestOffer) {
    return { error: "No offer to accept yet." };
  }

  if (latestOffer.offered_by === party) {
    return { error: "Waiting for the other side to respond to your offer." };
  }

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "accepted", price: Math.round(latestOffer.amount) })
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
  if ("error" in resolved) return { error: resolved.error ?? null };
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
export async function submitContent(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = formData.get("campaign_id") as string;
  const postUrl = (formData.get("post_url") as string)?.trim();

  if (!postUrl) return { error: "Enter a post URL." };
  try {
    new URL(postUrl);
  } catch {
    return { error: "Enter a valid URL (including https://)." };
  }

  const resolved = await resolveParty(campaignId);
  if ("error" in resolved) return { error: resolved.error ?? null };
  const { supabase, campaign, party } = resolved;

  if (party !== "creator") {
    return { error: "Only the creator can submit content for this campaign." };
  }
  if (campaign.status !== "accepted") {
    return {
      error: "Content can only be submitted once the campaign is accepted.",
    };
  }

  // Flat 48-hour window for now — no content_type stored yet to vary this by.
  const measurementWindowEndsAt = new Date(
    Date.now() + 48 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase
    .from("campaigns")
    .update({
      post_url: postUrl,
      status: "content_submitted",
      measurement_window_ends_at: measurementWindowEndsAt,
    })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  revalidateCampaign(campaignId);
  return { error: null };
}
