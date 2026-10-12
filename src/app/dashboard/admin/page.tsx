import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { statusBadgeVariant } from "@/lib/campaignStatus";
import Link from "next/link";

export default async function AdminDashboardPage() {
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

  const [
    { data: campaigns, error: campaignsError },
    { data: disputes, error: disputesError },
    { count: totalCampaigns },
    { count: activeCampaigns },
    { count: totalCreators },
    { count: totalBrands },
    { count: pendingPayouts },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, status, price, created_at, brands ( company_name ), creators ( display_name )",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("disputes")
      .select(
        "id, reason, status, created_at, campaigns ( id, brands ( company_name ), creators ( display_name ) )",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .in("status", ["accepted", "content_submitted", "live", "measuring"]),
    supabase.from("creators").select("id", { count: "exact", head: true }),
    supabase.from("brands").select("id", { count: "exact", head: true }),
    supabase
      .from("payouts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const stats = [
    {
      label: "Total campaigns",
      value: totalCampaigns ?? 0,
      // The folder is spelled "campains" (missing the g) -- this was
      // linking to "/campaigns" (correctly spelled), which doesn't exist
      // as a route, so clicking this card 404'd. Pointing at the real
      // route rather than renaming the folder, since renaming risks
      // breaking any other reference to the existing URL.
      href: "/dashboard/admin/campains",
      accent: "teal" as const,
    },
    {
      label: "Active campaigns",
      value: activeCampaigns ?? 0,
      href: "/dashboard/admin/campains?filter=active",
      accent: "teal" as const,
    },
    {
      label: "Total creators",
      value: totalCreators ?? 0,
      href: "/dashboard/admin/creators",
      accent: "brick" as const,
    },
    {
      label: "Total brands",
      value: totalBrands ?? 0,
      href: "/dashboard/admin/brands",
      accent: "brick" as const,
    },
    {
      label: "Pending payouts",
      value: pendingPayouts ?? 0,
      href: "/dashboard/admin/payouts",
      accent: "gold" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-warmgray">
          Admin
        </span>
        <h1 className="mt-1 font-display text-2xl text-ink">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Platform-wide view across every campaign, creator, and brand.
        </p>
      </div>

      {/* ── Stats grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block group">
            <div
              className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background:
                  s.accent === "teal"
                    ? "linear-gradient(145deg, rgba(10,42,39,0.7) 0%, rgba(14,12,11,0.9) 100%)"
                    : s.accent === "brick"
                    ? "linear-gradient(145deg, rgba(42,16,8,0.7) 0%, rgba(14,12,11,0.9) 100%)"
                    : "linear-gradient(145deg, rgba(26,21,5,0.7) 0%, rgba(14,12,11,0.9) 100%)",
                border:
                  s.accent === "teal"
                    ? "1px solid rgba(56,185,172,0.2)"
                    : s.accent === "brick"
                    ? "1px solid rgba(220,85,45,0.2)"
                    : "1px solid rgba(201,151,58,0.2)",
                boxShadow:
                  s.accent === "teal"
                    ? "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(56,185,172,0.05)"
                    : s.accent === "brick"
                    ? "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(220,85,45,0.05)"
                    : "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,151,58,0.05)",
              }}
            >
              <p
                className={`font-mono text-3xl font-semibold ${
                  s.accent === "teal"
                    ? "text-gradient-teal"
                    : s.accent === "brick"
                    ? "text-gradient-brick"
                    : "text-gradient-gold"
                }`}
              >
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-warmgray">
                {s.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Admin nav links ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "All campaigns", href: "/dashboard/admin/campains" },
          { label: "Creators", href: "/dashboard/admin/creators" },
          { label: "Brands", href: "/dashboard/admin/brands" },
          { label: "Payouts", href: "/dashboard/admin/payouts" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-xl border border-ink/[0.08] bg-surface/50 px-4 py-3 text-sm font-medium text-warmgray backdrop-blur-sm transition-all hover:border-teal/25 hover:bg-surface/80 hover:text-ink"
          >
            {link.label}
            <svg className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* ── Open disputes ────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">
          Open disputes
          {disputes && disputes.length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brick/20 text-xs font-bold text-brick">
              {disputes.length}
            </span>
          )}
        </h2>
        {disputesError && (
          <p className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {disputesError.message}
          </p>
        )}
        {!disputesError && disputes?.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">No open disputes — all clear.</p>
          </Card>
        )}
        <ul className="flex flex-col gap-3">
          {disputes?.map((d) => (
            <li key={d.id}>
              <div
                className="flex flex-col gap-3 rounded-2xl p-5"
                style={{
                  background: "rgba(42,16,8,0.5)",
                  border: "1px solid rgba(220,85,45,0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {d.campaigns?.brands?.company_name ?? "Unknown brand"} ×{" "}
                    {d.campaigns?.creators?.display_name ?? "Unknown creator"}
                  </span>
                  <Badge variant="brick">{d.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm leading-relaxed text-warmgray">{d.reason}</p>
                <p className="text-xs text-warmgray/60">
                  Opened {new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── All campaigns ────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">All campaigns</h2>
        {campaignsError && (
          <p className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {campaignsError.message}
          </p>
        )}
        {!campaignsError && campaigns?.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">No campaigns yet.</p>
          </Card>
        )}
        <ul className="flex flex-col gap-2">
          {campaigns?.map((c) => (
            <li key={c.id}>
              <div className="flex flex-col gap-2 rounded-2xl border border-ink/[0.07] bg-surface/50 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-ink">
                    {c.brands?.company_name ?? "Unknown brand"} ×{" "}
                    {c.creators?.display_name ?? "Unknown creator"}
                  </span>
                  <span className="text-xs text-warmgray">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadgeVariant(c.status)}>
                    {c.status.replace("_", " ")}
                  </Badge>
                  <span className="font-mono text-sm font-semibold text-ink">
                    ₹{c.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
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