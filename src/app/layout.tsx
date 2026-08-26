import type { Metadata, Viewport } from "next";
import { Zilla_Slab, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthSyncListener } from "@/components/AuthSyncListener";

// Three type roles, replacing the previous system-default font stack:
// - Display (Zilla Slab): headlines only. A true slab serif ties back to
//   the "brick" side of the Two Sides palette — stamped, pressed letterforms
//   rather than the geometric sans nearly every SaaS/AI-generated site
//   reaches for by default.
// - Body (IBM Plex Sans): everything else. Sturdy, readable, and distinct
//   from the ubiquitous Inter.
// - Mono (IBM Plex Mono): prices and other numeric/data values specifically
//   — gives money figures a ledger feel appropriate to a marketplace,
//   applied selectively rather than as a global body font.
const displayFont = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juncture",
  description: "Connecting content creators with brands for paid promotions.",
  openGraph: {
    title: "Juncture",
    description: "Connecting content creators with brands for paid promotions.",
    url: "https://www.juncture.co.in",
    siteName: "Juncture",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <AuthSyncListener />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}