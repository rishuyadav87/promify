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
  const currentUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      currentUserId.current = data.user?.id ?? null;
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUserId = session?.user?.id ?? null;

        if (currentUserId.current === undefined) {
          currentUserId.current = newUserId;
          return;
        }

        if (currentUserId.current !== newUserId) {
          currentUserId.current = newUserId;
          window.location.href = "/login";
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}
