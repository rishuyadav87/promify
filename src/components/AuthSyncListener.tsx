"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Cookie-based sessions are shared across every tab in the same browser.
// If you log into a different account in another tab, this tab's session
// changes underneath it. Rather than silently switching this tab over to
// the new account (or leaving it showing stale data from the old one),
// this sends the tab straight to the login screen the moment it detects
// the switch.
export function AuthSyncListener() {
  // Tracks the user ID this tab currently considers "logged in as," so we
  // can tell a real account switch (fires again later, mid-session) apart
  // from this tab's own first sign-in. Starts null; the very first event
  // this listener receives is always Supabase's INITIAL_SESSION report of
  // whatever session already existed when the page loaded, which we skip
  // below -- so by the time we're comparing against a previous value here,
  // that value is trustworthy rather than a guess about network timing.
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // INITIAL_SESSION fires once, immediately, reporting whatever
        // session already existed on page load -- it is not a change and
        // must never trigger a redirect. This is what previously raced
        // against a fresh login's own redirect to /dashboard: relying on
        // a manually-fetched getUser() call to establish the "before"
        // state could resolve either before or after this event, so
        // sometimes a brand-new sign-in looked identical to a real
        // account switch. Checking the event name directly removes that
        // race entirely.
        if (event === "INITIAL_SESSION") {
          currentUserId.current = session?.user?.id ?? null;
          return;
        }

        const newUserId = session?.user?.id ?? null;

        // Only force this tab to /login when its session silently swapped
        // to a DIFFERENT logged-in account underneath it -- e.g. someone
        // signed into another account in a second tab while this tab was
        // still showing the previous account's dashboard data on screen.
        // A session simply expiring or a normal sign-out (newUserId is
        // null) is NOT treated as a hostile switch: that's just "logged
        // out," and forcing every open tab -- including someone just
        // browsing the marketing homepage with a stale old cookie -- over
        // to /login for that is disruptive and unnecessary. The page will
        // already reflect the logged-out state correctly on its own.
        if (
          currentUserId.current !== null &&
          newUserId !== null &&
          currentUserId.current !== newUserId
        ) {
          currentUserId.current = newUserId;
          window.location.href = "/login";
          return;
        }

        currentUserId.current = newUserId;
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}