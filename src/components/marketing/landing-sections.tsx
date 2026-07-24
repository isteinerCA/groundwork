import Image from "next/image";
import Link from "next/link";
import { DashboardOverviewPreview } from "@/components/marketing/dashboard-overview-preview";
import { ButtonLink, SectionEyebrow } from "@/components/ui/button-link";
import { btnOutlineOnDark } from "@/components/ui/button-styles";
import { CategoryIcon } from "@/components/icons/category-icons";
import { HOME_CATEGORY_ORDER, PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  formatProgramCatalogLabel,
  MARKETING_PROGRAM_COUNT_LABEL,
} from "@/lib/programs/preview-programs";
import type { Program } from "@/lib/types/program";

export function LandingHero({
  previewPrograms,
}: {
  previewPrograms: Program[];
}) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div className="flex flex-col gap-5">
        <SectionEyebrow>For families with students in grades 6–12</SectionEyebrow>
        <h1 className="text-4xl leading-[1.12] font-normal md:text-5xl lg:text-[3.25rem]">
          The summer that{" "}
          <em className="font-serif italic text-[var(--color-sage)]">changes everything</em> starts
          here.
        </h1>
        <p className="text-lg font-medium leading-relaxed text-[var(--color-navy)]">
          Compare {MARKETING_PROGRAM_COUNT_LABEL} curated summer programs by grade, budget, and
          selectivity — with sourced gotchas on every card — and build a shortlist in about 90
          seconds, free.
        </p>
        <p className="leading-relaxed text-[var(--color-text-muted)]">
          Built for parents researching middle and high school summer programs — not elementary
          camps or gap-year adults. Plus the fine print: acceptance floors, deposit policies, and
          safety records, so you can apply with confidence.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <ButtonLink href="/search">Start your shortlist</ButtonLink>
          <ButtonLink href="#categories" variant="secondary">
            Browse categories
          </ButtonLink>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-sm text-[var(--color-text-muted)]">
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
            No account required to search
          </li>
          <li>{formatProgramCatalogLabel()}</li>
        </ul>
      </div>

      <div className="relative lg:max-w-xl">
        <DashboardOverviewPreview programs={previewPrograms} />
        <div className="absolute -top-3 -right-1 z-10 max-w-[240px] rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-sage)_70%,var(--color-navy-dark))] bg-[var(--color-sage)] p-4 shadow-[0_8px_24px_rgb(151_166_139_/_32%)] ring-2 ring-white/90 sm:-right-4 sm:-top-4">
          <p className="text-lg font-medium leading-snug text-[var(--color-navy-dark)]">
            Make your shortlist in 90 seconds
          </p>
          <p className="mt-2 text-sm leading-snug text-[var(--color-navy-dark)]/80">
            Search, save and track in one place
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>The problem</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">
          A stack of brochures and websites. No way to compare them.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-text)]">
          A fully-funded MIT program accepting 80 students globally sits in the same
          undifferentiated Google results as a $17,800 sleepaway camp with open enrollment.
          Parents and students open dozens of program websites — each formatted differently —
          just to extract the basic facts.
        </p>
        <p className="mt-4 text-lg font-semibold text-[var(--color-navy)]">
          Groundwork replaces that.
        </p>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section id="categories" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <SectionEyebrow>Twelve pathways</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">Explore program categories.</h2>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Twelve pathways. Countless opportunities.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {HOME_CATEGORY_ORDER.map((categoryId) => {
            const cat = PROGRAM_CATEGORIES.find((c) => c.id === categoryId)!;
            return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left no-underline shadow-sm transition hover:border-[var(--color-navy)] hover:shadow-[var(--shadow-card)]"
            >
              <CategoryIcon categoryId={cat.id} className="h-11 w-11 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[var(--color-navy)]">
                  {cat.label}
                </h3>
                <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
                  {cat.description}
                </p>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinePrintSection() {
  return (
    <section
      id="fine-print"
      className="scroll-mt-20 border-y border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
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
          <SectionEyebrow>The fine print</SectionEyebrow>
          <h2 className="mt-3 text-3xl md:text-4xl">
            What the program websites don&apos;t tell you.
          </h2>
          <p className="mt-4 text-[var(--color-text)]">
            Acceptance floors. Non-refundable deposits. Residency restrictions. Safety
            records. Visa certification. We surface the material context on each program
            card — sourced and dated — so you know what you&apos;re signing up for before
            you apply.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--color-text)]">
            {[
              "Acceptance rate & practical selectivity floors",
              "Deposit policies (including non-refundable for aid recipients)",
              "Safety, controversy, and historical concerns — with sources",
              "Residency and visa restrictions",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="font-bold text-[var(--color-amber)]" aria-hidden>
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Filter by what actually matters",
    body: "Grade just completed, category, format, duration, and budget. Multi-select chips — not a wall of dropdowns.",
  },
  {
    num: "02",
    title: "Refine with a plain-English assistant",
    body: "'Only fully funded' or 'in California only' updates your filters in real time. The assistant and chips stay in sync.",
  },
  {
    num: "03",
    title: "Save, compare, and decide",
    body: "Shortlist becomes a tracker: status, deadlines, notes, side-by-side compare, and a shareable link for co-review.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-[var(--color-surface)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-3 text-3xl md:text-4xl">
              From overwhelm to shortlist in under 90 seconds.
            </h2>
            <ol className="mt-10 space-y-8">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-5">
                  <span className="font-serif text-3xl text-[var(--color-amber)]">{step.num}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-navy)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-parchment)]">
            <Image
              src="/images/search-story.png"
              alt="Illustration of scattered program cards organized into a filterable search list"
              fill
              className="object-contain p-4"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const WORKSPACE_FEATURES = [
  {
    title: "Deadline tracking",
    desc: "Never miss a September opening again.",
  },
  {
    title: "Notes per program",
    desc: "Essay topics, alumni contacts, interview prep.",
  },
  {
    title: "Side-by-side compare",
    desc: "Line up finalists on cost, credit, and format.",
  },
  {
    title: "Status pipeline",
    desc: "Researching → Applied → Accepted → Decided.",
  },
];

