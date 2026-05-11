import type { MetadataRoute } from "next";
import { getSiteUrl, isSiteIndexingAllowed } from "@/data/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexingAllowed()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const base = getSiteUrl();
  const host = base.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    host,
    sitemap: `${base}/sitemap.xml`,
  };
}
