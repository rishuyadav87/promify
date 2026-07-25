"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addCreatorPlatform } from "@/app/dashboard/creator/profile/actions";

const inputClasses =
  "rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="self-start"
    >
      {pending ? "Adding…" : "Add platform"}
    </Button>
  );
}

export function AddPlatformForm({
  excludePlatform,
}: {
  excludePlatform?: "instagram" | "youtube";
}) {
  const [state, formAction] = useFormState(addCreatorPlatform, { error: null });

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-ink">
          Add another platform
        </h2>
        <p className="mt-1 text-sm text-warmgray">
          List a second platform to be booked for separately.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="new_platform"
            className="text-sm font-medium text-ink"
          >
            Platform
          </label>
          <select
            id="new_platform"
            name="platform"
            defaultValue=""
            required
            className={inputClasses}
          >
            <option value="" disabled>
              Choose a platform
            </option>
            {excludePlatform !== "instagram" && (
              <option value="instagram">Instagram</option>
            )}
            {excludePlatform !== "youtube" && (
              <option value="youtube">YouTube</option>
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="new_display_name"
            className="text-sm font-medium text-ink"
          >
            Display name
          </label>
          <input
            id="new_display_name"
            name="display_name"
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new_handle" className="text-sm font-medium text-ink">
            Handle
          </label>
          <input
            id="new_handle"
            name="handle"
            required
            className={inputClasses}
          />
        </div>

        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <AddButton />
      </form>
    </Card>
  );
}
