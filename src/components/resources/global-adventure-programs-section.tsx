import Link from "next/link";
import { ResourceSectionHeader } from "@/components/resources/resource-section-header";
import { GLOBAL_ADVENTURE_GROUPS } from "@/lib/constants/global-adventure-lists";
import { getGlobalAdventureListsByGroup } from "@/lib/constants/predefined-lists";

export function GlobalAdventureProgramsSection() {
  const whereLists = getGlobalAdventureListsByGroup("where");
  const whatLists = getGlobalAdventureListsByGroup("what");

  return (
    <section
      id="global-adventure"
      className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <ResourceSectionHeader
        title="Explore Global & Adventure Teen Programs"
        description="International programs outside the US — browse live results by destination or interest."
      />

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
