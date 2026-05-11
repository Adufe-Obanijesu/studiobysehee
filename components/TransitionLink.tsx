"use client";

import React, { useTransition } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageTransition } from "@/context/PageTransitionContext";

type TransitionLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
    href: string;
  };

export function TransitionLink({
  children,
  href,
  onClick,
  target,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation } = usePageTransition();
  const [, startReactTransition] = useTransition();

  const isExternal =
    target === "_blank" ||
    (typeof href === "string" &&
      (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // If it's a new tab, or an external link, let browser/Next.js handle it normally
    if (isExternal || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      if (onClick) onClick(e);
      return;
    }

    e.preventDefault();
    if (onClick) onClick(e);

    // Skip the loader if we are already on this exact page
    const currentPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    const isSamePage = href === pathname || href === currentPath;

    if (!isSamePage) {
      startNavigation();
    }

    // Start navigating
    startReactTransition(() => {
      // @ts-ignore LinkProps href types
      router.push(href);
    });
  };

  return (
    <Link href={href} onClick={handleClick} target={target} {...props}>
      {children}
    </Link>
  );
}
