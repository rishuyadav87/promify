"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyNewBooking } from "@/lib/notifications";
type ActionState = { error: string | null };

export async function bookCreator(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const creatorId = formData.get("creator_id") as string;
  const price = Number(formData.get("price"));
  const expectedLow = Number(formData.get("expected_range_low"));
  const expectedHigh = Number(formData.get("expected_range_high"));
  const brief = (formData.get("brief") as string)?.trim() || null;
  if (!creatorId || !Number.isFinite(price) || price <= 0) {
    return { error: "Something went wrong preparing this booking." };
  }

  // Now that the price field is brand-editable (the "Propose a different
  // price" option), it's a genuine opening offer, not just a fixed number
  // we calculated ourselves -- so we can't validate it against the exact
  // suggested price anymore. But it still shouldn't be wildly outside the
  // calculated range, both to keep the negotiation sane and to prevent
  // someone from submitting an absurd number (₹1 or ₹1 crore) by mistake
  // or on purpose. The creator can still counter or decline either way, so
  // this is a sanity check, not a hard business rule.
  if (Number.isFinite(expectedLow) && Number.isFinite(expectedHigh) && expectedHigh > 0) {
    const floor = expectedLow * 0.5;
    const ceiling = expectedHigh * 2;
    if (price < floor || price > ceiling) {
      return {
        error: `Please enter an amount closer to the calculated range (₹${Math.round(
          expectedLow,
        ).toLocaleString("en-IN")}–₹${Math.round(expectedHigh).toLocaleString(
          "en-IN",
        )}).`,
      };
    }
  }

   const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!brand) return { error: "Only brand accounts can book creators." };

  const { data: newCampaign, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: brand.id,
      creator_id: creatorId,
      status: "pending",
      price: Math.round(price),
      expected_range_low: Math.round(expectedLow),
      expected_range_high: Math.round(expectedHigh),
      brief,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (newCampaign?.id) {
    // acceptOffer (src/lib/actions/campaigns.ts) only ever looks at
    // campaign_offers for something to accept -- it never falls back to
    // campaigns.price directly. Without a row here, the very first
    // booking has nothing in campaign_offers yet, so the creator's
    // "Accept this price" button fails with "No offer to accept yet."
    // every single time, even though a price clearly is set. This
    // records the brand's opening price as offer #1, the same way any
    // later counter-offer gets recorded by counterOffer -- so the
    // opening price is just the first entry in the same history, not a
    // special case the acceptance logic has to know about separately.
    const { error: offerError } = await supabase
      .from("campaign_offers")
      .insert({
        campaign_id: newCampaign.id,
        offered_by: "brand",
        amount: Math.round(price),
      });
    if (offerError) {
      // Don't fail the whole booking over this -- the campaign itself
      // was created successfully. Logged so it's visible in Vercel's
      // function logs if it ever happens, since a silent failure here
      // would quietly reintroduce the exact bug this is fixing.
      console.error(
        "Failed to record opening offer for campaign",
        newCampaign.id,
        offerError,
      );
    }

    await notifyNewBooking({
      creatorId,
      brandId: brand.id,
      price: Math.round(price),
      campaignId: newCampaign.id,
    });
  }

  redirect("/dashboard/brand?booked=1");}