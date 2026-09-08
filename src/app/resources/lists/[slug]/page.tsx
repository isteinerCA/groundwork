import Link from "next/link";
import { notFound } from "next/navigation";
import { PredefinedListExperience } from "@/components/search/predefined-list-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PredefinedListJsonLd } from "@/components/resources/predefined-list-json-ld";
import {
  getPredefinedListBySlug,
  PREDEFINED_LISTS,
} from "@/lib/constants/predefined-lists";
import { getProgramsForPredefinedList } from "@/lib/data/predefined-list-programs";
import { getDataVerifiedAt, getPrograms } from "@/lib/programs";
import { buildPredefinedListMetadata } from "@/lib/seo/predefined-list-metadata";

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

  return buildPredefinedListMetadata(list);
}

export default async function PredefinedListPage({ params }: PageProps) {
  const { slug } = await params;
  const list = getPredefinedListBySlug(slug);
  if (!list) notFound();

  const programs = getPrograms();
  const dataVerifiedAt = getDataVerifiedAt();
  const listPrograms = getProgramsForPredefinedList(programs, list);

  return (
    <>
      <PredefinedListJsonLd list={list} listPrograms={listPrograms} />
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
