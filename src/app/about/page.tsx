import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataVerifiedAt } from "@/lib/programs";

const CAVEATS = [
  "This isn't a complete list. There are hundreds of summer programs out there, and new ones launch every year. We've focused on programs we came across in our own research, not an exhaustive catalog.",
  "Details change. Dates, pricing, eligibility requirements, and application deadlines shift year to year — sometimes mid-season. What's listed here reflects what was publicly posted at the time we last checked, not a live feed from each program.",
  "Always verify before you apply. Click through to the program's official website to confirm current details before you commit time or money. Treat this list as a starting point for your research, not a final answer.",
  "Most programs don't publish exact acceptance rates. We estimated competitiveness based on how programs describe themselves. Free and fully funded programs are usually the most competitive, since funding (not payment) caps the seats.",
] as const;

export default function AboutPage() {
  const verifiedAt = getDataVerifiedAt();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-3xl md:text-4xl">About Groundwork</h1>
        {verifiedAt && (
          <p className="mt-3 text-sm font-medium text-[var(--color-amber)]">
            Program data last verified: {verifiedAt}
          </p>
        )}

        <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--color-text)]">
          <p>
            Groundwork started the way most useful things do, out of our own frustration. As
            parents, we spent hours every year cross-referencing dates, costs, eligibility and
            application deadlines across dozens of scattered program websites. Even after going
            through this overwhelming process, we often felt that we didn&apos;t have the full
            picture. We built the tool we wished had existed.
          </p>
          <p>
            Groundwork is for families with kids in grades 6–12 who are seriously comparing summer
            options, whether that&apos;s a fully-funded STEM research program, a marine biology
            field course, or a college-credit intensive. It&apos;s built for the comparison stage
            of the process, not just browsing for ideas.
          </p>
          <p>
            Every program on Groundwork is curated and researched by us, not submitted or paid for
            by program providers. We give you the ability to filter over 140 programs based on your
            own criteria and needs, creating a shortlist that works for you in as little as 90
            seconds. We flag our sources, note when pricing or details couldn&apos;t be confirmed,
            and tell you when something needs a second look before you apply. Groundwork is never
            sponsored, and no program can pay to be listed, ranked, or featured. That said, a few
            honest caveats:
          </p>
          <ul className="list-disc space-y-3 pl-5 text-[var(--color-text-muted)]">
            {CAVEATS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            If you spot something outdated, missing, or just plain wrong,{" "}
            <Link href="/contact" className="font-medium text-[var(--color-navy-light)]">
              contact us or report an issue
            </Link>
            .
          </p>
        </div>

        <Link href="/search" className="mt-10 inline-block text-sm text-[var(--color-navy-light)]">
          Start your shortlist →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
