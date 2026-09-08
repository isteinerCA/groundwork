import { SITE_PRODUCTION_URL } from "@/lib/constants/brand";

function configuredSiteUrl(): string | undefined {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL)?.trim();
}

/** Canonical site origin for metadata, sitemaps, and structured data. */
export function getSiteUrl(): string {
  const configured = configuredSiteUrl();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return SITE_PRODUCTION_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
