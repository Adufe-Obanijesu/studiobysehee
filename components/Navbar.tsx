"use client";

import { TransitionLink as Link } from "@/components/TransitionLink";
import { FaInstagram, FaLinkedin, FaPinterest } from "react-icons/fa";
import { SiImdb } from "react-icons/si";
import ThemeToggle from "@/components/ThemeToggle";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useNavLinkHover, useNavbar } from "@/hooks/useNavbar";
import type { NavLink, SocialLink } from "@/data/navbar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookSessionButton } from "@/components/BookSessionButton";

function AnimatedNavLink({ link, isActive }: { link: NavLink; isActive: boolean }) {
  const { wrapperRef, line1Ref, line2Ref, onMouseEnter, onMouseLeave } =
    useNavLinkHover();
  return (
    <Link
      href={link.href}
      className={cn(
        "text-sm inline-block leading-tight py-2 px-4 rounded-full text-foreground",
        isActive ? "bg-muted" : "bg-transparent"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        ref={wrapperRef}
        className="relative inline-block h-[1.2em] leading-tight align-middle"
      >
        <span aria-hidden className="invisible block leading-tight" >
          {link.label}
        </span>
        <span ref={line1Ref} className="absolute top-0 left-0 block leading-tight">
          {link.label}
        </span>
        <span ref={line2Ref} className="absolute top-0 left-0 block leading-tight">
          {link.label}
        </span>
      </span>
    </Link>
  );
}

export function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "instagram":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <FaInstagram className={cn("lg:size-4.5 size-6 relative z-10 fill-foreground")} aria-hidden />
      </div>;
    case "linkedin":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
        <div className={cn("absolute top-0 left-0 w-full h-full group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full bg-muted")} />
        <FaLinkedin className={cn("lg:size-4.5 size-6 relative z-10 fill-foreground")} aria-hidden />
      </div>;
    case "pinterest":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <FaPinterest className={cn("lg:size-4.5 size-6 relative z-10 fill-foreground")} aria-hidden />
      </div>;
    case "imdb":
      return <div className="relative group flex items-center justify-center p-2 rounded-full">
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <SiImdb className={cn("lg:size-4.5 size-6 relative z-10 fill-foreground")} aria-hidden />
      </div>;
    default:
      return null;
  }
}

export default function Navbar() {
  const {
    navLinks,
    socialLinks,
    isMobileMenuOpen,
    closeMobileMenu,
    overlayScopeRef,
    circleRef,
    contentRef,
    mobileLinksRef,
    mobileSocialsRef,
    mobileCtaRef,
    mobileButtonRef,
    menuIconRef,
    closeIconRef,
    handleMobileToggleClick,
    isActiveLink,
  } = useNavbar();

  return (
    <header
      id="navbar"
      className="fixed top-0 left-0 right-0 z-9999 invisible"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 md:h-36"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--background) 96%, transparent) 0%, transparent 100%)",
          }}
        />
        <nav
          className="relative z-9999 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-cormorant text-2xl font-bold text-foreground shrink-0 transition transition-ease-200 hover:scale-105 transition-ease-200"
            onClick={closeMobileMenu}
          >
            Studio by Sehee
          </Link>

          {/* Center links - desktop only (lg+ so tablet uses mobile menu) */}
          <ul className="hidden lg:flex items-center gap-6 justify-center">
            {navLinks.map((link) => (
              <li key={link.href}>
                <AnimatedNavLink link={link} isActive={isActiveLink(link.href)} />
              </li>
            ))}
          </ul>

          {/* Right: theme toggle, socials, CTA (desktop) */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <TooltipProvider>
              <ul className="flex items-center gap-0" aria-label="Social links">
                {socialLinks.map((social) => (
                  <li key={social.icon}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={social.label}
                        >
                          <SocialIcon icon={social.icon} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-background">{social.label}</span>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
            <BookSessionButton className="ml-1" />
          </div>

          {/* Right: theme toggle + hamburger (mobile + tablet) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={handleMobileToggleClick}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-main-menu"
              className="invisible group relative inline-flex items-center justify-center w-9 h-9 rounded-full text-foreground transition transition-ease-200 hover:scale-105 transition-ease-200"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition transition-ease-200 rounded-full" />
              <span
                ref={menuIconRef}
                className="absolute inline-flex items-center justify-center w-5 h-5"
                aria-hidden
              >
                <HiOutlineMenu className="w-5 h-5 relative z-10" aria-hidden />
              </span>
              <span
                ref={closeIconRef}
                className="absolute inline-flex items-center justify-center w-5 h-5"
                aria-hidden
              >
                <HiOutlineX className="w-5 h-5 relative z-10" aria-hidden />
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile expanding circle and overlay */}
      <div
        ref={overlayScopeRef}
        className="pointer-events-none fixed inset-0 z-40 lg:hidden invisible"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div
            ref={circleRef}
            className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-background border-[.05px] border-border transition-colors duration-200 ease-in-out will-change-transform"
          />
        </div>

        <div
          ref={contentRef}
          id="mobile-main-menu"
          className="absolute inset-0 flex flex-col justify-between gap-6 px-8 py-10"
          onClick={closeMobileMenu}
        >
          <div
            className="flex-1 flex flex-col justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <ul
              ref={mobileLinksRef}
              className="flex flex-col gap-4 text-3xl"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "mobile-nav-link inline-block scale-0 font-cormorant py-2 px-4",
                      isActiveLink(link.href) ? "bg-muted rounded-full" : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={mobileSocialsRef}
            className="flex items-center lg:justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {socialLinks.map((social) => (
              <Link
                key={social.icon}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="text-background"
                aria-label={social.label}
              >
                <SocialIcon icon={social.icon} />
              </Link>
            ))}
          </div>

          <div ref={mobileCtaRef} className="shrink-0">
            <BookSessionButton onAfterOpen={closeMobileMenu} />
          </div>
        </div>
      </div>
    </header>
  );
}
