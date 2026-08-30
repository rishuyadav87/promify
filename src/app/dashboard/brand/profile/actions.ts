"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
type ActionState = { error: string | null };

export async function updateBrandProfile(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const companyName = (formData.get("company_name") as string)?.trim();
  if (!companyName) return { error: "Company name can't be empty." };

  const { error } = await supabase
    .from("brands")
    .update({ company_name: companyName })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

   revalidatePath("/dashboard/brand/profile");
  revalidatePath("/dashboard/brand");
  redirect("/dashboard/brand");
}