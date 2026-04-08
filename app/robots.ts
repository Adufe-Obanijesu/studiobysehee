import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/data/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const host = base.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    host,
    sitemap: `${base}/sitemap.xml`,
  };
}
