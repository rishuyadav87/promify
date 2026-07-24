import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardIndexPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // The `users` row is created by the handle_new_user trigger on signup
  // (see supabase/migrations/0001_init.sql), so it should always exist
  // by the time someone reaches the dashboard.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  switch (profile?.role) {
    case "creator":
      redirect("/dashboard/creator");
    case "brand":
      redirect("/dashboard/brand");
    case "admin":
      redirect("/dashboard/admin");
    default:
      redirect("/login");
  }
}
