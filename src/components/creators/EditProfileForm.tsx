"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { updateCreatorProfile } from "@/app/dashboard/creator/profile/actions";
import { getPriceBand, FOLLOWER_COUNT_MAX } from "@/lib/pricing";
import { OAUTH_LIVE } from "@/lib/oauthAvailability";
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
  const [customPrice, setCustomPrice] = useState(
    profile.custom_price?.toString() ?? "",
  );

  const band = getPriceBand(
    profile.platform,
    profile.follower_count,
    profile.youtube_monetized,
  );

  const label = profile.platform === "youtube" ? "YouTube" : "Instagram";
  const connectHref =
    profile.platform === "youtube"
      ? "/auth/connect/google"
      : "/auth/connect/instagram";
        const oauthLive = OAUTH_LIVE[profile.platform];
  const countNoun = profile.platform === "youtube" ? "subscriber" : "follower";

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
       {profile.oauth_connected && (<a
    href={connectHref}
    className="ml-auto text-xs font-medium text-teal hover:underline"
  >
    Refresh from {profile.platform === "youtube" ? "YouTube" : "Instagram"}
  </a>
)}
      </div>

      {/*
        Unverified/manual profiles always lead with the Connect option --
        same shape as AddPlatformForm -- so verifying is never more than
        one click away, even after a manual entry already exists.
      */}
           {!profile.oauth_connected && oauthLive && (
        <>
          <div className="flex flex-col gap-1.5">
            <Button href={connectHref} variant="primary" className="self-start">
              Connect {label}
            </Button>
            <p className="text-xs text-warmgray">
              Verified instantly with a "Verified" badge, using your real{" "}
              {countNoun} count from {label}. You won't be able to edit that
              number yourself afterward.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-warmgray">
            <div className="h-px flex-1 bg-ink/10" />
            or edit manually
            <div className="h-px flex-1 bg-ink/10" />
          </div>
        </>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="creator_id" value={profile.id} />
        <input
          type="hidden"
          name="oauth_connected"
          value={String(profile.oauth_connected)}
        />
        <input type="hidden" name="platform" value={profile.platform} />

        {/*
          Pricing gets its own highlighted block at the top of the form,
          rather than sitting as a buried "(optional)" field below
          everything else -- it's the decision creators most need to see
          and act on, so it shouldn't be the last thing they scroll past.
        */}
        <div className="flex flex-col gap-2 rounded-lg border border-brick/25 bg-brick-subtle p-4">
          <label
            htmlFor={`custom_price_${profile.id}`}
            className="text-sm font-semibold text-ink"
          >
            Set your own price
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-warmgray">₹</span>
            <input
              id={`custom_price_${profile.id}`}
              name="custom_price"
              type="number"
              min={0}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="e.g. 5000"
              className={`${inputClasses} flex-1`}
            />
          </div>
          <p className="text-xs text-ink/70">
            {customPrice.trim()
              ? "Brands will see this exact price instead of a calculated range."
              : band.custom
                ? `Leave this blank and brands will see "${band.label}" instead of a fixed number.`
                : `Leave this blank and brands will see your calculated range: ₹${band.low.toLocaleString("en-IN")}–₹${band.high.toLocaleString("en-IN")}, based on your follower count.`}
          </p>
          {customPrice.trim() && (
            <button
              type="button"
              onClick={() => setCustomPrice("")}
              className="self-start text-xs font-medium text-brick underline"
            >
              Clear and use the calculated range instead
            </button>
          )}
        </div>

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
            max={FOLLOWER_COUNT_MAX}
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

        {state.error && <p className="text-sm text-error">{state.error}</p>}

        <SaveButton />
      </form>

            {!profile.oauth_connected && (
        <p className="text-xs text-warmgray">
          {oauthLive
            ? `Manually added profiles need admin approval before brands can see them — you'll show as "Pending review" until then. Connect ${label} instead (or anytime afterward) to skip review entirely, since that data is already confirmed.`
            : `This profile needs a quick admin approval before brands can see it — you'll show as "Pending review" until then, usually reviewed within a day.`}
        </p>
      )}
    </Card>
  );
}