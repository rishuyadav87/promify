import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { NegotiationPanel } from "@/components/campaigns/NegotiationPanel";
import { ContentSubmissionPanel } from "@/components/campaigns/ContentSubmissionPanel";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import { autoCompleteExpiredCampaign } from "@/lib/campaignLifecycle";
export default async function BrandCampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: campaignRow, error } = await supabase
    .from("campaigns")
    .select(
      "id, status, price, post_url, brief, measurement_window_ends_at, created_at, brands ( company_name ), creators ( display_name, platform, handle )",
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
          Campaign with {campaign.creators?.display_name ?? "a creator"}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-warmgray">
          {campaign.creators?.platform && (
            <PlatformIcon
              platform={campaign.creators.platform as "instagram" | "youtube"}
              className="h-3.5 w-3.5"
            />
          )}
          {campaign.creators?.platform === "youtube" ? "YouTube" : "Instagram"}{" "}
          · @{campaign.creators?.handle} · Started{" "}
          {new Date(campaign.created_at).toLocaleDateString("en-IN")}
        </p>
      </div>
      {campaign.brief && (
        <Card className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-ink">
            Your content brief
          </h2>
          <p className="whitespace-pre-wrap text-sm text-warmgray">
            {campaign.brief}
          </p>
        </Card>
      )}
      <NegotiationPanel
        campaignId={campaign.id}
        status={campaign.status}
        offers={offers ?? []}
        currentAmount={currentAmount}
        viewerParty="brand"
      />
      <ContentSubmissionPanel
        campaignId={campaign.id}
        status={campaign.status}
        postUrl={campaign.post_url}
        measurementWindowEndsAt={campaign.measurement_window_ends_at}
        price={campaign.price}
        viewerParty="brand"
      />
    </div>
  );
}