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
  {
    label: "Instagram",
    href: "http://www.instagram.com/sehee_in_newyork",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sehee-kim-551197128/",
    icon: "linkedin",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.co.kr/studiobysehee1750/",
    icon: "pinterest",
  },
  {
    label: "IMDB",
    href: "https://www.imdb.com/name/nm8635611/",
    icon: "imdb",
  },
];
