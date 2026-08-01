import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type CreatorRow = {
  id: string;
  display_name: string;
  platform: string;
  handle: string;
  follower_count: number;
  tier: string | null;
  niche: string | null;
  oauth_connected: boolean;
  users: { email: string } | null;
};

export default async function AdminCreatorsPage() {
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

  const { data: creators, error } = (await supabase
    .from("creators")
    .select(
      "id, display_name, platform, handle, follower_count, tier, niche, oauth_connected, users ( email )",
    )
    .order("follower_count", { ascending: false })) as unknown as {
    data: CreatorRow[] | null;
    error: any;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/admin" className="text-sm text-teal underline">
          ← Back to overview
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          All creators
        </h1>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      <ul className="flex flex-col gap-3">
        {creators?.map((c) => (
          <li key={c.id}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">
                    {c.display_name}
                  </span>
                  {c.tier && (
                    <Badge variant={c.tier === "tier1" ? "brick" : "teal"}>
                      {c.tier === "tier1" ? "Tier 1" : "Tier 2"}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-warmgray">
                  {c.users?.email ?? "unknown email"}
                </span>
                <span className="text-xs text-warmgray">
                  {c.platform === "youtube" ? "YouTube" : "Instagram"} · @
                  {c.handle} · {c.niche ?? "no niche set"}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-semibold text-ink">
                  {c.follower_count.toLocaleString("en-IN")}
                </p>
                <p className="text-xs uppercase tracking-wide text-warmgray">
                  Followers
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
