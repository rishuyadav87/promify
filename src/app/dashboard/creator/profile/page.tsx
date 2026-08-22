import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/creators/EditProfileForm";
import { AddPlatformForm } from "@/components/creators/AddPlatformForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  const { data: profiles } = await supabase
    .from("creators")
    .select(
      "id, display_name, platform, handle, follower_count, niche, oauth_connected, custom_price, youtube_monetized, profile_url",
    )
    .eq("user_id", user.id)
    .order("platform");

  const connectedPlatforms = (profiles ?? []).map((p) => p.platform);
const youtubeProfile = (profiles ?? []).find((p) => p.platform === "youtube");
// A YouTube row can exist without ever having gone through Google's OAuth
// flow (e.g. added manually via "Add another platform" with a self-reported
// subscriber count). Only treat YouTube as "handled" once it's actually
// been verified through OAuth — otherwise keep showing the connect prompt.
const hasVerifiedYoutube = youtubeProfile?.oauth_connected === true;
const instagramProfile = (profiles ?? []).find(
  (p) => p.platform === "instagram",
);
const hasVerifiedInstagram = instagramProfile?.oauth_connected === true;
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
{!instagramProfile && (
  <Card className="flex flex-col gap-3">
    <h2 className="text-base font-semibold text-ink">
      Connect your Instagram channel
    </h2>
    <p className="text-sm text-warmgray">
      Verify with Instagram to automatically sync your real follower count
      instead of entering it manually.
    </p>
    <Button
      href="/auth/connect/instagram"
      variant="primary"
      className="self-start"
    >
      Connect Instagram
    </Button>
  </Card>
)}
     
<div className="flex flex-col gap-6">
  {profiles?.map((profile) => (
    <div key={profile.id} className="flex flex-col gap-3">
      <EditProfileForm profile={profile} />
        {profile.platform === "instagram" && !hasVerifiedInstagram && (
          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-ink">
              Verify your Instagram channel
            </h2>
            <p className="text-sm text-warmgray">
              Your follower count is currently self-reported. Verify with
              Instagram to replace it with your real, Meta-confirmed count.
            </p>
            <Button
              href="/auth/connect/instagram"
              variant="primary"
              className="self-start"
            >
              Verify Instagram
            </Button>
          </Card>
        )}
        {!youtubeProfile && (
  <Card className="flex flex-col gap-3">
    <h2 className="text-base font-semibold text-ink">
      Connect your YouTube channel
    </h2>
    <p className="text-sm text-warmgray">
      Verify with Google to automatically sync your real subscriber count
      instead of entering it manually.
    </p>
    <Button href="/auth/connect/google" variant="primary" className="self-start">
      Connect YouTube
    </Button>
  </Card>
)}

      {profile.platform === "youtube" && !hasVerifiedYoutube && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">
            Verify your YouTube channel
          </h2>
          <p className="text-sm text-warmgray">
            Your subscriber count is currently self-reported. Verify with
            Google to replace it with your real, Google-confirmed count.
          </p>
          <Button href="/auth/connect/google" variant="primary" className="self-start">
            Verify YouTube
          </Button>
        </Card>
      )}
            
      
    </div>
  ))}
</div>
     {!instagramProfile && <AddPlatformForm platform="instagram" />}
{!youtubeProfile && <AddPlatformForm platform="youtube" />}
    </div>
    
  );
}