import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { markPayoutSent } from "@/lib/actions/payouts";

// This page lives under /dashboard/admin/*, so AdminLayout
// (src/app/dashboard/admin/layout.tsx) already restricts it to admins --
// no separate role check needed here, same as the other admin pages.
export default async function AdminPayoutsPage() {
  const supabase = createClient();

  const { data: payouts, error } = await supabase
    .from("payouts")
    .select(
      "id, amount, tds_deducted, status, reference, released_at, created_at, campaigns ( id, creators ( id, display_name, user_id ), brands ( company_name ) )",
    )
    .order("created_at", { ascending: true });

  // Payout UPI IDs are keyed by user_id, not creator_id (0023 migration --
  // a person can have two `creators` rows, one per platform, but only one
  // payout destination). campaigns->creators->users->creator_payout_details
  // is one FK hop deeper than PostgREST's nested select can embed
  // automatically, so this fetches them separately and merges by user_id
  // in code -- same pattern the brand dashboard uses for its "latest
  // offer per pending campaign" lookup (src/app/dashboard/brand/page.tsx).
  const creatorUserIds = Array.from(
    new Set(
      (payouts ?? [])
        .map((p) => p.campaigns?.creators?.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: payoutDetails } =
    creatorUserIds.length > 0
      ? await supabase
          .from("creator_payout_details")
          .select("user_id, upi_vpa")
          .in("user_id", creatorUserIds)
      : { data: [] as { user_id: string; upi_vpa: string }[] };
  const upiByUserId = new Map(
    (payoutDetails ?? []).map((d) => [d.user_id, d.upi_vpa]),
  );

  const pending = payouts?.filter((p) => p.status === "pending") ?? [];
  const released = payouts?.filter((p) => p.status === "released") ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Sent manually (UPI/bank transfer) until Razorpay Route is
          available -- see the reference field as the only proof a payout
          actually happened. TDS amounts are entered by hand; this page
          doesn&apos;t calculate tax for you.
        </p>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">No pending payouts.</p>
          </Card>
        )}
        <ul className="flex flex-col gap-3">
          {pending.map((p) => {
            const upiVpa = p.campaigns?.creators?.user_id
              ? upiByUserId.get(p.campaigns.creators.user_id)
              : undefined;
            return (
              <li key={p.id}>
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">
                      {p.campaigns?.brands?.company_name ?? "Unknown brand"} ×{" "}
                      {p.campaigns?.creators?.display_name ?? "Unknown creator"}
                    </span>
                    <Badge variant="teal">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </Badge>
                  </div>

                  {upiVpa ? (
                    <p className="text-sm text-ink">
                      Send to UPI ID:{" "}
                      <span className="font-mono font-medium">{upiVpa}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-error">
                      This creator hasn&apos;t added a payout UPI ID yet --
                      contact them before sending.
                    </p>
                  )}

                  <form
                    action={markPayoutSent}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="payout_id" value={p.id} />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <label
                        htmlFor={`reference_${p.id}`}
                        className="text-sm font-medium text-ink"
                      >
                        Transaction reference (UTR/UPI ref)
                      </label>
                      <input
                        id={`reference_${p.id}`}
                        name="reference"
                        type="text"
                        required
                        placeholder="e.g. 402812345678"
                        className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-1.5 sm:w-40">
                      <label
                        htmlFor={`tds_${p.id}`}
                        className="text-sm font-medium text-ink"
                      >
                        TDS deducted (₹)
                      </label>
                      <input
                        id={`tds_${p.id}`}
                        name="tds_deducted"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={0}
                        className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                      />
                    </div>
                    <Button type="submit" variant="primary">
                      Mark as sent
                    </Button>
                  </form>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Recently released ({released.length})
        </h2>
        {released.length === 0 && (
          <Card>
            <p className="text-sm text-warmgray">None yet.</p>
          </Card>
        )}
        <ul className="flex flex-col gap-3">
          {released.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  {p.campaigns?.brands?.company_name ?? "Unknown brand"} ×{" "}
                  {p.campaigns?.creators?.display_name ?? "Unknown creator"}
                </span>
                <span className="text-sm text-warmgray">
                  ₹{p.amount.toLocaleString("en-IN")} · ref: {p.reference} ·{" "}
                  {p.released_at &&
                    new Date(p.released_at).toLocaleDateString()}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
