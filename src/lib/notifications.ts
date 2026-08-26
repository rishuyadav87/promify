import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Notifies the admin inbox whenever a creator adds a manually-entered
// (unverified) platform, since that's the only path that lands in the
// approval queue -- OAuth-verified platforms are auto-approved and never
// need this. Fire-and-forget: a failed email should never block the
// creator's own request from succeeding.
export async function notifyAdminOfPendingCreator(details: {
  displayName: string;
  platform: string;
  handle: string;
}) {
  try {
    await resend.emails.send({
      from: "Juncture <notifications@juncture.co.in>",
      to: "support@juncture.co.in",
      subject: `New creator pending approval: ${details.displayName}`,
      text: `${details.displayName} added a manual ${details.platform} profile (@${details.handle}) and is waiting for approval.\n\nReview it at https://www.juncture.co.in/dashboard/admin/creators`,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}