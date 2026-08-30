import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/creators/EditProfileForm";
import { AddPlatformForm } from "@/components/creators/AddPlatformForm";
import { Card } from "@/components/ui/Card";
import { UsernameForm } from "@/components/account/UsernameForm";
import { redirect } from "next/navigation";

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: {
  youtube_connect?: string;
  instagram_connect?: string;
  message?: string;
};
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
    const { data: userRow } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: profiles } = await supabase
    .from("creators")
    .select(
      "id, display_name, platform, handle, follower_count, niche, oauth_connected, custom_price, youtube_monetized, profile_url",
    )
    .eq("user_id", user.id)
    .order("platform");

  const connectedPlatforms = (profiles ?? []).map((p) => p.platform);
const youtubeProfile = (profiles ?? []).find((p) => p.platform === "youtube");
const instagramProfile = (profiles ?? []).find(
  (p) => p.platform === "instagram",
);
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
        <UsernameForm currentUsername={userRow?.username ?? null} />
      {searchParams.youtube_connect === "success" && (
        <Card className="border-teal/30 bg-teal/5">
          <p className="text-sm text-teal">{searchParams.message}</p>
        </Card>
      )}
      {searchParams.youtube_connect === "error" && (
        <Card className="border-error/30 bg-error/5">
          <p className="text-sm text-error">{searchParams.message}</p>
        </Card>
      )}
{searchParams.instagram_connect === "success" && (
  <Card className="border-teal/30 bg-teal/5">
    <p className="text-sm text-teal">{searchParams.message}</p>
  </Card>
)}
{searchParams.instagram_connect === "error" && (
  <Card className="border-error/30 bg-error/5">
    <p className="text-sm text-error">{searchParams.message}</p>
  </Card>
)}
<div className="flex flex-col gap-6">
  {profiles?.map((profile) => (
    <div key={profile.id} className="flex flex-col gap-3">
      <EditProfileForm profile={profile} />
    </div>
  ))}
</div>
     {!instagramProfile && <AddPlatformForm platform="instagram" />}
{!youtubeProfile && <AddPlatformForm platform="youtube" />}
    </div>
    
  );
}