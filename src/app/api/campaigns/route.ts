import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/campaigns
 * Brand-only: creates a new campaign proposal for a creator.
 * RLS's campaigns_insert_brand policy (see the migration) independently
 * enforces that brand_id must belong to the caller, so this check is a
 * fast-fail for a clearer error message — it is not the security boundary.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const {
    creator_id,
    price,
    expected_range_low,
    expected_range_high,
    requires_approval,
    usage_rights,
  } = body;

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!brand) {
    return NextResponse.json(
      { error: "Only brand accounts can create campaigns" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: brand.id,
      creator_id,
      price,
      expected_range_low,
      expected_range_high,
      requires_approval,
      usage_rights,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
