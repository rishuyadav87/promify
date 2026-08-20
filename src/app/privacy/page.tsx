import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Juncture",
  description: "How Juncture (Promify) collects, uses, and protects your data.",
};

// Update this whenever the policy content changes — Google's verification
// reviewers check that this date is current and matches what's described.
const LAST_UPDATED = "August 7, 2026";

// TODO: replace with your real contact email before submitting for
// Google verification — a working contact method is required.
const CONTACT_EMAIL = "support@promify-2w87.vercel.app";

export default function PrivacyPolicyPage() {
  return (
    <>
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink"
        >
          <Image
            src="/logo-icon.png"
            alt=""
            width={56}
            height={56}
            className="h-12 w-12"
          />
          Juncture
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-warmgray">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-10 flex flex-col gap-10 text-ink">
          <Section title="Who we are">
            <p>
              Juncture (operating as Promify) is a marketplace connecting content
              creators with brands for paid promotions. This policy explains
              what information we collect, how we use it, and the choices
              you have.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>When you use Juncture, we collect:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account information</strong> you provide directly,
                such as your email address, display name, and role (creator
                or brand).
              </li>
              <li>
                <strong>Profile information</strong> you choose to add, such
                as your niche, platform handles, and profile links.
              </li>
              <li>
                <strong>Platform statistics</strong> you either self-report
                (for example, Instagram follower counts) or that we retrieve
                directly from a platform you connect via OAuth, such as your
                YouTube subscriber count.
              </li>
              <li>
                <strong>Campaign and negotiation data</strong>, including
                offers, agreed prices, and campaign status, needed to operate
                the marketplace between creators and brands.
              </li>
            </ul>
          </Section>

          <Section title="Google user data">
            <p>
              If you connect a YouTube account, Juncture requests read-only
              access to your channel&apos;s public statistics (such as
              subscriber count) through the YouTube Data API, solely to
              verify your channel and calculate your creator tier. We do not
              request access to upload videos, modify your channel, or
              access private messages.
            </p>
            <p className="mt-3">
              Juncture&apos;s use and transfer of information received from
              Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer noopener"
                className="text-teal underline underline-offset-2 hover:text-teal-hover"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="mt-3">
              You can revoke Juncture&apos;s access to your Google account at any
              time from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer noopener"
                className="text-teal underline underline-offset-2 hover:text-teal-hover"
              >
                Google Account permissions page
              </a>
              . Disconnecting will stop future data refreshes, but does not
              retroactively delete data already stored — see &quot;Your
              choices&quot; below for how to request deletion.
            </p>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To operate your account and authenticate your sessions.</li>
              <li>
                To display your creator profile to brands (or vice versa)
                for the purpose of arranging paid promotions.
              </li>
              <li>
                To calculate creator tiers based on follower/subscriber
                counts.
              </li>
              <li>
                To communicate with you about your account, campaigns, or
                policy changes.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information, and we do not use
              data obtained via Google APIs for advertising purposes.
            </p>
          </Section>

          <Section title="Data storage and security">
            <p>
              Your data is stored with Supabase, using row-level security
              policies so that users can only access data they&apos;re
              authorized to see. Authentication tokens for connected
              platforms are stored securely and are not exposed to the
              client.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can update or remove your profile information, disconnect
              a connected platform account, or request deletion of your
              account and associated data at any time by contacting us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-teal underline underline-offset-2 hover:text-teal-hover"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes
              will be reflected by updating the &quot;Last updated&quot;
              date above.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or your data can be sent to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-teal underline underline-offset-2 hover:text-teal-hover"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-warmgray [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}