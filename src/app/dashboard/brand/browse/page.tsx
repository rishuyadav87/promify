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
          creators={
            (creators ?? [])
              // public_creator_profiles is a database VIEW, and Postgres
              // views report every column as nullable in generated types
              // regardless of the underlying table's real constraints --
              // this is a genuine nullability gap, not leftover staleness
              // from before types were regenerated, so a straight cast
              // would be papering over something real. Filtering out any
              // row missing a required field is the honest fix: it keeps
              // TypeScript's guarantee meaningful instead of just
              // silencing it.
              .filter(
                (c): c is typeof c & CreatorProfile =>
                  c.id !== null &&
                  c.user_id !== null &&
                  c.display_name !== null &&
                  c.platform !== null &&
                  c.handle !== null &&
                  c.follower_count !== null,
              )
          }
        />
      )}
    </div>
  );
}