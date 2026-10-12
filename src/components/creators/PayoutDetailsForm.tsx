"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updatePayoutDetails } from "@/lib/actions/payouts";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={pending}
      className="self-start"
    >
      {pending ? "Saving…" : "Save payout details"}
    </Button>
  );
}

export function PayoutDetailsForm({
  currentUpiVpa,
}: {
  currentUpiVpa: string | null;
}) {
  const [state, formAction] = useFormState(updatePayoutDetails, {
    error: null,
  });

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-ink">Payout details</h2>
        <p className="mt-1 text-sm text-warmgray">
          Where campaign payments get sent once a campaign completes.
          Payouts are currently sent manually by the Juncture team via UPI,
          usually within a few business days of completion.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="text"
          name="upi_vpa"
          defaultValue={currentUpiVpa ?? ""}
          placeholder="yourname@bank"
          className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
        {state.error && <p className="text-sm text-error">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-teal">Payout details saved.</p>
        )}
        <SaveButton />
      </form>
    </Card>
  );
}
