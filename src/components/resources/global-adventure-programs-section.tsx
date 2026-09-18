import Link from "next/link";
import { ResourceSectionHeader } from "@/components/resources/resource-section-header";
import { GLOBAL_ADVENTURE_GROUPS } from "@/lib/constants/global-adventure-lists";
import { getGlobalAdventureListsByGroup } from "@/lib/constants/predefined-lists";
import { TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG } from "@/lib/content/teen-travel-programs-summer-2027-article";
import { getArticleBySlug } from "@/lib/constants/resources";

export function GlobalAdventureProgramsSection() {
  const whereLists = getGlobalAdventureListsByGroup("where");
  const whatLists = getGlobalAdventureListsByGroup("what");
  const featuredArticle = getArticleBySlug(TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG);

  return (
    <section
      id="global-adventure"
      className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <ResourceSectionHeader
        title="Explore Global & Adventure Teen Programs"
        description="International programs outside the US — browse live results by destination or interest."
      />

      {featuredArticle ? (
        <div className="border-b border-[var(--color-sage)] px-5 py-5 sm:px-6">
          {featuredArticle.publishedDate ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Published {featuredArticle.publishedDate}
            </p>
          ) : null}
          <Link
            href={`/resources/${featuredArticle.slug}`}
            className="mt-1 block text-xl leading-snug text-[var(--color-navy)] no-underline hover:text-[var(--color-navy-light)] sm:text-2xl"
          >
            {featuredArticle.title}
          </Link>
          <Link
            href={`/resources/${featuredArticle.slug}`}
            className="mt-2 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
          >
            Read the guide →
          </Link>
        </div>
      ) : null}

      <div className="grid gap-8 px-5 py-4 sm:px-6 sm:py-5 lg:grid-cols-2 lg:gap-10">
        {GLOBAL_ADVENTURE_GROUPS.map((group) => {
          const lists = group.id === "where" ? whereLists : whatLists;

          return (
            <div key={group.id}>
              <p className="text-sm font-medium text-[var(--color-navy)]">{group.title}</p>
              <ul className="mt-2 columns-2 gap-x-6">
                {lists.map((list) => (
                  <li key={list.slug} className="mb-2 break-inside-avoid">
                    <Link
                      href={`/resources/lists/${list.slug}`}
                      className="text-base leading-snug text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
                    >
                      {list.linkLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
