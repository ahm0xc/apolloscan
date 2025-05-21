import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import PlausibleProvider from "next-plausible";

import { CookieBanner } from "~/components/cookie-banner";
import { Toaster } from "~/components/ui/toaster";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Apollo Scan",
  description: "An AI-powered fact-checking tool",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable}`}
        suppressHydrationWarning
      >
        <head>
          <PlausibleProvider domain="apolloscan.ai" />
        </head>
        <body className="flex min-h-screen flex-col">
          <TRPCReactProvider>
            <div className="flex-1">{children}</div>
          </TRPCReactProvider>
          <Toaster />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
