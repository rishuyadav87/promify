import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { getEligibleTier } from "@/lib/pricing";
import type { Database } from "@/lib/types/database.types";

const PROFILE_PATH = "/dashboard/creator/profile";

function redirectWithMessage(
  request: NextRequest,
  status: "success" | "error",
  message: string,
) {
  const url = new URL(PROFILE_PATH, request.url);
  url.searchParams.set("youtube_connect", status);
  url.searchParams.set("message", message);
  const response = NextResponse.redirect(url);
  response.cookies.delete("google_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const googleError = searchParams.get("error");

  if (googleError) {
    return redirectWithMessage(
      request,
      "error",
      "Google sign-in was cancelled.",
    );
  }

  const expectedState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !returnedState || returnedState !== expectedState) {
    return redirectWithMessage(
      request,
      "error",
      "Couldn't verify this request. Please try connecting again.",
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectUri = new URL("/auth/callback/google", request.url).toString();

  // Exchange the authorization code for an access token.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Google didn't accept that connection. Please try again.",
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return redirectWithMessage(
      request,
      "error",
      "Google didn't return an access token. Please try again.",
    );
  }

  // Fetch the signed-in user's own channel — "mine=true" scopes this to
  // whichever Google account just completed the consent screen.
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
  );

  if (!channelRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Couldn't read your YouTube channel. Please try again.",
    );
  }

  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  if (!channel) {
    return redirectWithMessage(
      request,
      "error",
      "No YouTube channel found on that Google account.",
    );
  }

  if (channel.statistics?.hiddenSubscriberCount) {
    return redirectWithMessage(
      request,
      "error",
      "Your subscriber count is set to private on YouTube. Make it public in YouTube Studio, then try connecting again.",
    );
  }

  const subscriberCount = Number(channel.statistics?.subscriberCount ?? 0);
  const displayName: string = channel.snippet?.title ?? "YouTube Creator";
  const handle: string =
    channel.snippet?.customUrl?.replace(/^@/, "") ?? channel.id;

  // Preserve any monetization checkbox the creator already set manually —
  // the read-only scope we use here can't tell us monetization status.
  const { data: existing } = await supabase
    .from("creators")
    .select("youtube_monetized")
    .eq("user_id", user.id)
    .eq("platform", "youtube")
    .maybeSingle();

  const youtubeMonetized = existing?.youtube_monetized ?? false;
  const tier = getEligibleTier("youtube", subscriberCount, youtubeMonetized);

  const creatorUpsert: Database["public"]["Tables"]["creators"]["Insert"] = {
    user_id: user.id,
    platform: "youtube",
    display_name: displayName,
    handle,
    follower_count: subscriberCount,
    oauth_connected: true,
    youtube_monetized: youtubeMonetized,
    tier,
  };

  // This specific write uses the service-role client, not the regular
  // session client used everywhere else in this route. It's the one
  // place in the app allowed to bypass RLS, because a database trigger
  // (0014_protect_youtube_verified_columns.sql) now blocks a normal user
  // session from setting oauth_connected or follower_count on a YouTube
  // row directly -- this route is the only legitimate path left that can
  // still write them, precisely because everything above this line has
  // already independently verified the data with Google's own API.
  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("creators")
    .upsert(creatorUpsert, { onConflict: "user_id,platform" });

  if (error) {
    return redirectWithMessage(
      request,
      "error",
      "Saved your Google connection, but couldn't update your profile. Please try again.",
    );
  }

  return redirectWithMessage(
    request,
    "success",
    `Connected! Synced ${subscriberCount.toLocaleString("en-IN")} subscribers from YouTube.`,
  );
}