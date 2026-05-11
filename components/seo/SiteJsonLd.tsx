import { ABOUT_CONTACT, ABOUT_NAME, ABOUT_PORTRAIT_SRC } from "@/data/about";
import { SOCIAL_LINKS } from "@/data/navbar";
import { getSiteUrl } from "@/data/seo";

function normalizeSocialUrl(href: string) {
  if (href.startsWith("http://")) {
    return `https://${href.slice("http://".length)}`;
  }
  return href;
}

export default function SiteJsonLd() {
  const base = getSiteUrl();
  const url = `${base}/`;
  const sameAs = SOCIAL_LINKS.map((link) => normalizeSocialUrl(link.href));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: ABOUT_NAME,
    url,
    image: ABOUT_PORTRAIT_SRC,
    email: ABOUT_CONTACT.email,
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
