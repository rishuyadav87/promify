import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { statusBadgeVariant } from "@/lib/campaignStatus";
type CampaignRow = {
  id: string;
  status: string;
  price: number;
  created_at: string;
  brands: { company_name: string } | null;
  creators: { display_name: string } | null;
};

type DisputeRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  campaigns: {
    id: string;
    brands: { company_name: string } | null;
    creators: { display_name: string } | null;
  } | null;
};


export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { data: campaigns, error: campaignsError },
    { data: disputes, error: disputesError },
    { count: totalCampaigns },
    { count: activeCampaigns },
    { count: totalCreators },
    { count: totalBrands },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, status, price, created_at, brands ( company_name ), creators ( display_name )",
      )
      .order("created_at", { ascending: false })
      .limit(50) as unknown as Promise<{
      data: CampaignRow[] | null;
      error: any;
    }>,
    supabase
      .from("disputes")
      .select(
        "id, reason, status, created_at, campaigns ( id, brands ( company_name ), creators ( display_name ) )",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }) as unknown as Promise<{
      data: DisputeRow[] | null;
      error: any;
    }>,
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .in("status", ["accepted", "content_submitted", "live", "measuring"]),
    supabase.from("creators").select("id", { count: "exact", head: true }),
    supabase.from("brands").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total campaigns", value: totalCampaigns ?? 0 },
    { label: "Active campaigns", value: activeCampaigns ?? 0 },
    { label: "Total creators", value: totalCreators ?? 0 },
    { label: "Total brands", value: totalBrands ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Platform-wide view across every campaign, creator, and brand.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-1">
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-warmgray">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Open disputes
        </h2>
        {disputesError && (
          <p className="text-sm text-error">{disputesError.message}</p>
        )}
        {!disputesError && disputes?.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">No open disputes.</p>
          </Card>
        )}
        <ul className="flex flex-col gap-3">
          {disputes?.map((d) => (
            <li key={d.id}>
              <Card className="flex flex-col gap-2 border-brick/30 bg-brick-subtle">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">
                    {d.campaigns?.brands?.company_name ?? "Unknown brand"} ×{" "}
                    {d.campaigns?.creators?.display_name ?? "Unknown creator"}
                  </span>
                  <Badge variant="brick">{d.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-warmgray">{d.reason}</p>
                <p className="text-xs text-warmgray">
                  Opened {new Date(d.created_at).toLocaleDateString()}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          All campaigns
        </h2>
        {campaignsError && (
          <p className="text-sm text-error">{campaignsError.message}</p>
        )}
        {!campaignsError && campaigns?.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">No campaigns yet.</p>
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
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadgeVariant(c.status)}>
                    {c.status.replace("_", " ")}
                  </Badge>
                  <span className="text-sm font-medium text-ink">
                    ₹{c.price.toLocaleString()}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
        {campaigns && campaigns.length === 50 && (
          <p className="text-xs text-warmgray">
            Showing the 50 most recent campaigns.
          </p>
        )}
      </section>
    </div>
  );
}
