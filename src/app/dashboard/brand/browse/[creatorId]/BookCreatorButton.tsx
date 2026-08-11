"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import { bookCreator } from "./actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Sending…" : "Send booking request"}
    </Button>
  );
}

export function BookCreatorButton({
  creatorId,
  displayName,
  platform,
  handle,
  price,
  low,
  high,
}: {
  creatorId: string;
  displayName: string;
  platform: "instagram" | "youtube";
  handle: string;
  price: number;
  low: number;
  high: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [negotiating, setNegotiating] = useState(false);
  const [offerAmount, setOfferAmount] = useState(price);
  const [brief, setBrief] = useState("");
  const [state, formAction] = useFormState(bookCreator, { error: null });

  if (!confirming) {
    return (
      <Button variant="primary" onClick={() => setConfirming(true)}>
        Book this creator
      </Button>
    );
  }

  return (
    <Card className="flex flex-col gap-4 border-teal/30">
      <div>
        <h3 className="text-base font-semibold text-ink">Book {displayName}</h3>
        <p className="mt-1 text-sm text-warmgray">
          Proposing a campaign with {displayName} on{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
            {platform === "youtube" ? "YouTube" : "Instagram"}
          </span>{" "}
          (@{handle}).
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="creator_id" value={creatorId} />
        {/* These two were previously never sent, so every booking silently
            stored 0 for both -- kept here now so the creator can actually
            see the range this offer was calculated against. */}
        <input type="hidden" name="expected_range_low" value={low} />
        <input type="hidden" name="expected_range_high" value={high} />

        <div>
          <p className="text-sm text-warmgray">
            {negotiating ? "Your offer" : "Suggested price"}
          </p>
          {!negotiating ? (
            <>
              <p className="text-xl font-semibold text-ink">
                ₹{price.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-warmgray">
                Calculated range ₹{low.toLocaleString("en-IN")}–₹
                {high.toLocaleString("en-IN")}
              </p>
              <input type="hidden" name="price" value={price} />
            </>
          ) : (
            <>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-sm text-warmgray">₹</span>
                <input
                  type="number"
                  name="price"
                  min={1}
                  step={1}
                  required
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="w-full rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
              </div>
              <p className="mt-1 text-xs text-warmgray">
                Calculated range ₹{low.toLocaleString("en-IN")}–₹
                {high.toLocaleString("en-IN")}. The creator can accept, decline,
                or counter your offer once you send it.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="brief" className="text-sm font-medium text-ink">
            What do you need from this creator?
          </label>
          <textarea
            id="brief"
            name="brief"
            rows={4}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. One 30-60s Reel featuring our product, must mention [key point], posted between [dates], usage rights needed for 60 days..."
            className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <p className="text-xs text-warmgray">
            This is shown to the creator alongside your offer, so be as specific
            as you can -- content type, key messaging, deadlines, and any usage
            rights you need.
          </p>
        </div>

        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <div className="flex flex-wrap gap-3">
          <ConfirmButton />
          {!negotiating ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOfferAmount(price);
                setNegotiating(true);
              }}
            >
              Propose a different price
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setNegotiating(false)}
            >
              Use suggested price
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
