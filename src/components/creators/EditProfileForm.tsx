"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
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
  youtube_monetized: boolean;
  profile_url: string | null;
};

const inputClasses =
  "rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:bg-ink/5 disabled:text-warmgray";

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

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <PlatformIcon platform={profile.platform} className="h-4 w-4" />
        <h2 className="text-base font-semibold capitalize text-ink">
          {profile.platform}
        </h2>
        {profile.oauth_connected ? (
          <Badge variant="teal">Connected</Badge>
        ) : (
          <Badge variant="neutral">Manual</Badge>
        )}
        {profile.platform === "youtube" && profile.oauth_connected && (
          <a
            href="/auth/connect/google"
            className="ml-auto text-xs font-medium text-teal hover:underline"
          >
            Refresh from YouTube
          </a>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="creator_id" value={profile.id} />
        <input
          type="hidden"
          name="oauth_connected"
          value={String(profile.oauth_connected)}
        />
        <input type="hidden" name="platform" value={profile.platform} />

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
        {profile.platform === "youtube" && (
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="youtube_monetized"
                defaultChecked={profile.youtube_monetized}
                disabled={profile.oauth_connected}
                className="h-4 w-4 rounded border-ink/20 text-teal focus:ring-teal/30"
              />
              This channel is monetized
            </label>
            <p className="text-xs text-warmgray">
              Monetized channels get a +20% multiplier on their calculated price
              band.
            </p>
            {profile.oauth_connected && (
              <p className="text-xs text-warmgray">
                Synced automatically from your connected account.
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`profile_url_${profile.id}`}
            className="text-sm font-medium text-ink"
          >
            {profile.platform === "youtube" ? "YouTube" : "Instagram"} profile
            link
          </label>
          <input
            id={`profile_url_${profile.id}`}
            name="profile_url"
            type="url"
            defaultValue={profile.profile_url ?? ""}
            placeholder={
              profile.platform === "youtube"
                ? "https://youtube.com/@yourchannel"
                : "https://instagram.com/yourhandle"
            }
            className={inputClasses}
          />
          <p className="text-xs text-warmgray">
            Shown to brands next to your platform icon so they can view your
            profile directly.
          </p>
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
