import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { statusBadgeVariant } from "@/lib/campaignStatus";

const ACTIVE_STATUSES = [
  "accepted",
  "content_submitted",
  "live",
  "measuring",
] as const;

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
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
  if (viewer?.role !== "admin") redirect("/dashboard");

  const isActiveFilter = searchParams.filter === "active";

  let query = supabase
    .from("campaigns")
    .select(
      "id, status, price, created_at, brands ( company_name ), creators ( display_name )",
    )
    .order("created_at", { ascending: false });

  if (isActiveFilter) {
    query = query.in("status", ACTIVE_STATUSES);
  }

  const { data: campaigns, error } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/admin" className="text-sm text-teal underline">
          ← Back to overview
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {isActiveFilter ? "Active campaigns" : "All campaigns"}
        </h1>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}
      {!error && campaigns?.length === 0 && (
        <Card>
          <p className="text-sm text-warmgray">No campaigns to show.</p>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {campaigns?.map((c) => (
          <li key={c.id}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">
                  {c.brands?.company_name ?? "Unknown brand"} ×{" "}
                  {c.creators?.display_name ?? "Unknown creator"}
                </span>
                <span className="text-xs text-warmgray">
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusBadgeVariant(c.status)}>
                  {c.status.replace("_", " ")}
                </Badge>
                <span className="text-sm font-medium text-ink">
                  ₹{c.price.toLocaleString("en-IN")}
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}