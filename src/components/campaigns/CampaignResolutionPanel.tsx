"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { confirmSatisfaction, openDispute } from "@/lib/actions/campaigns";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Confirming…" : "Mark satisfied — release payout"}
    </Button>
  );
}

function DisputeSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Submitting…" : "Submit issue"}
    </Button>
  );
}

// Statuses where content already exists and this campaign is actively
// waiting on a resolution -- confirmed, disputed, or left to auto-expire.
const RESOLVABLE_STATUSES = ["content_submitted", "live", "measuring"];

export function CampaignResolutionPanel({
  campaignId,
  status,
  postUrl,
  viewerParty,
}: {
  campaignId: string;
  status: string;
  postUrl: string | null;
  viewerParty: "creator" | "brand";
}) {
  const [confirmState, confirmAction] = useFormState(confirmSatisfaction, {
    error: null,
  });
  const [disputeState, disputeAction] = useFormState(openDispute, {
    error: null,
  });
  const [reportingIssue, setReportingIssue] = useState(false);

  // Nothing to resolve yet (no content submitted), or already past
  // resolution (completed/disputed/declined/refunded) -- the disputed
  // case is deliberately not handled here since resolving a dispute is
  // an admin-only action, not something either party does from this panel.
  if (!postUrl || !RESOLVABLE_STATUSES.includes(status)) return null;

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-ink">
          {viewerParty === "brand"
            ? "Happy with the content?"
            : "Waiting on the brand to confirm"}
        </h2>
        <p className="mt-1 text-sm text-warmgray">
          {viewerParty === "brand"
            ? "Confirm now to release payout right away, or report an issue if something's wrong. If you do neither, this completes automatically once the measurement window ends."
            : "The brand can confirm now to release payout early, or the window will complete this automatically. You can report an issue from your side too if something's wrong."}
        </p>
      </div>

      {confirmState.error && (
        <p className="text-sm text-error">{confirmState.error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {viewerParty === "brand" && (
          <form action={confirmAction}>
            <input type="hidden" name="campaign_id" value={campaignId} />
            <ConfirmButton />
          </form>
        )}
        {!reportingIssue && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setReportingIssue(true)}
          >
            Report an issue
          </Button>
        )}
      </div>

      {reportingIssue && (
        <form action={disputeAction} className="flex flex-col gap-3">
          <input type="hidden" name="campaign_id" value={campaignId} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-sm font-medium text-ink">
              What went wrong?
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              required
              minLength={10}
              placeholder="e.g. Content doesn't match the agreed brief, post was taken down early, wrong product featured…"
              className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <p className="text-xs text-warmgray">
              This pauses the campaign and payout until an admin reviews it.
            </p>
          </div>
          {disputeState.error && (
            <p className="text-sm text-error">{disputeState.error}</p>
          )}
          <div className="flex gap-3">
            <DisputeSubmitButton />
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportingIssue(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}