"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  counterOffer,
  acceptOffer,
  declineCampaign,
} from "@/lib/actions/campaigns";

type Offer = {
  id: string;
  offered_by: "creator" | "brand";
  amount: number;
  created_at: string;
};

function AcceptButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending || disabled}>
      {pending ? "Accepting…" : "Accept this price"}
    </Button>
  );
}
function DeclineButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Declining…" : "Decline"}
    </Button>
  );
}
function CounterButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Sending…" : "Send counter-offer"}
    </Button>
  );
}

export function NegotiationPanel({
  campaignId,
  status,
  offers,
  currentAmount,
  viewerParty,
}: {
  campaignId: string;
  status: string;
  offers: Offer[];
  currentAmount: number;
  viewerParty: "creator" | "brand";
}) {
  const [counterState, counterAction] = useFormState(counterOffer, {
    error: null,
  });
  const [acceptState, acceptAction] = useFormState(acceptOffer, {
    error: null,
  });
  const [declineState, declineAction] = useFormState(declineCampaign, {
    error: null,
  });
  const [showCounterForm, setShowCounterForm] = useState(false);

  const latestOffer = offers[0];
  const canAccept = !latestOffer || latestOffer.offered_by !== viewerParty;
  const isPending = status === "pending";

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Current price</h2>
          <Badge
            variant={
              status === "pending"
                ? "teal"
                : status === "accepted"
                  ? "brick"
                  : "neutral"
            }
          >
            {status}
          </Badge>
        </div>
        <p className="text-2xl font-semibold text-ink">
          ₹{currentAmount.toLocaleString("en-IN")}
        </p>

        {isPending && (
          <>
            {(acceptState.error ||
              declineState.error ||
              counterState.error) && (
              <p className="text-sm text-error">
                {acceptState.error || declineState.error || counterState.error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <form action={acceptAction}>
                <input type="hidden" name="campaign_id" value={campaignId} />
                <input type="hidden" name="amount" value={currentAmount} />
                <AcceptButton disabled={!canAccept} />
              </form>
              <form action={declineAction}>
                <input type="hidden" name="campaign_id" value={campaignId} />
                <DeclineButton />
              </form>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCounterForm((v) => !v)}
              >
                {showCounterForm ? "Cancel" : "Counter-offer"}
              </Button>
            </div>

            {!canAccept && (
              <p className="text-xs text-warmgray">
                Waiting on the other side to respond to your last offer.
              </p>
            )}

            {showCounterForm && (
              <form
                action={counterAction}
                className="flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="campaign_id" value={campaignId} />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-ink"
                  >
                    Your offer (₹)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min={1}
                    defaultValue={currentAmount}
                    required
                    className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                </div>
                <CounterButton />
              </form>
            )}
          </>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">Offer history</h2>
        {offers.length === 0 ? (
          <p className="text-sm text-warmgray">
            No counter-offers yet — this is the starting price.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {offers.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink">
                  {o.offered_by === viewerParty ? "You" : "They"} proposed ₹
                  {o.amount.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-warmgray">
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
