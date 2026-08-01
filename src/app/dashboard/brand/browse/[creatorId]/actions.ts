"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error: string | null };

export async function bookCreator(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const creatorId = formData.get("creator_id") as string;
  const price = Number(formData.get("price"));
  const expectedLow = Number(formData.get("expected_range_low"));
  const expectedHigh = Number(formData.get("expected_range_high"));
  const brief = (formData.get("brief") as string)?.trim() || null;
  if (!creatorId || !Number.isFinite(price) || price <= 0) {
    return { error: "Something went wrong preparing this booking." };
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!brand) return { error: "Only brand accounts can book creators." };

  const { error } = await supabase.from("campaigns").insert({
    brand_id: brand.id,
    creator_id: creatorId,
    status: "pending",
    price: Math.round(price),
    expected_range_low: Math.round(expectedLow),
    expected_range_high: Math.round(expectedHigh),
    brief,
  } as never);

  if (error) return { error: error.message };

  redirect("/dashboard/brand?booked=1");
}
