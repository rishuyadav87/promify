"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

type CreateOrderResult = {
  error: string | null;
  orderId?: string;
  amount?: number;
  keyId?: string;
};

// Creates a Razorpay order for a campaign's agreed price and records it in
// the `payments` table (0015_add_payments_table.sql). The amount charged
// is always campaigns.price read fresh from the DB right here -- never a
// value passed in from the client -- so there is no way for a brand's
// browser to request an order for less than what was actually agreed
// (same reasoning as the campaigns.price lock in 0009).
//
// The initial insert into `payments` has to go through the service-role
// client, not the brand's own session, because payments_write_admin
// (0015) only allows admin/service-role writes -- by design, so a regular
// session can never self-report "I paid." That's safe here specifically
// because this code has already independently verified (above) that the
// caller really is the brand on an 'accepted' campaign, and the order id
// being stored is a real one just returned by Razorpay's API, not
// anything the client supplied.
export async function createPaymentOrder(
  campaignId: string,
): Promise<CreateOrderResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!brand) return { error: "Only a brand can pay for a campaign." };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, price, status, brand_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign) return { error: "Campaign not found." };
  if (campaign.brand_id !== brand.id) {
    return { error: "This isn't your campaign." };
  }
  if (campaign.status !== "accepted") {
    return { error: "This campaign isn't ready for payment yet." };
  }

  const serviceRoleClient = createServiceRoleClient();

  // Reuse an existing unpaid order instead of creating a duplicate one
  // every time the brand reopens the page or retries after closing the
  // checkout modal without paying.
  const { data: existing } = await serviceRoleClient
    .from("payments")
    .select("razorpay_order_id, amount, status")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "paid") {
    return { error: "This campaign has already been paid for." };
  }
  if (existing?.status === "created" && existing.razorpay_order_id) {
    return {
      error: null,
      orderId: existing.razorpay_order_id,
      amount: existing.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  }

  // Razorpay's Orders API wants the amount in paise (smallest currency
  // unit), not rupees -- ₹500.00 becomes 50000. Rounding guards against
  // floating-point drift from the *100 multiplication.
  const amountInPaise = Math.round(campaign.price * 100);

  const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        ).toString("base64"),
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt: campaignId,
    }),
  });

  if (!razorpayRes.ok) {
    const body = await razorpayRes.text();
    console.error("Razorpay order creation failed:", body);
    return { error: "Couldn't start payment. Please try again." };
  }

  const order = (await razorpayRes.json()) as { id: string };

  const { error: insertError } = await serviceRoleClient
    .from("payments")
    .insert({
      campaign_id: campaignId,
      amount: campaign.price,
      commission_percent: 0,
      razorpay_order_id: order.id,
      status: "created",
    });
  if (insertError) {
    console.error("Failed to record payment order:", insertError);
    return { error: "Couldn't start payment. Please try again." };
  }

  return {
    error: null,
    orderId: order.id,
    amount: campaign.price,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

// Verifies the signature Razorpay's Checkout hands back to the browser
// right after a successful payment, then marks the payment 'paid'. This
// is the fast path -- it updates the moment the brand's browser gets a
// result. src/app/api/webhooks/razorpay/route.ts is the slower but
// guaranteed backup, for the case where the browser closes or loses
// connection before this ever runs.
export async function confirmPayment(details: {
  campaignId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ error: string | null }> {
  // Razorpay's documented check: HMAC-SHA256 of "order_id|payment_id"
  // using your key secret must equal the signature it sent back. Only
  // someone holding RAZORPAY_KEY_SECRET (Razorpay, or this server) could
  // produce a signature that matches -- so a match is proof the payment
  // is real, regardless of who is calling this function.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${details.orderId}|${details.paymentId}`)
    .digest("hex");

  if (expectedSignature !== details.signature) {
    return {
      error:
        "Payment verification failed. If you were charged, contact support@juncture.co.in.",
    };
  }

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: details.paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("razorpay_order_id", details.orderId)
    // Idempotent on purpose: if the webhook already marked this 'paid'
    // by the time this runs, this update matches zero rows and is a
    // harmless no-op rather than an error.
    .eq("status", "created");

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/brand/campaigns/${details.campaignId}`);
  revalidatePath(`/dashboard/creator/campaigns/${details.campaignId}`);
  return { error: null };
}