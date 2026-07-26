"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bookCreator } from "./actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Booking…" : "Confirm booking"}
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
        <h3 className="text-base font-semibold text-ink">Confirm booking</h3>
        <p className="mt-1 text-sm text-warmgray">
          Proposing a campaign with {displayName} on{" "}
          {platform === "youtube" ? "YouTube" : "Instagram"} (@{handle}).
        </p>
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink">
          ₹{price.toLocaleString("en-IN")}
        </p>
        <p className="text-xs uppercase tracking-wide text-warmgray">
          Proposed price · range ₹{low.toLocaleString("en-IN")}–₹
          {high.toLocaleString("en-IN")}
        </p>
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <form action={formAction} className="flex gap-3">
        <input type="hidden" name="creator_id" value={creatorId} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="expected_range_low" value={low} />
        <input type="hidden" name="expected_range_high" value={high} />
        <ConfirmButton />
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </form>
    </Card>
  );
}
