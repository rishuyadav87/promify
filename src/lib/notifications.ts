import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = "https://www.juncture.co.in";

// Every lookup below goes through the service-role client rather than
// whatever session called the triggering action. RLS on `users`/`creators`/
// `brands` only lets a session read its own row -- but a notification
// almost always needs to reach the OTHER person (e.g. telling a creator
// about a brand's offer), so this deliberately bypasses RLS the same way
// the OAuth callbacks already do, rather than depending on the caller's
// own restricted session to happen to have visibility into the other party.
async function getUserEmail(userId: string): Promise<string | null> {
  const serviceRoleClient = createServiceRoleClient();
  const { data } = await serviceRoleClient
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  return data?.email ?? null;
}

async function resolveCampaignParties(brandId: string, creatorId: string) {
  const serviceRoleClient = createServiceRoleClient();
  const [{ data: creator }, { data: brand }] = await Promise.all([
    serviceRoleClient
      .from("creators")
      .select("user_id, display_name")
      .eq("id", creatorId)
      .maybeSingle(),
    serviceRoleClient
      .from("brands")
      .select("user_id, company_name")
      .eq("id", brandId)
      .maybeSingle(),
  ]);
  return { creator, brand };
}

async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
}) {
  try {
    await resend.emails.send({
      from: "Juncture <notifications@juncture.co.in>",
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
  } catch (error) {
    // A failed email is never allowed to roll back or block the action
    // that triggered it -- by the time any of these run, the booking,
    // offer, or approval has already succeeded.
    console.error("Failed to send notification email:", error);
  }
}

export async function notifyAdminOfPendingCreator(details: {
  displayName: string;
  platform: string;
  handle: string;
}) {
  await sendEmail({
    to: "support@juncture.co.in",
    subject: `New creator pending approval: ${details.displayName}`,
    text: `${details.displayName} added a manual ${details.platform} profile (@${details.handle}) and is waiting for approval.\n\nReview it at ${APP_URL}/dashboard/admin/creators`,
  });
}

export async function notifyCreatorApproved(creatorUserId: string) {
  const email = await getUserEmail(creatorUserId);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: "Your profile is approved on Juncture",
    text: `Good news — your creator profile has been approved. Brands can now see and book you on Juncture.\n\nView your profile: ${APP_URL}/dashboard/creator/profile`,
  });
}

export async function notifyNewBooking(details: {
  creatorId: string;
  brandId: string;
  price: number;
  campaignId: string;
}) {
  const { creator, brand } = await resolveCampaignParties(
    details.brandId,
    details.creatorId,
  );
  if (!creator?.user_id) return;
  const email = await getUserEmail(creator.user_id);
  if (!email) return;
  const brandName = brand?.company_name ?? "A brand";
  await sendEmail({
    to: email,
    subject: `New booking request from ${brandName}`,
    text: `${brandName} wants to book you for a promotion at ₹${details.price.toLocaleString("en-IN")}.\n\nView and respond: ${APP_URL}/dashboard/creator/campaigns/${details.campaignId}`,
  });
}

export async function notifyCounterOffer(details: {
  campaignId: string;
  brandId: string;
  creatorId: string;
  offeredBy: "creator" | "brand";
  amount: number;
}) {
  const { creator, brand } = await resolveCampaignParties(
    details.brandId,
    details.creatorId,
  );
  const recipient = details.offeredBy === "creator" ? brand : creator;
  const path = details.offeredBy === "creator" ? "brand" : "creator";
  if (!recipient?.user_id) return;
  const email = await getUserEmail(recipient.user_id);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: "New counter-offer on your Juncture campaign",
    text: `You've received a counter-offer of ₹${details.amount.toLocaleString("en-IN")}.\n\nView and respond: ${APP_URL}/dashboard/${path}/campaigns/${details.campaignId}`,
  });
}

export async function notifyOfferResolved(details: {
  campaignId: string;
  brandId: string;
  creatorId: string;
  actedBy: "creator" | "brand";
  status: "accepted" | "declined";
}) {
  const { creator, brand } = await resolveCampaignParties(
    details.brandId,
    details.creatorId,
  );
  const recipient = details.actedBy === "creator" ? brand : creator;
  const path = details.actedBy === "creator" ? "brand" : "creator";
  if (!recipient?.user_id) return;
  const email = await getUserEmail(recipient.user_id);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Your offer was ${details.status}`,
    text: `The other side has ${details.status} the offer on your campaign.\n\nView details: ${APP_URL}/dashboard/${path}/campaigns/${details.campaignId}`,
  });
}

export async function notifyDisputeRaised(details: {
  campaignId: string;
  brandId: string;
  creatorId: string;
  reason: string;
}) {
  const { creator } = await resolveCampaignParties(
    details.brandId,
    details.creatorId,
  );
  if (!creator?.user_id) return;
  const email = await getUserEmail(creator.user_id);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: "An issue was reported on your campaign",
    text: `The brand has reported an issue with your submitted content:\n\n"${details.reason}"\n\nYou can resubmit corrected content here: ${APP_URL}/dashboard/creator/campaigns/${details.campaignId}`,
  });
}

// Checks internally whether this campaign ever had a dispute -- a normal
// completion with no dispute history shouldn't send this email, so the
// caller (confirmSatisfaction) doesn't need to know or check that itself.
export async function notifyIfDisputeResolved(details: {
  campaignId: string;
  brandId: string;
  creatorId: string;
}) {
  const serviceRoleClient = createServiceRoleClient();
  const { data: existingDispute } = await serviceRoleClient
    .from("disputes")
    .select("id")
    .eq("campaign_id", details.campaignId)
    .maybeSingle();
  if (!existingDispute) return;

  const { creator, brand } = await resolveCampaignParties(
    details.brandId,
    details.creatorId,
  );

  if (creator?.user_id) {
    const email = await getUserEmail(creator.user_id);
    if (email) {
      await sendEmail({
        to: email,
        subject: "Dispute resolved on your campaign",
        text: `The reported issue on your campaign has been resolved and the campaign is now complete.\n\nView details: ${APP_URL}/dashboard/creator/campaigns/${details.campaignId}`,
      });
    }
  }
  if (brand?.user_id) {
    const email = await getUserEmail(brand.user_id);
    if (email) {
      await sendEmail({
        to: email,
        subject: "Dispute resolved on your campaign",
        text: `The issue you reported has been resolved and the campaign is now complete.\n\nView details: ${APP_URL}/dashboard/brand/campaigns/${details.campaignId}`,
      });
    }
  }
}