"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useLazyVideoEmbed } from "@/hooks/useLazyVideoEmbed";
import { cn } from "@/lib/utils";
import { FaPlay } from "react-icons/fa6";

function embedUrlWithAutoplay(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    url.searchParams.set("autoplay", "1");
    return url.toString();
  } catch {
    const join = embedUrl.includes("?") ? "&" : "?";
    return `${embedUrl}${join}autoplay=1`;
  }
}

type LazyVideoEmbedProps = {
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
};

export default function LazyVideoEmbed({
  embedUrl,
  thumbnailUrl,
  title,
}: LazyVideoEmbedProps) {
  const { isActive, activate } = useLazyVideoEmbed();
  const iframeTitle = `${title} video`;

  if (isActive) {
    return (
      <iframe
        className="aspect-video w-full"
        src={embedUrlWithAutoplay(embedUrl)}
        title={iframeTitle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      <Image
        src={thumbnailUrl}
        alt={`${title} thumbnail`}
        fill
        className="object-cover"
        sizes="(max-width: 1152px) 100vw, 768px"
        loading="lazy"
      />
      <button
        type="button"
        onClick={activate}
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-colors hover:bg-foreground/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        aria-label={`Play video: ${title}`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
          <FaPlay className="ml-1 h-8 w-8 fill-white" aria-hidden />
        </span>
      </button>
    </div>
  );
}
