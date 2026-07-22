import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryIcon } from "@/components/icons/category-icons";
import { ValueBanner } from "@/components/marketing/value-banner";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { getDataVerifiedAt } from "@/lib/programs";

export default function HomePage() {
  const dataVerifiedAt = getDataVerifiedAt();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero — PRD §16.2–16.3 */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Summer Programs Explorer
            </p>
            <h1 className="text-4xl leading-tight font-normal md:text-5xl lg:text-[3.25rem]">
              The summer that changes everything starts here.
            </h1>
            <p className="text-lg leading-relaxed text-[var(--color-text-muted)]">
              Hundreds of programs across science, arts, wilderness, pre-college, and
              more — different prices, deadlines, and selectivity levels with no good way
              to compare them. Groundwork lets you filter by grade, interest, format, and
              budget to build a shortlist in minutes, not hours.
            </p>
            <p className="text-[var(--color-text-muted)]">
              Plus the fine print — acceptance floors, deposit policies, and safety
              records — so you can apply with confidence.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/search"
                className="rounded-[var(--radius-md)] bg-[var(--color-navy)] px-6 py-3 text-sm font-medium text-white no-underline shadow-[var(--shadow-card)] hover:bg-[var(--color-navy-light)]"
              >
                Search programs
              </Link>
              {dataVerifiedAt && (
                <span className="text-sm text-[var(--color-text-muted)]">
                  Data last verified {dataVerifiedAt}
                </span>
              )}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            <Image
              src="/images/hero-desk.png"
              alt="Notebook, calendar, and passport on a desk — doing the groundwork for summer program research"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* Before → after story */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl">From overwhelm to a filtered shortlist</h2>
              <p className="mt-4 text-[var(--color-text-muted)]">
                Dozens of program websites. Incompatible grade systems. Hidden deposit
                policies. Groundwork replaces hours of manual research with filterable
                results in under 90 seconds.
              </p>
              <Link
                href="/search"
                className="mt-6 inline-block font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
              >
                Try the search →
              </Link>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <Image
                src="/images/search-story.png"
                alt="Illustration of scattered program cards organized into a filterable search list"
                fill
                className="object-contain bg-[var(--color-parchment)] p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Hidden details / gotcha layer */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] lg:order-1">
            <Image
              src="/images/hidden-details.png"
              alt="Program card showing hidden details like acceptance rate, deposit policy, and visa information"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold tracking-wide text-[var(--color-amber)] uppercase">
              The hidden details
            </p>
            <h2 className="mt-2 text-3xl">The fine print, surfaced upfront</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">
              Acceptance floors, non-refundable deposits, residency restrictions, and
              safety records — curated from public sources and cited on every program
              card. No surprises after you&apos;ve already invested hours in an
              application.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>• CA-residency requirements (COSMOS)</li>
              <li>• Selectivity floors (MIT RSI)</li>
              <li>• SEVP and safety context (Harvard SSP)</li>
              <li>• Deposit policies that aren&apos;t obvious from the brochure</li>
            </ul>
          </div>
        </section>

        {/* Categories — 12 pathways */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl">Explore program categories</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Twelve pathways. Countless opportunities.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {PROGRAM_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.id}`}
                  className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 text-left no-underline shadow-sm transition hover:border-[var(--color-navy-light)] hover:shadow-[var(--shadow-card)]"
                >
                  <CategoryIcon categoryId={cat.id} className="h-12 w-12" />
                  <div className="min-w-0">
                    <h3 className="text-base text-[var(--color-navy)]">{cat.label}</h3>
                    <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ValueBanner />
      </main>
      <SiteFooter />
    </>
  );
}
