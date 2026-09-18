import Image from "next/image";
import Link from "next/link";
import { MARKETING_OFFERING_COUNT_LABEL } from "@/lib/programs/preview-programs";
import { cn } from "@/lib/utils";

type InspiredLink = {
  label: string;
  href: string;
};

type InspiredTopic = {
  label: string;
  image: string;
  imagePosition?: string;
  alt: string;
  links: InspiredLink[];
};

const LIST = (slug: string) => `/resources/lists/${slug}`;

const INSPIRED_TOPICS: InspiredTopic[] = [
  {
    label: "Sea turtles",
    image: "/images/gallery/marine-science.jpg",
    imagePosition: "object-[50%_70%]",
    alt: "Students conducting field research on the water",
    links: [{ label: "Abroad", href: LIST("sea-turtle-programs") }],
  },
  {
    label: "Kilimanjaro",
    image: "/images/gallery/wilderness-hiking.jpg",
    alt: "Students hiking a mountain trail",
    links: [{ label: "Abroad", href: LIST("kilimanjaro-programs") }],
  },
  {
    label: "Scuba diving",
    image: "/images/gallery/marine-science.jpg",
    imagePosition: "object-[40%_30%]",
    alt: "Open water and marine field research",
    links: [{ label: "Abroad", href: LIST("scuba-programs") }],
  },
  {
    label: "Japan",
    image: "/images/gallery/global-travel.jpg",
    alt: "Students exploring a city abroad",
    links: [{ label: "Abroad", href: LIST("japan-programs") }],
  },
  {
    label: "Entrepreneurship",
    image: "/images/gallery/tech-robotics.jpg",
    alt: "Students collaborating on a hands-on project",
    links: [
      { label: "US", href: LIST("entrepreneurship-us-programs") },
      { label: "Abroad", href: LIST("entrepreneurship-programs") },
    ],
  },
  {
    label: "International relations",
    image: "/images/gallery/writing-humanities.jpg",
    alt: "Students in discussion",
    links: [
      { label: "US", href: LIST("international-relations-diplomacy-us-programs") },
      { label: "Abroad", href: LIST("international-relations-diplomacy-programs") },
    ],
  },
  {
    label: "Wildlife conservation",
    image: "/images/gallery/wilderness-hiking.jpg",
    imagePosition: "object-[70%_40%]",
    alt: "Students outdoors in a wild landscape",
    links: [{ label: "Abroad", href: LIST("conservation-programs") }],
  },
  {
    label: "Architecture",
    image: "/images/gallery/arts-dance.jpg",
    alt: "Students in a studio and performance space",
    links: [
      { label: "US", href: LIST("architecture-us-programs") },
      { label: "Abroad", href: LIST("architecture-programs") },
    ],
  },
];

function InspiredTopicCard({ topic }: { topic: InspiredTopic }) {
  const single = topic.links.length === 1;

  return (
    <article className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-navy-dark)] shadow-[0_14px_36px_rgb(0_0_0_/_32%)] ring-1 ring-white/10 transition hover:ring-[var(--color-sage)]">
      <Image
        src={topic.image}
        alt={topic.alt}
        fill
        className={cn(
          "object-cover transition duration-700 group-hover:scale-105",
          topic.imagePosition,
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_20_27_/_82%)_0%,rgb(10_20_27_/_28%)_42%,transparent_68%)]"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 sm:p-4">
        {single ? (
          <Link
            href={topic.links[0].href}
            className="block text-lg leading-snug text-white no-underline after:absolute after:inset-0 sm:text-xl"
          >
            {topic.label}
          </Link>
        ) : (
          <>
            <h3 className="text-lg leading-snug text-white sm:text-xl">{topic.label}</h3>
            <div className="mt-2.5 flex gap-2">
              {topic.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-[var(--color-parchment)] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-navy)] uppercase no-underline transition hover:bg-[var(--color-sage)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
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
        <h2 className="max-w-4xl text-3xl leading-[1.15] text-[var(--color-parchment)] md:text-5xl lg:text-[3.25rem]">
          Looking for something{" "}
          <em className="font-serif italic text-[var(--color-sage)]">specific?</em>
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-parchment)]/80 md:text-xl">
          Search across {MARKETING_OFFERING_COUNT_LABEL} programs for an experience, destination, or
          interest.
        </p>

        <p className="mt-12 text-xs font-semibold tracking-[0.14em] text-[var(--color-sage)] uppercase">
          Get inspired
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {INSPIRED_TOPICS.map((topic) => (
            <li key={topic.label}>
              <InspiredTopicCard topic={topic} />
            </li>
          ))}
        </ul>

        <Link
          href="/search?open=1"
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
