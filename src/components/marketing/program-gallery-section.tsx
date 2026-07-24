import Image from "next/image";
import Link from "next/link";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { SectionEyebrow } from "@/components/ui/button-link";

const GALLERY_TILES: {
  image: string;
  categoryId: ProgramCategoryId;
  alt: string;
}[] = [
  {
    image: "/images/gallery/tech-robotics.jpg",
    categoryId: "artificial-intelligence",
    alt: "Students collaborating on a robotics and AI project",
  },
  {
    image: "/images/gallery/marine-science.jpg",
    categoryId: "marine-science",
    alt: "Students conducting marine science research on a boat",
  },
  {
    image: "/images/gallery/wilderness-hiking.jpg",
    categoryId: "outdoor-wilderness",
    alt: "Students hiking on an alpine trail",
  },
  {
    image: "/images/gallery/arts-dance.jpg",
    categoryId: "arts",
    alt: "Students in a dance and theater rehearsal",
  },
  {
    image: "/images/gallery/global-travel.jpg",
    categoryId: "cultural-exchange",
    alt: "Students exploring a city abroad with a map",
  },
  {
    image: "/images/gallery/writing-humanities.jpg",
    categoryId: "writing-humanities",
    alt: "Students discussing books in a study group",
  },
  {
    image: "/images/gallery/pre-med-lab.jpg",
    categoryId: "biomedical",
    alt: "Students working in a life sciences laboratory",
  },
];

function categoryLabel(id: ProgramCategoryId): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProgramGallerySection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <SectionEyebrow>Summer pathways</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Find the right program{" "}
          <span className="font-serif italic text-[var(--color-sage)]">for you</span> this summer
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--color-text-muted)]">
          STEM, arts, travel, research, and adventure — tap a photo to explore programs in that
          pathway.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {GALLERY_TILES.map((tile) => (
            <Link
              key={tile.image}
              href={`/search?category=${tile.categoryId}`}
              className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm no-underline transition hover:border-[var(--color-sage)] hover:shadow-[var(--shadow-card)]"
            >
              <Image
                src={tile.image}
                alt={tile.alt}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 140px"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-navy-dark)]/80 to-transparent px-2 pb-2 pt-8 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {categoryLabel(tile.categoryId)} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
