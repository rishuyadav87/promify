"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addCreatorPlatform } from "@/app/dashboard/creator/profile/actions";
import { OAUTH_LIVE } from "@/lib/oauthAvailability";
const inputClasses =
  "rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="self-start"
    >
      {pending ? "Adding…" : "Add manually"}
    </Button>
  );
}

// One of these renders per platform the creator hasn't added yet (never
// both platforms in one form with a dropdown -- each platform has its own
// OAuth connect route, so it needs its own card to offer that alongside
// the manual fallback).
export function AddPlatformForm({
  platform,
}: {
  platform: "instagram" | "youtube";
}) {
  const [state, formAction] = useFormState(addCreatorPlatform, { error: null });
  const label = platform === "youtube" ? "YouTube" : "Instagram";
  const connectHref =
    platform === "youtube" ? "/auth/connect/google" : "/auth/connect/instagram";
  const oauthLive = OAUTH_LIVE[platform];
  return (
    <Card className="flex flex-col gap-4">
            <div>
        <h2 className="text-base font-semibold text-ink">Add {label}</h2>
        <p className="mt-1 text-sm text-warmgray">
          Choose how to add your {label} profile — each option affects how
          your follower count is shown to brands.
        </p>
      </div>

           {oauthLive && (
        <>
          <div className="flex flex-col gap-1.5">
            <Button href={connectHref} variant="primary" className="self-start">
              Connect {label}
            </Button>
            <p className="text-xs text-warmgray">
              Verified instantly with a "Verified" badge, using your real
              follower count from{" "}
              {platform === "youtube" ? "Google" : "Instagram"}. You won't be
              able to edit that number yourself afterward.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-warmgray">
            <div className="h-px flex-1 bg-ink/10" />
            or add manually
            <div className="h-px flex-1 bg-ink/10" />
          </div>
        </>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="platform" value={platform} />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`new_display_name_${platform}`}
            className="text-sm font-medium text-ink"
          >
            Display name
          </label>
          <input
            id={`new_display_name_${platform}`}
            name="display_name"
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`new_handle_${platform}`}
            className="text-sm font-medium text-ink"
          >
            Handle
          </label>
          <input
            id={`new_handle_${platform}`}
            name="handle"
            required
            className={inputClasses}
          />
        </div>

        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <AddButton />
      </form>
                        <p className="text-xs text-warmgray">
        {oauthLive
          ? `Manually added profiles need admin approval before brands can see them — you'll show as "Pending review" until then. Connect ${label} instead (or anytime afterward) to skip review entirely, since that data is already confirmed.`
          : `Every new profile needs a quick admin approval before brands can see it — you'll show as "Pending review" until then, usually reviewed within a day.`}
      </p>
    </Card>
  );
}