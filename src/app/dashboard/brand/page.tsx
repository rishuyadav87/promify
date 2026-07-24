import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Megaphone } from "lucide-react";

export default async function BrandDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brand } = await supabase
    .from("brands")
    .select("company_name, created_at")
    .eq("user_id", user?.id)
    .single();

  // RLS on `campaigns` restricts rows to campaigns owned by this brand.
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, status, price, creator_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-ink">
          {brand?.company_name ?? "Your company"}
        </h2>
        <p className="text-sm text-warmgray">
          Member since{" "}
          {brand?.created_at
            ? new Date(brand.created_at).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })
            : "—"}
        </p>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Your campaigns
        </h1>
        <Button variant="primary">New campaign</Button>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      {!error && campaigns?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-subtle">
            <Megaphone className="h-6 w-6 text-teal" />
          </div>
          <h3 className="text-base font-medium text-ink">No campaigns yet</h3>
          <p className="max-w-sm text-sm text-warmgray">
            Browse creators to start your first promotion.
          </p>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {campaigns?.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-1 rounded-md border border-ink/10 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium capitalize text-ink">
              {c.status.replace("_", " ")}
            </span>
            <span className="text-sm text-warmgray">₹{c.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
