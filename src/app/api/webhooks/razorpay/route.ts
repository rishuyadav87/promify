import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

// Razorpay calls this URL directly from their servers -- there's no user
// session, no cookies, nothing that identifies "who" is calling. The ONLY
// thing that proves a request genuinely came from Razorpay is the
// X-Razorpay-Signature header: an HMAC-SHA256 of the raw request body
// using RAZORPAY_WEBHOOK_SECRET (a separate secret from RAZORPAY_KEY_SECRET
// -- set in Razorpay's Dashboard under Settings > Webhooks when this URL is
// registered there). Until that signature is checked, every field in the
// body -- event type, payment id, amount -- has to be treated as
// untrusted, since anyone on the internet can POST a fake payload here.
//
// Why this exists alongside confirmPayment in src/lib/actions/payments.ts:
// that action runs in the brand's own browser right after checkout
// succeeds, which is fast but not guaranteed -- a closed tab, a dropped
// connection, or a crashed browser right after paying would leave the
// payment stuck as 'created' forever with no other code path to fix it.
// Razorpay retries this webhook until it gets a 200 response, so it's the
// backstop that guarantees a real payment is eventually recorded even if
// the browser-side confirmation never runs.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderId: string | undefined = payment?.order_id;
    const paymentId: string | undefined = payment?.id;

    if (orderId && paymentId) {
      const serviceRoleClient = createServiceRoleClient();
      // Same idempotent pattern as confirmPayment -- whichever of the two
      // (this webhook or the browser-side handler) arrives first "wins";
      // the other becomes a harmless no-op because the row is already
      // 'paid' and this .eq("status", "created") then matches nothing.
      await serviceRoleClient
        .from("payments")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
          paid_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
    }
  }

  // Razorpay only stops retrying once it gets a 200 -- returning one here
  // even for event types we don't act on (only payment.captured matters
  // right now) tells Razorpay the delivery succeeded, so it won't retry
  // events we're intentionally ignoring.
  return NextResponse.json({ received: true });
}