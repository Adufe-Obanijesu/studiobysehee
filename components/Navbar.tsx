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
      className="text-sm text-foreground inline-block leading-tight"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        ref={wrapperRef}
        className="relative inline-block h-[1.2em] leading-tight align-middle"
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
      className="group relative ml-1 overflow-hidden rounded-md border2 border-primary bg-primary px-4 py-2 text-sm font-medium text-background"
    >
      <span
        className="absolute z-10 left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-foreground transition-transform transition-ease-400 group-hover:scale-100"
        style={{ transformOrigin: "center center" }}
        aria-hidden
      />
      <span className="relative z-10 text-light transition-colors transition-ease-300 group-hover:text-background">
        Book a session
      </span>
    </Link>
  );
}

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "instagram":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
      <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <FaInstagram className="size-4.5 fill-foreground relative z-10" aria-hidden />
      </div>;
    case "linkedin":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
      <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <FaLinkedin className="size-4.5 fill-foreground relative z-10" aria-hidden />
      </div>;
    case "pinterest":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
      <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <FaPinterest className="size-4.5 fill-foreground relative z-10" aria-hidden />
      </div>;
    case "imdb":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
      <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <SiImdb className="size-4.5 fill-foreground relative z-10" aria-hidden />
      </div>;
    default:
      return null;
  }
}

export default function Navbar() {
  const { navLinks, socialLinks } = useNavbar();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-0"
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
          className="font-cormorant text-2xl font-bold text-foreground shrink-0 transition-transform transition-ease-200 hover:scale-105"
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
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <ul className="flex items-center gap-0" aria-label="Social links">
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
