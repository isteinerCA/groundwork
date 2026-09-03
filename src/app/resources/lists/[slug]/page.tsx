import Link from "next/link";
import { notFound } from "next/navigation";
import { PredefinedListExperience } from "@/components/search/predefined-list-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getPredefinedListBySlug,
  PREDEFINED_LISTS,
} from "@/lib/constants/predefined-lists";
import { getDataVerifiedAt, getPrograms } from "@/lib/programs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PREDEFINED_LISTS.map((list) => ({ slug: list.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const list = getPredefinedListBySlug(slug);
  if (!list) return { title: "List not found" };

  return {
    title: `${list.titleLabel} for ${list.audienceLabel} · Pre-defined lists · Groundwork`,
    description: list.description,
  };
}

export default async function PredefinedListPage({ params }: PageProps) {
  const { slug } = await params;
  const list = getPredefinedListBySlug(slug);
  if (!list) notFound();

  const programs = getPrograms();
  const dataVerifiedAt = getDataVerifiedAt();

  return (
    <>
      <SiteHeader />
      <PredefinedListExperience
        programs={programs}
        dataVerifiedAt={dataVerifiedAt}
        list={list}
      />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <Link
          href="/resources/lists"
          className="text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
        >
          ← View all ready-made searches
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
