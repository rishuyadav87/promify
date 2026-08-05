import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthSyncListener } from "@/components/AuthSyncListener";

export const metadata: Metadata = {
  title: "Creo",
  description: "Connecting content creators with brands for paid promotions.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthSyncListener />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
