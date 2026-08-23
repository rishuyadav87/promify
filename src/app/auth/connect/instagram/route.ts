import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

// Kicks off "Connect Instagram" via Business Login for Instagram — Meta's
// current, direct Instagram login flow (instagram.com, not facebook.com).
// This replaced the old Facebook-Login-based Instagram integration; it
// uses its own separate Instagram App ID/Secret (from App Dashboard ->
// Instagram -> API setup with Instagram login), not the main Meta App ID.
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: viewer } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (viewer?.role !== "creator") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL(
    "/auth/callback/instagram",
    request.url,
  ).toString();

  const igUrl = new URL("https://www.instagram.com/oauth/authorize");
  igUrl.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID!);
  igUrl.searchParams.set("redirect_uri", redirectUri);
  igUrl.searchParams.set("response_type", "code");
  igUrl.searchParams.set("scope", "instagram_business_basic");
  igUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(igUrl);
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}