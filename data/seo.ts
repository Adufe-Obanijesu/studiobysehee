import type { Metadata } from "next";
import {
  ABOUT_NAME,
} from "./about";

export const SITE_NAME = "Studio by Sehee";
const OG_IMAGE_PATH = "/og.png";
const OG_IMAGE_WIDTH = 1280;
const OG_IMAGE_HEIGHT = 905;

export type SeoPath = "/" | "/people" | "/videos" | "/testimonials" | "/about";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "http://localhost:3000";
}

function toMetadataBase(): URL {
  const base = getSiteUrl();
  return new URL(base.endsWith("/") ? base : `${base}/`);
}

function toCanonical(path: SeoPath): string {
  const base = getSiteUrl();
  if (path === "/") return `${base}/`;
  return `${base}${path}`;
}

const PAGE_SEO: Record<SeoPath, { title: string; description: string }> = {
  "/": {
    title: "Studio by Sehee | NYC Fashion & Lifestyle - Photographer & Cinematographer",
    description: "Studio by Sehee is a New York based fashion and beauty photographer capturing editorial, commercial, and brand storytelling with a cinematic eye. Available for fashion campaigns, lookbooks, beauty editorials, and creative projects across New York City.",
  },
  "/people": {
    title: "Studio by Sehee | People - Photographer & Cinematographer",
    description: "New York lifestyle and portrait photography by Studio by Sehee. Capturing authentic moments, engagements, weddings, elopement, couples, family and personal stories across New York City with a cinematic and documentary style.",
  },
  "/videos": {
    title: "Studio by Sehee | Video - Photographer & Cinematographer",
    description: "Video and cinematography by Studio by Sehee, a New York based filmmaker capturing fashion, commercial, and lifestyle stories. Available for brand campaigns, editorial projects, and creative video production across New York City.",
  },
  "/testimonials": {
    title: "Studio by Sehee | Testimonials - Photographer & Cinematographer",
    description: "Client testimonials and reviews for Studio by Sehee, a New York based photographer and cinematographer known for capturing authentic moments and creative visual storytelling across fashion, commercial, and lifestyle photography.",
  },
  "/about": {
    title: "Studio by Sehee | About - Photographer & Cinematographer",
    description: "Meet Sehee, a New York based photographer and cinematographer behind Studio by Sehee. Specializing in fashion, commercial, and lifestyle photography, capturing real moments and creative stories across New York City.",
  },
};

export function buildRootLayoutMetadata(): Metadata {
  const home = PAGE_SEO["/"];
  return {
    metadataBase: toMetadataBase(),
    manifest: "/logo/site.webmanifest",
    icons: {
      icon: [
        { url: "/logo/favicon.ico" },
        { url: "/logo/favicon.svg", type: "image/svg+xml" },
        { url: "/logo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: [{ url: "/logo/favicon.ico" }],
    },
    title: home.title,
    description: home.description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: `${SITE_NAME} - ${ABOUT_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE_PATH],
    },
  };
}

export function buildMetadataForPath(path: SeoPath): Metadata {
  const { title, description } = PAGE_SEO[path];
  const canonical = toCanonical(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title,
      description,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: `${SITE_NAME} - ${ABOUT_NAME}`,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}

export const SEO_SITEMAP_PATHS: SeoPath[] = [
  "/",
  "/people",
  "/videos",
  "/testimonials",
  "/about",
];
