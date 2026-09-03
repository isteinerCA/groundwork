import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { PostAuthRedirect } from "@/components/auth/post-auth-redirect";
import { AppProviders } from "@/components/workspace/app-providers";
import { PlausibleAnalytics } from "@/components/analytics/plausible-analytics";
import { getSiteUrl } from "@/lib/constants/site-url";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-family-serif",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-family-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Groundwork — Summer Programs Explorer",
  description:
    "Filter elite summer programs by grade, interest, format, and budget — with the fine print included.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen antialiased">
        <ClerkProvider
          signInFallbackRedirectUrl="/workspace"
          signUpFallbackRedirectUrl="/workspace"
          signInForceRedirectUrl="/workspace"
          signUpForceRedirectUrl="/workspace"
        >
          <PostAuthRedirect />
          <PlausibleAnalytics />
          <AppProviders>{children}</AppProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}