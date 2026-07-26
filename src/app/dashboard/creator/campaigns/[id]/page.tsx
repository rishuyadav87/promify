import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NegotiationPanel } from "@/components/campaigns/NegotiationPanel";
import { ContentSubmissionPanel } from "@/components/campaigns/ContentSubmissionPanel";
import { autoCompleteExpiredCampaign } from "@/lib/campaignLifecycle";
export default async function CreatorCampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: campaignRow, error } = await supabase
    .from("campaigns")
    .select(
      "id, status, price, post_url, measurement_window_ends_at, created_at, brands ( company_name )",
    )
    .eq("id", params.id)
    .single();
  if (error || !campaignRow) notFound();

  const campaign = {
    ...campaignRow,
    status: await autoCompleteExpiredCampaign(supabase, campaignRow),
  };

  const { data: offers } = await supabase
    .from("campaign_offers")
    .select("id, offered_by, amount, created_at")
    .eq("campaign_id", params.id)
    .order("created_at", { ascending: false });

  const currentAmount = offers?.[0]?.amount ?? campaign.price;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Campaign with {campaign.brands?.company_name ?? "a brand"}
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Started {new Date(campaign.created_at).toLocaleDateString()}
        </p>
      </div>
      <NegotiationPanel
        campaignId={campaign.id}
        status={campaign.status}
        offers={offers ?? []}
        currentAmount={currentAmount}
        viewerParty="creator"
      />
      <ContentSubmissionPanel
        campaignId={campaign.id}
        status={campaign.status}
        postUrl={campaign.post_url}
        measurementWindowEndsAt={campaign.measurement_window_ends_at}
        price={campaign.price}
        viewerParty="creator"
      />
    </div>
  );
}
