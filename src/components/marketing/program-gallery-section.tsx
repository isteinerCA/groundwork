import Image from "next/image";
import Link from "next/link";
import { ButtonLink, SectionEyebrow } from "@/components/ui/button-link";

const GALLERY_IMAGES = [
  {
    src: "/images/gallery/tech-robotics.jpg",
    alt: "Students collaborating on a robotics project",
  },
  {
    src: "/images/gallery/wilderness-hiking.jpg",
    alt: "Students hiking together outdoors",
  },
  {
    src: "/images/gallery/marine-science.jpg",
    alt: "Students conducting field research on the water",
  },
  {
    src: "/images/gallery/arts-dance.jpg",
    alt: "Students rehearsing dance and theater",
  },
  {
    src: "/images/gallery/global-travel.jpg",
    alt: "Students exploring a city abroad",
  },
  {
    src: "/images/gallery/writing-humanities.jpg",
    alt: "Students reading and discussing together",
  },
  {
    src: "/images/gallery/pre-med-lab.jpg",
    alt: "Students working in a science laboratory",
  },
] as const;

export function ProgramGallerySection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <SectionEyebrow>Summer pathways</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Find the right program{" "}
          <span className="font-serif italic text-[var(--color-sage)]">for you</span> this summer
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {GALLERY_IMAGES.map((image) => (
            <Link
              key={image.src}
              href="/search"
              className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm no-underline transition hover:border-[var(--color-sage)] hover:shadow-[var(--shadow-card)]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 140px"
              />
            </Link>
          ))}
        </div>

        <ButtonLink href="/search" className="mt-10">
          Start your shortlist
        </ButtonLink>
      </div>
    </section>
  );
}
