import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

// This is a SEPARATE route from src/app/auth/callback/google/route.ts on
// purpose. That one handles connecting a YouTube account to an existing
// creator profile (different scopes, different purpose). This one handles
// the actual "Sign in / Sign up with Google" flow. Keeping them apart
// avoids two very different flows sharing one URL and one file.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Only present on first-time signup, passed through from the button on
  // the signup page (see the role toggle there) -- absent for a normal
  // login, since an existing user's role is already decided.
  const intendedRole = requestUrl.searchParams.get("role");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  // handle_new_user() (see supabase/migrations/0008) always assigns a
  // fresh signup 'creator' by default, because Google's OAuth response
  // has no way to carry the role-toggle choice the way a normal signup's
  // form data does. If the person actually picked "brand" on the signup
  // page, we correct that here.
  //
  // This uses the service-role client deliberately -- not the regular
  // session client -- because 0007 intentionally removed the ability for
  // a user's own session to change their own role (that was the
  // privilege-escalation hole). This correction only runs for a person's
  // own account, immediately after Google confirms their identity, and
  // only within a couple of minutes of the account being created, so it
  // can't be reused later as a way to self-promote to a different role.
  if (intendedRole === "brand") {
    const createdAt = new Date(user.created_at).getTime();
    const isFreshSignup = Date.now() - createdAt < 2 * 60 * 1000;

    if (isFreshSignup) {
      const serviceClient = createServiceRoleClient();
      const { data: userRow } = await serviceClient
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userRow?.role === "creator") {
        await serviceClient
          .from("users")
          .update({ role: "brand" })
          .eq("id", user.id);
        // handle_new_user() already inserted a placeholder `creators` row
        // for the default 'creator' role -- remove it now that this
        // account is actually a brand, and create the real `brands` row
        // that should have been created in the first place.
        await serviceClient.from("creators").delete().eq("user_id", user.id);
        await serviceClient
          .from("brands")
          .insert({ user_id: user.id, company_name: user.email ?? "New brand" });
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
