import { createClient } from "@/lib/supabase/server";
import { BrowseFilters } from "@/components/creators/BrowseFilters";
import type { CreatorProfile } from "@/components/creators/CreatorCard";

export default async function BrowseCreatorsPage() {
  const supabase = createClient();

  const { data: creators, error } = await supabase
    .from("public_creator_profiles")
    .select(
      "id, user_id, display_name, platform, handle, follower_count, tier, niche",
    )
    .order("follower_count", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Browse creators
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Find a creator to invite to your next campaign.
        </p>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      {!error && (
        <BrowseFilters
          creators={(creators as unknown as CreatorProfile[]) ?? []}
        />
      )}
    </div>
  );
}
