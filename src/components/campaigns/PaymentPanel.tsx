"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createPaymentOrder, confirmPayment } from "@/lib/actions/payments";

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
          window.location.reload();
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
      theme: { color: "#38B9AC" },
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
      <Card
        className="flex flex-col gap-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(10,42,39,0.5) 0%, rgba(14,12,11,0.8) 100%)",
          border: "1px solid rgba(56,185,172,0.2)",
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-teal">
            Secure Payment
          </span>
          <h2 className="font-display text-lg text-ink">
            Pay to start this campaign
          </h2>
          <p className="text-sm text-warmgray">
            Funds are held securely. The creator can submit content once payment is confirmed.
          </p>
        </div>

        <div className="flex items-baseline justify-between border-y border-ink/[0.08] py-3">
          <span className="text-sm text-warmgray">Total amount</span>
          <span className="font-mono text-2xl font-bold text-gradient-teal">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={!scriptReady || loading}
          onClick={handlePay}
          className="w-full py-3 text-base"
        >
          {loading ? "Processing…" : `Pay ₹${price.toLocaleString("en-IN")}`}
        </Button>

        {error && (
          <p className="rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}
      </Card>
    </>
  );
}