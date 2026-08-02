"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";
import { getEligibleTier } from "@/lib/pricing";

type ActionState = { error: string | null };

export async function updateCreatorProfile(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const creatorId = formData.get("creator_id") as string;
  const displayName = (formData.get("display_name") as string)?.trim();
  const niche = (formData.get("niche") as string)?.trim() || null;
  const oauthConnected = formData.get("oauth_connected") === "true";
  const platform = formData.get("platform") as "instagram" | "youtube";

  if (!displayName) return { error: "Display name can't be empty." };

  const update: Database["public"]["Tables"]["creators"]["Update"] = {
    display_name: displayName,
    niche,
  };

  const customPriceRaw = (formData.get("custom_price") as string)?.trim();
  if (customPriceRaw) {
    const customPrice = Number(customPriceRaw);
    if (!Number.isFinite(customPrice) || customPrice <= 0) {
      return { error: "Custom price must be a positive number." };
    }
    update.custom_price = Math.round(customPrice);
  } else {
    update.custom_price = null;
  }

  if (!oauthConnected) {
    const handle = (formData.get("handle") as string)?.trim();
    const followerCount = Number(formData.get("follower_count"));
    if (!handle) return { error: "Handle can't be empty." };
    if (!Number.isFinite(followerCount) || followerCount < 0) {
      return { error: "Follower count must be a positive number." };
    }
    update.handle = handle;
    update.follower_count = Math.round(followerCount);

    const youtubeMonetized =
      platform === "youtube" && formData.get("youtube_monetized") === "on";
    if (platform === "youtube") {
      update.youtube_monetized = youtubeMonetized;
    }
    update.tier = getEligibleTier(
      platform,
      update.follower_count,
      youtubeMonetized,
    );
  }

  const { error } = await supabase
    .from("creators")
    .update(update)
    .eq("id", creatorId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/creator/profile");
  revalidatePath("/dashboard/creator");
  redirect("/dashboard/creator");
}

export async function addCreatorPlatform(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const platform = formData.get("platform") as string;
  const handle = (formData.get("handle") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim();

  if (platform !== "instagram" && platform !== "youtube")
    return { error: "Choose a platform." };
  if (!handle) return { error: "Handle can't be empty." };
  if (!displayName) return { error: "Display name can't be empty." };

  const { error } = await supabase.from("creators").insert({
    user_id: user.id,
    platform,
    handle,
    display_name: displayName,
    oauth_connected: false,
    tier: getEligibleTier(platform as "instagram" | "youtube", 0, false),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/creator/profile");
  revalidatePath("/dashboard/creator");
  return { error: null };
}
