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
        <p className="text-xs uppercase tracking-wide text-warmgray">
          Calculated range ₹{low.toLocaleString("en-IN")}–₹
          {high.toLocaleString("en-IN")}
        </p>
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="creator_id" value={creatorId} />
        <input type="hidden" name="expected_range_low" value={low} />
        <input type="hidden" name="expected_range_high" value={high} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium text-ink">
            Your offer price (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            defaultValue={price}
            required
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <p className="text-xs text-warmgray">
            Defaults to the calculated price — you can offer more or less, and
            the creator can counter once they see it.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="brief" className="text-sm font-medium text-ink">
            Content brief (optional)
          </label>
          <textarea
            id="brief"
            name="brief"
            rows={3}
            placeholder="e.g. A 30-second Reel unboxing the product, casual tone, show the packaging clearly"
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <p className="text-xs text-warmgray">
            Tell the creator what kind of content you're expecting — they'll see
            this once they accept.
          </p>
        </div>

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
