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
  const fbError = searchParams.get("error");

  if (fbError) {
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

  // Exchange the authorization code for a user access token.
  const tokenUrl = new URL(
    "https://graph.facebook.com/v21.0/oauth/access_token",
  );
  tokenUrl.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID!);
  tokenUrl.searchParams.set(
    "client_secret",
    process.env.INSTAGRAM_CLIENT_SECRET!,
  );
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Instagram didn't accept that connection. Please try again.",
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return redirectWithMessage(
      request,
      "error",
      "Instagram didn't return an access token. Please try again.",
    );
  }

  // An Instagram Business account can only be reached through its linked
  // Facebook Page — there's no way to query it directly by the user's own
  // token, so we look up which Page(s) this user manages first.
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${tokenData.access_token}`,
  );

  if (!pagesRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Couldn't read your Facebook Pages. Please try again.",
    );
  }

  const pagesData = await pagesRes.json();
  const pageWithInstagram = (pagesData.data ?? []).find(
    (page: { instagram_business_account?: { id: string } }) =>
      page.instagram_business_account?.id,
  );

  const igUserId = pageWithInstagram?.instagram_business_account?.id;

  if (!igUserId) {
    return redirectWithMessage(
      request,
      "error",
      "No Instagram Business account found. Make sure your Instagram is set to Business, and linked to a Facebook Page.",
    );
  }

  const igRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}?fields=username,followers_count&access_token=${tokenData.access_token}`,
  );

  if (!igRes.ok) {
    return redirectWithMessage(
      request,
      "error",
      "Couldn't read your Instagram profile. Please try again.",
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
    tier,
  };

  // Service-role write, same reasoning as the YouTube callback: migration
  // 0018 now blocks a normal user session from writing oauth_connected or
  // follower_count on an Instagram row directly.
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