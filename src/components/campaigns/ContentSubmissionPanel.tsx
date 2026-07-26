"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submitContent } from "@/lib/actions/campaigns";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Submitting…" : "Submit content"}
    </Button>
  );
}

export function ContentSubmissionPanel({
  campaignId,
  status,
  postUrl,
  measurementWindowEndsAt,
  price,
  viewerParty,
}: {
  campaignId: string;
  status: string;
  postUrl: string | null;
  measurementWindowEndsAt: string | null;
  price: number;
  viewerParty: "creator" | "brand";
}) {
  const [state, formAction] = useFormState(submitContent, { error: null });

  const relevantStatuses = [
    "accepted",
    "content_submitted",
    "live",
    "measuring",
    "completed",
  ];
  if (!relevantStatuses.includes(status)) return null;

  if (postUrl) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-ink">
          {status === "completed" ? "Campaign complete" : "Submitted content"}
        </h2>
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm text-teal underline"
        >
          {postUrl}
        </a>

        {status === "completed" ? (
          <>
            <p className="text-sm text-ink">
              Agreed price:{" "}
              <span className="font-semibold">₹{price.toLocaleString()}</span>
            </p>
            <p className="text-xs text-warmgray">
              Performance metrics and any refund calculation will show up here
              in a future update — for now this just confirms the campaign
              completed.
            </p>
          </>
        ) : (
          measurementWindowEndsAt && (
            <p className="text-xs text-warmgray">
              Measurement window ends{" "}
              {new Date(measurementWindowEndsAt).toLocaleString("en-IN")}
            </p>
          )
        )}
      </Card>
    );
  }

  if (status === "accepted" && viewerParty === "creator") {
    return (
      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Submit your content
          </h2>
          <p className="mt-1 text-sm text-warmgray">
            Paste the link to your live post. This starts a 48-hour measurement
            window.
          </p>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="campaign_id" value={campaignId} />
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="post_url" className="text-sm font-medium text-ink">
              Post URL
            </label>
            <input
              id="post_url"
              name="post_url"
              type="url"
              placeholder="https://instagram.com/p/..."
              required
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <SubmitButton />
        </form>

        {state.error && <p className="text-sm text-error">{state.error}</p>}
      </Card>
    );
  }

  if (status === "accepted" && viewerParty === "brand") {
    return (
      <Card>
        <p className="text-sm text-warmgray">
          Waiting on the creator to submit their post URL.
        </p>
      </Card>
    );
  }

  return null;
}
