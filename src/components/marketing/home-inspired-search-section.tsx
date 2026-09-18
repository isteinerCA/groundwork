import Link from "next/link";
import { MARKETING_OFFERING_COUNT_LABEL } from "@/lib/programs/preview-programs";
import { OPEN_SEARCH_HREF } from "@/lib/search/search-url";
import { cn } from "@/lib/utils";

type InspiredLink = {
  label: string;
  href: string;
};

type InspiredTopic = {
  label: string;
  links: InspiredLink[];
  typeClass: string;
  rotateClass: string;
};

const LIST = (slug: string) => `/resources/lists/${slug}`;

const INSPIRED_TOPICS: InspiredTopic[] = [
  {
    label: "Sea turtles",
    links: [{ label: "Abroad", href: LIST("sea-turtle-programs") }],
    typeClass: "font-serif text-xl italic sm:text-[1.35rem]",
    rotateClass: "-rotate-2",
  },
  {
    label: "Kilimanjaro",
    links: [{ label: "Abroad", href: LIST("kilimanjaro-programs") }],
    typeClass: "font-serif text-lg tracking-wide sm:text-xl",
    rotateClass: "rotate-1",
  },
  {
    label: "Scuba diving",
    links: [{ label: "Abroad", href: LIST("scuba-programs") }],
    typeClass: "text-[0.95rem] font-medium tracking-tight sm:text-base",
    rotateClass: "rotate-2",
  },
  {
    label: "Japan",
    links: [{ label: "Abroad", href: LIST("japan-programs") }],
    typeClass: "font-serif text-2xl italic",
    rotateClass: "-rotate-1",
  },
  {
    label: "Entrepreneurship",
    links: [
      { label: "US", href: LIST("entrepreneurship-us-programs") },
      { label: "Abroad", href: LIST("entrepreneurship-programs") },
    ],
    typeClass: "text-xs font-semibold tracking-[0.14em] uppercase",
    rotateClass: "rotate-[1.5deg]",
  },
  {
    label: "International relations",
    links: [
      { label: "US", href: LIST("international-relations-diplomacy-us-programs") },
      { label: "Abroad", href: LIST("international-relations-diplomacy-programs") },
    ],
    typeClass: "font-serif text-base italic leading-snug sm:text-lg",
    rotateClass: "-rotate-[1.5deg]",
  },
  {
    label: "Wildlife conservation",
    links: [{ label: "Abroad", href: LIST("conservation-programs") }],
    typeClass: "font-serif text-base leading-snug sm:text-lg",
    rotateClass: "rotate-1",
  },
  {
    label: "Architecture",
    links: [
      { label: "US", href: LIST("architecture-us-programs") },
      { label: "Abroad", href: LIST("architecture-programs") },
    ],
    typeClass: "text-lg italic tracking-tight",
    rotateClass: "-rotate-2",
  },
];

function DreamBubble({ topic }: { topic: InspiredTopic }) {
  const primary = topic.links[0];
  const dual = topic.links.length > 1;

  const bubbleClass = cn(
    "relative inline-flex cursor-pointer flex-col items-center justify-center rounded-[2.25rem] bg-[var(--color-parchment)] px-5 text-center text-[var(--color-navy)] shadow-[0_8px_24px_rgb(0_0_0_/_18%)] ring-1 ring-white/40 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgb(0_0_0_/_22%)]",
    topic.rotateClass,
    dual ? "py-3" : "min-h-[3.25rem] py-2.5",
  );

  return (
    <div className={bubbleClass}>
      <Link
        href={primary.href}
        className="text-inherit no-underline after:absolute after:inset-0"
        aria-label={
          dual ? `${topic.label} programs in the ${primary.label}` : `${topic.label} programs`
        }
      >
        <span className={cn("pointer-events-none text-[var(--color-navy)]", topic.typeClass)}>
          {topic.label}
        </span>
      </Link>
      {dual ? (
        <span className="relative z-10 mt-1.5 flex gap-3">
          {topic.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-semibold tracking-[0.16em] text-[var(--color-navy-light)] uppercase no-underline hover:text-[var(--color-sage)]"
            >
              {link.label}
            </Link>
          ))}
        </span>
      ) : null}
    </div>
  );
}

export function HomeInspiredSearchSection() {
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
          This summer, I am{" "}
          <em className="font-serif italic text-[var(--color-sage)]">dreaming of</em>
        </p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-4 sm:gap-x-4">
          {INSPIRED_TOPICS.map((topic) => (
            <li key={topic.label}>
              <DreamBubble topic={topic} />
            </li>
          ))}
        </ul>

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
