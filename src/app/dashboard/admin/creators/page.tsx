import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { setCreatorApproval } from "./actions";

type CreatorRow = {
  id: string;
  user_id: string;
  display_name: string;
  platform: string;
  handle: string;
  follower_count: number;
  tier: string | null;
  niche: string | null;
  youtube_monetized: boolean;
  approved: boolean;
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

  const { data: rows, error } = (await supabase
    .from("creators")
    .select(
      "id, user_id, display_name, platform, handle, follower_count, tier, niche, youtube_monetized, approved, users ( email )",
    )
    .order("follower_count", { ascending: false })) as unknown as {
    data: CreatorRow[] | null;
    error: any;
  };

  const grouped = new Map<string, CreatorRow[]>();
  for (const row of rows ?? []) {
    const existing = grouped.get(row.user_id) ?? [];
    existing.push(row);
    grouped.set(row.user_id, existing);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/admin" className="text-sm text-teal underline">
          ← Back to overview
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          All creators
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Each platform profile must be approved before brands can find or book
          it.
        </p>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      <ul className="flex flex-col gap-4">
        {Array.from(grouped.entries()).map(([userId, platforms]) => (
          <li key={userId}>
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">
                  {platforms[0].display_name}
                </span>
                <span className="text-xs text-warmgray">
                  {platforms[0].users?.email ?? "unknown email"}
                </span>
              </div>

              <ul className="flex flex-col gap-2 border-t border-ink/10 pt-3">
                {platforms.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-ink">
                          {p.platform === "youtube" ? "YouTube" : "Instagram"} ·
                          @{p.handle}
                        </span>
                        {p.tier && (
                          <Badge
                            variant={p.tier === "tier1" ? "brick" : "teal"}
                          >
                            {p.tier === "tier1" ? "Tier 1" : "Tier 2"}
                          </Badge>
                        )}
                        {p.platform === "youtube" && p.youtube_monetized && (
                          <Badge variant="neutral">Monetized</Badge>
                        )}
                        <Badge variant={p.approved ? "teal" : "neutral"}>
                          {p.approved ? "Approved" : "Pending review"}
                        </Badge>
                      </div>
                      <span className="text-xs text-warmgray">
                        {p.follower_count.toLocaleString("en-IN")} followers ·{" "}
                        {p.niche ?? "no niche set"}
                      </span>
                    </div>

                    <form
                      action={setCreatorApproval.bind(null, p.id, !p.approved)}
                    >
                      <Button
                        type="submit"
                        variant={p.approved ? "outline" : "primary"}
                      >
                        {p.approved ? "Unapprove" : "Approve"}
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
