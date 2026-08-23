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
  url.searchParams.set("instagram_connect", status);
  url.searchParams.set("message", message);
  const response = NextResponse.redirect(url);
  response.cookies.delete("instagram_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const igError = searchParams.get("error");

  if (igError) {
    return redirectWithMessage(
      request,
      "error",
      "Instagram sign-in was cancelled.",
    );
  }

  const expectedState = request.cookies.get("instagram_oauth_state")?.value;
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

  const redirectUri = new URL(
    "/auth/callback/instagram",
    request.url,
  ).toString();

  // Step 1: exchange the code for a short-lived Instagram user access token.
  // Instagram's token endpoint expects a form-encoded POST body, not JSON.
  const tokenBody = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody,
  });

  if (!tokenRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Instagram didn't accept that connection. Please try again.",
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    user_id?: string;
  };

  if (!tokenData.access_token) {
    return redirectWithMessage(
      request,
      "error",
      "Instagram didn't return an access token. Please try again.",
    );
  }

  // Step 2: fetch the profile directly -- no Facebook Page lookup needed
  // with this flow, unlike the old Facebook-Login-based Instagram API.
  const igRes = await fetch(
    `https://graph.instagram.com/me?fields=user_id,username,followers_count&access_token=${tokenData.access_token}`,
  );

  if (!igRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Couldn't read your Instagram profile. Make sure it's set to a Business account.",
    );
  }

  const igData = await igRes.json();
  const followerCount = Number(igData.followers_count ?? 0);
  const handle: string = igData.username ?? "instagram_creator";

  const { data: existing } = await supabase
    .from("creators")
    .select("display_name")
    .eq("user_id", user.id)
    .eq("platform", "instagram")
    .maybeSingle();

  const tier = getEligibleTier("instagram", followerCount);

  const creatorUpsert: Database["public"]["Tables"]["creators"]["Insert"] = {
    user_id: user.id,
    platform: "instagram",
    display_name: existing?.display_name ?? handle,
    handle,
    follower_count: followerCount,
    oauth_connected: true,
    // OAuth-verified data is already confirmed real, unlike a manual
    // entry -- skip the admin review queue for these.
    approved: true,
    tier,
  };

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("creators")
    .upsert(creatorUpsert, { onConflict: "user_id,platform" });

  if (error) {
    return redirectWithMessage(
      request,
      "error",
      "Saved your Instagram connection, but couldn't update your profile. Please try again.",
    );
  }

  return redirectWithMessage(
    request,
    "success",
    `Connected! Synced ${followerCount.toLocaleString("en-IN")} followers from Instagram.`,
  );
}