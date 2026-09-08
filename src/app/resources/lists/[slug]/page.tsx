import Link from "next/link";
import { notFound } from "next/navigation";
import { PredefinedListExperience } from "@/components/search/predefined-list-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PredefinedListJsonLd } from "@/components/resources/predefined-list-json-ld";
import { BreadcrumbJsonLd } from "@/components/resources/breadcrumb-json-ld";
import { RelatedArticles } from "@/components/resources/related-articles";
import {
  getPredefinedListBySlug,
  PREDEFINED_LISTS,
} from "@/lib/constants/predefined-lists";
import { getRelatedArticlesForList } from "@/lib/constants/resources";
import { getProgramsForPredefinedList } from "@/lib/data/predefined-list-programs";
import { getPrograms } from "@/lib/programs";
import { buildPredefinedListMetadata } from "@/lib/seo/predefined-list-metadata";
import { getPredefinedListBreadcrumbs } from "@/lib/seo/resource-breadcrumbs";

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
  const listPrograms = getProgramsForPredefinedList(programs, list);
  const relatedArticles = getRelatedArticlesForList(slug);
  const breadcrumbs = getPredefinedListBreadcrumbs(list);

  return (
    <>
      <PredefinedListJsonLd list={list} listPrograms={listPrograms} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />
      <PredefinedListExperience
        programs={programs}
        list={list}
        breadcrumbs={breadcrumbs}
      />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <RelatedArticles articles={relatedArticles} />
        </div>
        <Link
          href="/resources/lists"
          className="mt-8 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
        >
          ← View all ready-made searches
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
