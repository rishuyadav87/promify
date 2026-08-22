import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

// Kicks off the "Connect Instagram" flow via Facebook Login for Business —
// Instagram Business accounts are only reachable through a linked Facebook
// Page, so this goes through Facebook's OAuth dialog, not Instagram's own.
// Mirrors src/app/auth/connect/google/route.ts, including the CSRF `state`
// cookie pattern.
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

  const fbUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  fbUrl.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID!);
  fbUrl.searchParams.set("redirect_uri", redirectUri);
  fbUrl.searchParams.set("response_type", "code");
  fbUrl.searchParams.set(
    "scope",
    "instagram_basic,pages_show_list,pages_read_engagement",
  );
  fbUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(fbUrl);
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}