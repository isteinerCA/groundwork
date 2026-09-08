"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/components/icons/category-icons";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import type { GradeBand } from "@/lib/constants/predefined-lists";
import { cn } from "@/lib/utils";

export type HomeCategoryTile = {
  id: ProgramCategoryId;
  label: string;
  description: string;
  highSchoolHref: string;
  middleSchoolHref: string;
};

const GRADE_BANDS: { id: GradeBand; label: string }[] = [
  { id: "high-school", label: "High school" },
  { id: "middle-school", label: "Middle school" },
];

export function HomeCategoryTiles({ tiles }: { tiles: HomeCategoryTile[] }) {
  const [gradeBand, setGradeBand] = useState<GradeBand>("high-school");

  return (
    <div className="mt-10">
      <div className="flex flex-col items-start gap-3 md:items-center">
        <p className="text-sm font-medium text-[var(--color-navy)]">Show programs for</p>
        <div
          className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-parchment)] p-1"
          role="group"
          aria-label="Grade band"
        >
          {GRADE_BANDS.map((band) => {
            const selected = gradeBand === band.id;
            return (
              <button
                key={band.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setGradeBand(band.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  selected
                    ? "bg-[var(--color-navy)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]",
                )}
              >
                {band.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((tile) => {
          const href =
            gradeBand === "high-school" ? tile.highSchoolHref : tile.middleSchoolHref;

          return (
            <Link
              key={tile.id}
              href={href}
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
          );
        })}
      </div>
    </div>
  );
}
