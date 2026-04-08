import type { Metadata } from "next";
import {
  ABOUT_BIO_REST,
  ABOUT_NAME,
  ABOUT_PORTRAIT_HEIGHT,
  ABOUT_PORTRAIT_SRC,
  ABOUT_PORTRAIT_WIDTH,
} from "./about";

export const SITE_NAME = "Studio by Sehee";

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
    title: "Fashion & Beauty",
    description: `${ABOUT_NAME} ${ABOUT_BIO_REST} Browse fashion, beauty, and commercial photography.`,
  },
  "/people": {
    title: "People",
    description: `Portrait and people photography by ${ABOUT_NAME}, New York — editorial and commercial work.`,
  },
  "/videos": {
    title: "Video",
    description: `Selected motion and video work by ${ABOUT_NAME} — fashion, beauty, and commercial projects.`,
  },
  "/testimonials": {
    title: "Testimonials",
    description: `Client testimonials for ${ABOUT_NAME} and ${SITE_NAME}.`,
  },
  "/about": {
    title: "About & Contact",
    description: `${ABOUT_NAME} ${ABOUT_BIO_REST} Selected clients, contact, and booking.`,
  },
};

export function buildRootLayoutMetadata(): Metadata {
  const home = PAGE_SEO["/"];
  return {
    metadataBase: toMetadataBase(),
    title: {
      default: `${home.title} | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: home.description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      images: [
        {
          url: ABOUT_PORTRAIT_SRC,
          width: ABOUT_PORTRAIT_WIDTH,
          height: ABOUT_PORTRAIT_HEIGHT,
          alt: `Portrait of ${ABOUT_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function buildMetadataForPath(path: SeoPath): Metadata {
  const { title, description } = PAGE_SEO[path];
  const canonical = toCanonical(path);
  const ogTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: ogTitle,
      description,
    },
    twitter: {
      title: ogTitle,
      description,
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
