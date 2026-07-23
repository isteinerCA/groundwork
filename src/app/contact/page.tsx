"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ContactForm } from "@/components/contact/contact-form";

function ContactPageContent() {
  const params = useSearchParams();
  const initialProgram = params.get("program") ?? "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Add or update a program
        </p>
        <h1 className="mt-2 text-3xl">Report an issue</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Spot outdated info, disagree with a flag, or want a program added? Send us the
          details and we&apos;ll follow up per the response times below.
        </p>
        <ContactForm initialProgramName={initialProgram} />
        <Link href="/" className="mt-8 inline-block text-sm text-[var(--color-navy-light)]">
          ← Back home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main className="px-6 py-16 text-center">Loading…</main>}>
      <ContactPageContent />
    </Suspense>
  );
}
