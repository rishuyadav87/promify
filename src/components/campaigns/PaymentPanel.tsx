"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createPaymentOrder, confirmPayment } from "@/lib/actions/payments";

// Razorpay's checkout.js attaches itself to window.Razorpay once loaded --
// there's no npm package needed for the browser side, matching how the
// Instagram OAuth callback also talks to Instagram's API with plain fetch
// rather than adding an SDK dependency (src/app/auth/callback/instagram).
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export function PaymentPanel({
  campaignId,
  price,
  creatorName,
}: {
  campaignId: string;
  price: number;
  creatorName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const result = await createPaymentOrder(campaignId);
    if (result.error || !result.orderId || !result.keyId) {
      setError(result.error ?? "Couldn't start payment. Please try again.");
      setLoading(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: result.keyId,
      order_id: result.orderId,
      amount: Math.round((result.amount ?? price) * 100),
      currency: "INR",
      name: "Juncture",
      description: `Payment for campaign with ${creatorName}`,
      handler: async (response: unknown) => {
        const paymentResponse = response as {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        };
        const confirmResult = await confirmPayment({
          campaignId,
          orderId: paymentResponse.razorpay_order_id,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature,
        });
        if (confirmResult.error) {
          setError(confirmResult.error);
          setLoading(false);
        } else {
          // Reload rather than router.refresh() so every panel on the
          // page (PaymentPanel disappearing, ContentSubmissionPanel
          // unlocking) re-reads the now-paid status from a fresh
          // server render in one go.
          window.location.reload();
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
      theme: { color: "#1B4A47" },
    });

    razorpay.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setLoading(false);
    });

    razorpay.open();
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Pay to start this campaign
          </h2>
          <p className="mt-1 text-sm text-warmgray">
            The creator can submit content once payment is confirmed.
          </p>
        </div>
        <p className="text-sm text-ink">
          Amount:{" "}
          <span className="font-semibold">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </p>
        <Button
          type="button"
          variant="primary"
          disabled={!scriptReady || loading}
          onClick={handlePay}
        >
          {loading ? "Processing…" : `Pay ₹${price.toLocaleString("en-IN")}`}
        </Button>
        {error && <p className="text-sm text-error">{error}</p>}
      </Card>
    </>
  );
}