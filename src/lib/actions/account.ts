"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
type ActionState = { error: string | null };

export async function updateUsername(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const dashboardPath =
    userRow?.role === "brand" ? "/dashboard/brand" : "/dashboard/creator";

  const usernameRaw = (formData.get("username") as string)
    ?.trim()
    .toLowerCase();
  console.log("DEBUG raw form value:", formData.get("username"));
  if (!usernameRaw) {
    const { error } = await supabase
      .from("users")
      .update({ username: null })
      .eq("id", user.id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/creator/profile");
    revalidatePath("/dashboard/brand/profile");
    redirect(dashboardPath);
  }

  if (!/^[a-z0-9_]{3,20}$/.test(usernameRaw)) {
    return {
      error:
        "Username must be 3-20 characters: lowercase letters, numbers, and underscores only.",
    };
  }

  const { data: updateResult, error } = await supabase
    .from("users")
    .update({ username: usernameRaw })
    .eq("id", user.id)
    .select();

  console.log(
    "DEBUG update result:",
    JSON.stringify(updateResult),
    "error:",
    JSON.stringify(error),
  );

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }
  revalidatePath("/dashboard/creator/profile");
  revalidatePath("/dashboard/brand/profile");
  redirect(dashboardPath);
}