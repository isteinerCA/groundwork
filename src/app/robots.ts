import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/constants/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/workspace", "/dashboard", "/sign-in", "/sign-up", "/share"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/workspace", "/dashboard", "/sign-in", "/sign-up", "/share"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/workspace", "/dashboard", "/sign-in", "/sign-up", "/share"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
