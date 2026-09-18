import Link from "next/link";
import { MARKETING_OFFERING_COUNT_LABEL } from "@/lib/programs/preview-programs";
import { OPEN_SEARCH_HREF } from "@/lib/search/search-url";
import { cn } from "@/lib/utils";

type InspiredTopic = {
  label: string;
  href: string;
  typeClass: string;
  rotateClass: string;
  bgClass: string;
};

const LIST = (slug: string) => `/resources/lists/${slug}`;

const INSPIRED_TOPICS: InspiredTopic[] = [
  {
    label: "Scuba diving",
    href: LIST("scuba-programs"),
    typeClass: "text-[0.95rem] font-medium tracking-tight sm:text-base",
    rotateClass: "rotate-2",
    bgClass: "bg-[var(--color-parchment)]",
  },
  {
    label: "Japan",
    href: LIST("japan-programs"),
    typeClass: "font-serif text-2xl italic",
    rotateClass: "-rotate-1",
    bgClass: "bg-[var(--color-sage-soft)]",
  },
  {
    label: "International relations abroad",
    href: LIST("international-relations-diplomacy-programs"),
    typeClass: "font-serif text-base italic leading-snug sm:text-lg",
    rotateClass: "-rotate-[1.5deg]",
    bgClass: "bg-[color-mix(in_srgb,#b7a4c4_26%,white)]",
  },
  {
    label: "Theater (US)",
    href: LIST("theater-us-programs"),
    typeClass: "text-lg italic tracking-tight",
    rotateClass: "-rotate-2",
    bgClass: "bg-[var(--color-parchment-dark)]",
  },
  {
    label: "Sea Turtles abroad",
    href: LIST("sea-turtle-programs"),
    typeClass: "font-serif text-xl italic sm:text-[1.35rem]",
    rotateClass: "-rotate-2",
    bgClass: "bg-[color-mix(in_srgb,#7a9a9e_22%,white)]",
  },
  {
    label: "Kilimanjaro",
    href: LIST("kilimanjaro-programs"),
    typeClass: "font-serif text-lg tracking-wide sm:text-xl",
    rotateClass: "rotate-1",
    bgClass: "bg-white",
  },
  {
    label: "Entrepreneurship (US)",
    href: LIST("entrepreneurship-us-programs"),
    typeClass: "text-xs font-semibold tracking-[0.14em] uppercase",
    rotateClass: "rotate-[1.5deg]",
    bgClass: "bg-[color-mix(in_srgb,var(--color-sage)_28%,white)]",
  },
  {
    label: "AI (US)",
    href: LIST("ai-us-programs"),
    typeClass: "text-sm font-semibold tracking-[0.18em] uppercase",
    rotateClass: "rotate-1",
    bgClass: "bg-[color-mix(in_srgb,#c4a574_24%,var(--color-parchment))]",
  },
  {
    label: "Wildlife conservation abroad",
    href: LIST("conservation-programs"),
    typeClass: "font-serif text-base leading-snug sm:text-lg",
    rotateClass: "rotate-1",
    bgClass: "bg-[color-mix(in_srgb,var(--color-amber)_20%,var(--color-parchment))]",
  },
  {
    label: "International relations (US)",
    href: LIST("international-relations-diplomacy-us-programs"),
    typeClass: "font-serif text-base italic leading-snug sm:text-lg",
    rotateClass: "-rotate-[1.5deg]",
    bgClass: "bg-[color-mix(in_srgb,#d4a5a5_26%,white)]",
  },
];

function DreamBubble({ topic }: { topic: InspiredTopic }) {
  return (
    <Link
      href={topic.href}
      aria-label={`${topic.label} programs`}
      className={cn(
        "inline-flex min-h-[3.25rem] max-w-[12.5rem] items-center justify-center rounded-[2.25rem] px-4 py-2.5 text-center text-[var(--color-navy)] no-underline shadow-[0_8px_24px_rgb(0_0_0_/_18%)] ring-1 ring-white/40 transition duration-300 hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[0_12px_28px_rgb(0_0_0_/_22%)] sm:max-w-none sm:px-5",
        topic.rotateClass,
        topic.bgClass,
      )}
    >
      <span className={cn("text-[var(--color-navy)]", topic.typeClass)}>{topic.label}</span>
    </Link>
  );
}

export function HomeInspiredSearchSection() {
  const firstRow = INSPIRED_TOPICS.slice(0, 5);
  const secondRow = INSPIRED_TOPICS.slice(5);

  return (
    <section
      id="inspired-search"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--color-navy)] px-4 py-20 text-[var(--color-parchment)] sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[var(--color-sage)]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-[var(--color-sage)]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-4xl text-3xl leading-[1.15] text-[var(--color-parchment)] md:text-4xl">
          Looking for something{" "}
          <em className="font-serif italic text-[var(--color-sage)]">specific?</em>
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-parchment)]/80">
          Tell our plain English assistant what you have in mind to search across{" "}
          {MARKETING_OFFERING_COUNT_LABEL} programs for an experience, destination, or interest.
        </p>

        <p className="mt-12 text-xl text-[var(--color-parchment)]/90 md:text-2xl">
          What are you{" "}
          <em className="font-serif italic text-[var(--color-sage)]">dreaming of</em> this
          summer?
        </p>
        <div className="mt-6 flex flex-col items-center gap-4">
          {[firstRow, secondRow].map((row, rowIndex) => (
            <ul
              key={rowIndex}
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 sm:gap-x-4"
            >
              {row.map((topic) => (
                <li key={topic.label}>
                  <DreamBubble topic={topic} />
                </li>
              ))}
            </ul>
          ))}
        </div>

        <Link
          href={OPEN_SEARCH_HREF}
          className="mt-12 flex w-full items-center justify-between gap-4 rounded-full border border-white/15 bg-[var(--color-parchment)] px-5 py-4 text-left no-underline shadow-[0_10px_30px_rgb(0_0_0_/_25%)] transition hover:border-[var(--color-sage)] hover:bg-white sm:px-7 sm:py-5"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold tracking-[0.14em] text-[var(--color-amber)] uppercase">
              Or just describe what you&apos;re looking for
            </span>
            <span className="mt-1 block truncate text-base text-[var(--color-navy)] sm:text-lg">
              A destination, an interest, a kind of summer…
            </span>
          </span>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-lg text-white"
            aria-hidden
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
