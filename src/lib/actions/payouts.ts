"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PayoutDetailsState = { error: string | null; success?: boolean };

// Creator saves/updates the UPI ID payouts should be sent to. Uses the
// creator's own session client, not service-role -- RLS on
// creator_payout_details (0023) already lets a person write their own
// row, so there's no reason to bypass it here.
export async function updatePayoutDetails(
  prevState: PayoutDetailsState,
  formData: FormData,
): Promise<PayoutDetailsState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const upiVpa = (formData.get("upi_vpa") as string)?.trim();
  if (!upiVpa || !upiVpa.includes("@")) {
    return { error: "Enter a valid UPI ID, e.g. yourname@bank." };
  }

  const { error } = await supabase.from("creator_payout_details").upsert({
    user_id: user.id,
    upi_vpa: upiVpa,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/creator/profile");
  return { error: null, success: true };
}

// Admin-only: records that a payout was actually sent by hand (UPI/bank
// transfer, outside Razorpay -- see 0023 migration for why). Uses the
// session client, same as setCreatorApproval in
// src/app/dashboard/admin/creators/actions.ts -- once the explicit role
// check below confirms this really is an admin session, RLS
// (payouts_write_admin, 0001_init.sql) already allows the write, so
// there's no need to reach for the service-role client just to bypass a
// check that wouldn't have blocked a real admin anyway.
export async function markPayoutSent(formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: viewer } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") throw new Error("Admins only.");

  const payoutId = formData.get("payout_id") as string;
  const reference = (formData.get("reference") as string)?.trim();
  const tdsDeducted = Number(formData.get("tds_deducted") || 0);

  if (!reference) {
    throw new Error(
      "Enter a transaction reference (UTR/UPI ref) -- with no Razorpay API confirming this transfer, that reference is the only record it actually happened.",
    );
  }
  if (!Number.isFinite(tdsDeducted) || tdsDeducted < 0) {
    throw new Error("TDS deducted must be zero or a positive number.");
  }

  const { error } = await supabase
    .from("payouts")
    .update({
      status: "released",
      reference,
      tds_deducted: tdsDeducted,
      released_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "pending"); // idempotent guard against a double click
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/payouts");
}
