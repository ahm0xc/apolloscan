import type { Metadata } from "next";
import Script from "next/script";

import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";

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
        <body>
          <Script
            defer
            data-domain="apolloscan.ai"
            src="https://plausible.io/js/script.outbound-links.tagged-events.js"
          />
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
