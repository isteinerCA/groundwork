import Link from "next/link";
import { CategoryIcon } from "@/components/icons/category-icons";
import type { ProgramCategoryId } from "@/lib/constants/categories";

export type HomeCategoryTile = {
  id: ProgramCategoryId;
  label: string;
  description: string;
  href: string;
};

export function HomeCategoryTiles({ tiles }: { tiles: HomeCategoryTile[] }) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.id}
          href={tile.href}
          className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left no-underline shadow-sm transition hover:border-[var(--color-navy)] hover:shadow-[var(--shadow-card)]"
        >
          <CategoryIcon categoryId={tile.id} className="h-11 w-11 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[var(--color-navy)]">{tile.label}</h3>
            <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
              {tile.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