export function WorkspaceSection() {
  return (
    <section
      id="workspace"
      className="scroll-mt-20 border-y border-[var(--color-border)] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Decision workspace</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl text-3xl md:text-4xl">
          Your shortlist, working alongside you until applications ship.
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-[var(--color-text-muted)]">
          Track status from Researching through Accepted. Enter deadlines, jot notes, and
          compare programs side by side. Missing a September window is the primary failure
          mode for summer programs — this is the workspace built to prevent it.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSPACE_FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
            >
              <h3 className="flex items-start gap-2 font-semibold text-[var(--color-navy)]">
                <span className="mt-0.5 shrink-0 font-bold text-[var(--color-sage)]" aria-hidden>
                  ✓
                </span>
                {item.title}
              </h3>
              <p className="mt-2 pl-6 text-sm text-[var(--color-text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
        <ButtonLink href="/search" variant="secondary" className="mt-8">
          Try search free
        </ButtonLink>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="bg-[var(--color-navy)] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow className="text-[var(--color-amber-soft)]">Do the Groundwork</SectionEyebrow>
        <h2 className="mt-3 text-3xl text-white md:text-4xl">
          Applications open in September. Start now.
        </h2>
        <p className="mt-4 text-lg text-white/90">
          Ninety seconds of filtering beats an evening of open tabs. Bring your child&apos;s
          grade, interests, and rough budget — leave with a real shortlist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/search" variant="primary-on-dark">
            Start your shortlist
          </ButtonLink>
          <Link href="#categories" className={btnOutlineOnDark}>
            See the categories
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AdminSection() {
  return (
    <section className="bg-[var(--color-surface)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>For camp administrators</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Make sure your program is represented accurately.
        </h2>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Add a new program or update an existing listing so families can find accurate
          information about dates, costs, admission, and aid.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact">Add or update program</ButtonLink>
          <ButtonLink href="/search" variant="secondary">
            See current listings
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
