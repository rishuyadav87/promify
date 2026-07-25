"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Camera, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { updateCreatorProfile } from "@/app/dashboard/creator/profile/actions";

type Profile = {
  id: string;
  display_name: string;
  platform: "instagram" | "youtube";
  handle: string;
  follower_count: number;
  custom_price: number | null;
  niche: string | null;
  oauth_connected: boolean;
};

const inputClasses =
  "rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:bg-ink/5 disabled:text-warmgray";

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

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(updateCreatorProfile, {
    error: null,
  });
  const PlatformIcon = profile.platform === "youtube" ? Play : Camera;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <PlatformIcon className="h-4 w-4 text-warmgray" />
        <h2 className="text-base font-semibold capitalize text-ink">
          {profile.platform}
        </h2>
        {profile.oauth_connected ? (
          <Badge variant="teal">Connected</Badge>
        ) : (
          <Badge variant="neutral">Manual</Badge>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="creator_id" value={profile.id} />
        <input
          type="hidden"
          name="oauth_connected"
          value={String(profile.oauth_connected)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`display_name_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            Display name
          </label>
          <input
            id={`display_name_${profile.id}`}
            name="display_name"
            defaultValue={profile.display_name}
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`niche_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            Niche
          </label>
          <input
            id={`niche_${profile.id}`}
            name="niche"
            defaultValue={profile.niche ?? ""}
            placeholder="e.g. Fitness, Beauty, Tech"
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`handle_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            Handle
          </label>
          <input
            id={`handle_${profile.id}`}
            name="handle"
            defaultValue={profile.handle}
            disabled={profile.oauth_connected}
            required={!profile.oauth_connected}
            className={inputClasses}
          />
          {profile.oauth_connected && (
            <p className="text-xs text-warmgray">
              Verified via OAuth — disconnect and reconnect the platform to
              change this.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`follower_count_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            Follower count
          </label>
          <input
            id={`follower_count_${profile.id}`}
            name="follower_count"
            type="number"
            min={0}
            defaultValue={profile.follower_count}
            disabled={profile.oauth_connected}
            required={!profile.oauth_connected}
            className={inputClasses}
          />
          {profile.oauth_connected && (
            <p className="text-xs text-warmgray">
              Synced automatically from your connected account.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`custom_price_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            Your price (optional)
          </label>
          <input
            id={`custom_price_${profile.id}`}
            name="custom_price"
            type="number"
            min={0}
            defaultValue={profile.custom_price ?? ""}
            placeholder="Leave blank to use the calculated price band"
            className={inputClasses}
          />
          <p className="text-xs text-warmgray">
            Set your own flat rate, or leave blank to let brands see the
            calculated price band based on your follower count.
          </p>
        </div>
        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <SaveButton />
      </form>
    </Card>
  );
}
