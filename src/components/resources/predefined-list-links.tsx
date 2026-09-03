import Link from "next/link";
import type { PredefinedList } from "@/lib/constants/predefined-lists";

export function PredefinedListLinks({
  lists,
  title,
}: {
  lists: PredefinedList[];
  title: string;
}) {
  if (lists.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-navy)]">{title}</p>
      <ul className="mt-2 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {lists.map((list) => (
          <li key={list.slug} className="mb-2 break-inside-avoid">
            <Link
              href={`/resources/lists/${list.slug}`}
              className="text-base leading-snug text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
            >
              {list.titleLabel} for {list.audienceLabel}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
