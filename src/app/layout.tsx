import type { Metadata, Viewport } from "next";
import "./globals.css";
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
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthSyncListener />
        {children}
      </body>
    </html>
  );
}
