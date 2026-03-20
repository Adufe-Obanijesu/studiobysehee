import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { SOCIAL_LINKS } from "@/data/navbar";
import { BookSessionButton, SocialIcon } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-4 items-center justify-center">
      <div className="hidden lg:flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <ul className="flex items-center gap-0" aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
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
          <BookSessionButton />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Studio by Sehee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}