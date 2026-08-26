"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyCreatorApproved } from "@/lib/notifications";
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." as const };

  const { data: viewer } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") return { error: "Admins only." as const };

  return { supabase };
}

export async function setCreatorApproval(
  creatorId: string,
  approved: boolean,
): Promise<void> {
  const result = await requireAdmin();
  if ("error" in result) {
    throw new Error(result.error);
  }
  const { supabase } = result;

  const { data: updated, error } = await supabase
    .from("creators")
    .update({ approved })
    .eq("id", creatorId)
    .select("user_id")
    .single();

  if (error) throw new Error(error.message);

  // Only notify on approval, not on unapproving -- there's no
  // "your profile was unapproved" email in scope right now.
  if (approved && updated?.user_id) {
    await notifyCreatorApproved(updated.user_id);
  }

  revalidatePath("/dashboard/admin/creators");
}