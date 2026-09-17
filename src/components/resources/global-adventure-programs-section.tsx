import Link from "next/link";
import { ResourceSectionHeader } from "@/components/resources/resource-section-header";
import { GLOBAL_ADVENTURE_GROUPS } from "@/lib/constants/global-adventure-lists";
import { getGlobalAdventureListsByGroup } from "@/lib/constants/predefined-lists";

export function GlobalAdventureProgramsSection() {
  return (
    <section
      id="global-adventure"
      className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <ResourceSectionHeader
        title="Explore Global & Adventure Programs"
        description="Ready-made searches across our travel and adventure catalog — all grades selected so you can browse live results right away."
      />

      <div className="grid gap-6 px-5 py-4 sm:px-6 sm:py-5 lg:grid-cols-3 lg:gap-8">
        {GLOBAL_ADVENTURE_GROUPS.map((group) => {
          const lists = getGlobalAdventureListsByGroup(group.id);

          return (
            <div key={group.id}>
              <p className="text-sm font-medium text-[var(--color-navy)]">{group.title}</p>
              <ul className="mt-2 space-y-2">
                {lists.map((list) => (
                  <li key={list.slug}>
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
