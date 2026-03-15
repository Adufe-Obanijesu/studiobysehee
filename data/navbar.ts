export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "instagram" | "linkedin" | "pinterest" | "imdb";
};

export const NAV_LINKS: NavLink[] = [
  { label: "Fashion | Beauty", href: "/fashion" },
  { label: "People", href: "/people" },
  { label: "Video", href: "/video" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "About | Contact", href: "/about" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "Pinterest", href: "https://pinterest.com", icon: "pinterest" },
  { label: "IMDb", href: "https://imdb.com", icon: "imdb" },
];
