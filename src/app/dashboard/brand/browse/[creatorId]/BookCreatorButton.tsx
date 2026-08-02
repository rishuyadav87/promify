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
          <span className="inline-flex items-center gap-1 align-middle">
            <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
            {platform === "youtube" ? "YouTube" : "Instagram"}
          </span>{" "}
          (@{handle}).
        </p>
      </div>
      <div>
        <p className="text-sm text-warmgray">
          Proposed price:{" "}
          <span className="font-semibold text-ink">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </p>
        <p className="text-xs text-warmgray">
          Calculated range ₹{low.toLocaleString("en-IN")}–₹
          {high.toLocaleString("en-IN")}
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="creator_id" value={creatorId} />
        <input type="hidden" name="price" value={price} />
        {state.error && <p className="text-sm text-error">{state.error}</p>}
        <div className="flex gap-3">
          <ConfirmButton />
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
