import Link from "next/link";
import { MARKETING_PROGRAM_COUNT_LABEL } from "@/lib/programs/preview-programs";

export function ArticleCta() {
  return (
    <aside className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-5 py-4">
      <p className="text-[var(--color-text)]">
        We built Groundwork to make summer program research easier. Compare{" "}
        {MARKETING_PROGRAM_COUNT_LABEL} curated programs by grade, interests, budget, and other
        criteria, and build your shortlist in about 90 seconds. It&apos;s free to use.
      </p>
      <Link
        href="/search"
        className="mt-3 inline-block font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
      >
        Explore summer programs →
      </Link>
    </aside>
  );
}
