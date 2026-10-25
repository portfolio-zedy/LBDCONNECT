import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SwRegister } from "@/components/lbd/sw-register";

// Locally bundled fonts (no runtime Google Fonts dependency)
import "@fontsource-variable/inter";
import "@fontsource/anton";
import "@fontsource-variable/dancing-script";
import "@fontsource/playfair-display/600-italic.css";

export const metadata: Metadata = {
  title: "LBD Nation Connect — Bethel | The Online Prayer House",
  description:
    "Living by God's Design. Welcome to Bethel — the Online Prayer House. Pray · Grow · Connect · Fulfil.",
  keywords: [
    "LBD Nation Connect",
    "Bethel",
    "Online Prayer House",
    "Living by God's Design",
    "daily prayers",
    "testimonies",
  ],
  icons: {
    icon: "/images/icon-192.png",
    apple: "/images/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LBD Connect",
  },
};

export const viewport: Viewport = {
  themeColor: "#c7590e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
        <SwRegister />
      </body>
    </html>
  );
}
