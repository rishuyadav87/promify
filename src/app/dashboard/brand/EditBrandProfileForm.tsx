"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateBrandProfile } from "@/app/dashboard/brand/profile/actions";

const inputClasses =
  "rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={pending}
      className="self-start"
    >
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditBrandProfileForm({ companyName }: { companyName: string }) {
  const [state, formAction] = useFormState(updateBrandProfile, { error: null });

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-ink">Company details</h2>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="company_name"
            className="text-sm font-medium text-ink"
          >
            Company name
          </label>
          <input
            id="company_name"
            name="company_name"
            defaultValue={companyName}
            required
            className={inputClasses}
          />
        </div>

        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <SaveButton />
      </form>
    </Card>
  );
}
