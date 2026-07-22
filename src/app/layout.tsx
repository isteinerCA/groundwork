import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { AppProviders } from "@/components/workspace/app-providers";
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
