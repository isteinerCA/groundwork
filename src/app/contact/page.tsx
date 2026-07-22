import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ContactPlaceholderPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl">Report an issue</h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Contact form coming in a later sprint. Email the team with program
          corrections for now.
        </p>
        <Link href="/" className="mt-6 inline-block text-[var(--color-navy-light)]">
          ← Back home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
