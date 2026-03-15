"use client";

import Link from "next/link";
import { FaInstagram, FaLinkedin, FaPinterest } from "react-icons/fa";
import { SiImdb } from "react-icons/si";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavLinkHover, useNavbar } from "@/hooks/useNavbar";
import type { NavLink, SocialLink } from "@/data/navbar";

function AnimatedNavLink({ link }: { link: NavLink }) {
  const { wrapperRef, line1Ref, line2Ref, onMouseEnter, onMouseLeave } =
    useNavLinkHover();
  return (
    <Link
      href={link.href}
      className="text-sm text-foreground hover:text-muted-foreground transition-colors inline-block leading-tight"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        ref={wrapperRef}
        className="relative inline-block h-[1.2em] overflow-hidden leading-tight align-middle"
      >
        <span aria-hidden className="invisible block leading-tight pr-1">
          {link.label}
        </span>
        <span
          ref={line1Ref}
          className="absolute top-0 left-0 block leading-tight"
        >
          {link.label}
        </span>
        <span
          ref={line2Ref}
          className="absolute top-0 left-0 block leading-tight"
        >
          {link.label}
        </span>
      </span>
    </Link>
  );
}

function BookSessionButton() {
  return (
    <Link
      href="/book"
      className="group relative ml-1 overflow-hidden rounded-md border-2 border-primary bg-primary px-4 py-2 text-sm font-medium text-background"
    >
      <span
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-background transition-transform duration-400 ease-in-out group-hover:scale-100"
        style={{ transformOrigin: "center center" }}
        aria-hidden
      />
      <span className="relative z-10 text-background transition-colors duration-300 ease-in-out group-hover:text-primary">
        Book a session
      </span>
    </Link>
  );
}

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "instagram":
      return <FaInstagram className="size-4.5 fill-muted-foreground hover:fill-foreground transition duration-200 ease-in-out" aria-hidden />;
    case "linkedin":
      return <FaLinkedin className="size-4.5 fill-muted-foreground hover:fill-foreground transition duration-200 ease-in-out" aria-hidden />;
    case "pinterest":
      return <FaPinterest className="size-4.5 fill-muted-foreground hover:fill-foreground transition duration-200 ease-in-out" aria-hidden />;
    case "imdb":
      return <SiImdb className="size-4.5 fill-muted-foreground hover:fill-foreground transition duration-200 ease-in-out" aria-hidden />;
    default:
      return null;
  }
}

export default function Navbar() {
  const { navLinks, socialLinks } = useNavbar();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:
          "linear-gradient(to bottom, color-mix(in srgb, var(--background) 85%, transparent) 0%, transparent 100%)",
      }}
    >
      <nav
        className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-cormorant text-2xl font-bold text-foreground hover:opacity-80 transition-opacity shrink-0"
        >
          Studio by Sehee
        </Link>

        {/* Center links */}
        <ul className="hidden md:flex items-center gap-6 justify-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <AnimatedNavLink link={link} />
            </li>
          ))}
        </ul>

        {/* Right: theme toggle, socials, CTA */}
        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <ul className="flex items-center gap-3" aria-label="Social links">
            {socialLinks.map((social) => (
              <li key={social.icon}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <SocialIcon icon={social.icon} />
                </a>
              </li>
            ))}
          </ul>
          <BookSessionButton />
        </div>
      </nav>
    </header>
  );
}
