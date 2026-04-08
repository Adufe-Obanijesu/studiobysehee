import type { MetadataRoute } from "next";
import { getSiteUrl, SEO_SITEMAP_PATHS } from "@/data/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return SEO_SITEMAP_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
