import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/creators/EditProfileForm";
import { AddPlatformForm } from "@/components/creators/AddPlatformForm";
import { redirect } from "next/navigation";
export default async function CreatorProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  type CreatorProfileRow = {
    id: string;
    display_name: string;
    platform: "instagram" | "youtube";
    handle: string;
    follower_count: number;
    niche: string | null;
    oauth_connected: boolean;
    custom_price: number | null;
    youtube_monetized: boolean;
    // profile_url isn't in database.types.ts yet (added by migration 0003,
    // types not regenerated) — remove this cast once `npm run gen:types` has
    // been run against the live database.
    profile_url: string | null;
  };

  const { data: profiles } = (await supabase
    .from("creators")
    .select(
      "id, display_name, platform, handle, follower_count, niche, oauth_connected, custom_price, youtube_monetized, profile_url",
    )

    .eq("user_id", user.id)
    .order("platform")) as unknown as { data: CreatorProfileRow[] | null };

  const connectedPlatforms = (profiles ?? []).map((p) => p.platform);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Update your public details for each connected platform.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {profiles?.map((profile) => (
          <EditProfileForm key={profile.id} profile={profile} />
        ))}
      </div>

      {connectedPlatforms.length < 2 && (
        <AddPlatformForm
          excludePlatform={
            connectedPlatforms[0] as "instagram" | "youtube" | undefined
          }
        />
      )}
    </div>
  );
}
