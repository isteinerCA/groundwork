import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/constants/site-url";
import { PREDEFINED_LISTS } from "@/lib/constants/predefined-lists";
import { RESOURCE_ARTICLES } from "@/lib/constants/resources";

const PUBLIC_STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/search",
  "/resources",
  "/resources/lists",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/resources") ? 0.9 : 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = RESOURCE_ARTICLES.map((article) => ({
    url: absoluteUrl(`/resources/${article.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const listEntries: MetadataRoute.Sitemap = PREDEFINED_LISTS.map((list) => ({
    url: absoluteUrl(`/resources/lists/${list.slug}`),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...articleEntries, ...listEntries];
}
