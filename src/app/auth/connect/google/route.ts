import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

// Kicks off the "Connect YouTube" flow: sends the creator to Google's
// consent screen. A random `state` value is stored in a short-lived cookie
// and checked again in the callback route — this is standard OAuth CSRF
// protection, stopping someone from tricking a logged-in user into
// connecting an account they didn't choose.
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
  const redirectUri = new URL("/auth/callback/google", request.url).toString();

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/youtube.readonly",
  );
  googleUrl.searchParams.set("access_type", "online");
  googleUrl.searchParams.set("prompt", "consent");
  googleUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
