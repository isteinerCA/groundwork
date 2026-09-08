import type { PredefinedList } from "@/lib/constants/predefined-lists";
import type { ResourceArticle } from "@/lib/constants/resources";
import { getCategoryById } from "@/lib/constants/resources";
import { predefinedListPageTitle } from "@/lib/data/predefined-list-programs";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-json-ld";

export function getArticleBreadcrumbs(article: ResourceArticle): BreadcrumbItem[] {
  const category = getCategoryById(article.categoryId);
  if (!category) {
    return [
      { label: "Resources", href: "/resources" },
      { label: article.title, href: `/resources/${article.slug}` },
    ];
  }

  return [
    { label: "Resources", href: "/resources" },
    { label: category.label, href: `/resources#${category.id}` },
    { label: article.title, href: `/resources/${article.slug}` },
  ];
}

export function getListsIndexBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Resources", href: "/resources" },
    { label: "Popular ways to explore", href: "/resources/lists" },
  ];
}

export function getPredefinedListBreadcrumbs(list: PredefinedList): BreadcrumbItem[] {
  return [
    { label: "Resources", href: "/resources" },
    { label: "Pre-defined lists", href: "/resources/lists" },
    {
      label: predefinedListPageTitle(list),
      href: `/resources/lists/${list.slug}`,
    },
  ];
}
