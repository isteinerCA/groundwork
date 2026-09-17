import Link from "next/link";
import { ResourceSectionHeader } from "@/components/resources/resource-section-header";
import { DOMESTIC_INTEREST_GROUPS } from "@/lib/constants/domestic-interest-lists";
import { getDomesticInterestListsByGroup } from "@/lib/constants/predefined-lists";

export function DomesticInterestProgramsSection() {
  const whereLists = getDomesticInterestListsByGroup("where");
  const whatLists = getDomesticInterestListsByGroup("what");

  return (
    <section
      id="domestic-interest"
      className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <ResourceSectionHeader
        title="Explore US Teen Programs"
        description="Programs across the United States — browse live results by destination or interest."
      />

      <div className="grid gap-8 px-5 py-4 sm:px-6 sm:py-5 lg:grid-cols-2 lg:gap-10">
        {DOMESTIC_INTEREST_GROUPS.map((group) => {
          const lists = group.id === "where" ? whereLists : whatLists;

          return (
            <div key={group.id}>
              <p className="text-sm font-medium text-[var(--color-navy)]">{group.title}</p>
              <ul
                className={
                  group.id === "what"
                    ? "mt-2 columns-2 gap-x-6"
                    : "mt-2 space-y-2"
                }
              >
                {lists.map((list) => (
                  <li
                    key={list.slug}
                    className={group.id === "what" ? "mb-2 break-inside-avoid" : undefined}
                  >
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
