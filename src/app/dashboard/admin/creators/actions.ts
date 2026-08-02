"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase
    .from("creators")
    .update({ approved } as never) // remove `as never` after regenerating types
    .eq("id", creatorId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/creators");
}
