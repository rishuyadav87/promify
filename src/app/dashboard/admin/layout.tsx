import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// This layout wraps every route under /dashboard/admin/*. Previously each
// admin page repeated its own "if role !== admin, redirect" check
// individually — that worked, but it meant a future admin page would be
// unprotected by default unless someone remembered to copy the same check
// into it. Putting the check here means every current and future page
// under this folder is protected automatically, with no per-page
// boilerplate required.
//
// Existing per-page checks (in page.tsx / actions.ts files under this
// folder) are still fine to leave in place — they're redundant now, not
// harmful, and add a second layer of defense for server actions that can
// be invoked directly without going through this layout.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (viewer?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
