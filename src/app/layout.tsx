import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promify",
  description: "Connecting content creators with brands for paid promotions.",
};

// Explicit responsive viewport — this is a website, rendered in a browser
// on any device, not a native app. It's built mobile-first with Tailwind's
// default breakpoints (sm/md/lg/xl/2xl) throughout.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
