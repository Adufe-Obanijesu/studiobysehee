"use client";

import { HiSun, HiMoon } from "react-icons/hi";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import type { UseThemeToggleProps } from "@/hooks/useThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ThemeToggle(props: UseThemeToggleProps = {}) {
  const {
    containerRef,
    sunRef,
    moonRef,
    isDark,
    disabled,
    handleClick,
    ROTATION,
  } = useThemeToggle(props);

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={containerRef}
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="group relative rounded-full text-foreground inline-flex items-center justify-center w-9 h-9 disabled:opacity-70 disabled:pointer-events-none"
            aria-label={label}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
            <span
              ref={sunRef}
              className="absolute inline-flex items-center justify-center w-6 h-6"
              style={
                !isDark
                  ? undefined
                  : { opacity: 0, transform: `rotate(-${ROTATION}deg)` }
              }
              aria-hidden
            >
              <HiSun className="w-6 h-6 text-red-500 transition-colors transition-ease-200" />
            </span>
            <span
              ref={moonRef}
              className="absolute inline-flex items-center justify-center w-6 h-6"
              style={
                isDark
                  ? undefined
                  : { opacity: 0, transform: `rotate(-${ROTATION}deg)` }
              }
              aria-hidden
            >
              <HiMoon className="w-6 h-6 text-background transition-colors transition-ease-200" />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-background">{label}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
