import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // RLS grants admins unrestricted select access, so these return every
  // row in the table — no manual filtering needed here.
  const [{ data: campaigns, error: campaignsError }, { data: disputes, error: disputesError }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id, status, price, brand_id, creator_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("disputes")
        .select("id, campaign_id, reason, status, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Open disputes
        </h1>
        {disputesError && (
          <p className="text-sm text-red-600">{disputesError.message}</p>
        )}
        {!disputesError && disputes?.length === 0 && (
          <p className="text-sm text-neutral-600">No open disputes.</p>
        )}
        <ul className="flex flex-col gap-3">
          {disputes?.map((d) => (
            <li
              key={d.id}
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm"
            >
              {d.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Recent campaigns
        </h2>
        {campaignsError && (
          <p className="text-sm text-red-600">{campaignsError.message}</p>
        )}
        <ul className="flex flex-col gap-3">
          {campaigns?.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-1 rounded-md border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium capitalize">
                {c.status.replace("_", " ")}
              </span>
              <span className="text-sm text-neutral-600">₹{c.price}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
