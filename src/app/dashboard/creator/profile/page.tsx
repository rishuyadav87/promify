import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/creators/EditProfileForm";
import { AddPlatformForm } from "@/components/creators/AddPlatformForm";

export default async function CreatorProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("creators")
    .select(
      "id, display_name, platform, handle, follower_count, niche, oauth_connected, custom_price",
    )

    .eq("user_id", user?.id)
    .order("platform");

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
