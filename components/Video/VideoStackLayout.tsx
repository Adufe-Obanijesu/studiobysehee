"use client";

import Image from "next/image";
import { useVideoStackLayout } from "@/hooks/useVideoStackLayout";
import type { VideoDataItem } from "./types";
import { cn } from "@/lib/utils";

type VideoStackLayoutProps = {
  videos: VideoDataItem[];
};

export default function VideoStackLayout({ videos }: VideoStackLayoutProps) {
  const {
    containerRef,
    videoItems,
    activeVideoId,
    setSectionRef,
    scrollToVideo,
    setMiniMapItemRef,
  } = useVideoStackLayout(videos);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[calc(100dvh-3.5rem)] px-4 py-8 md:px-6 lg:py-10"
      aria-label="Video gallery"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-14 lg:gap-16">
          {videoItems.map((video) => (
            <article
              key={video.id}
              ref={(node) => setSectionRef(video.id, node)}
              className="w-full"
              data-video-section={video.id}
            >
              <div className="overflow-hidden rounded-md bg-muted">
                <iframe
                  className="aspect-video w-full"
                  src={video.embedUrl}
                  title={`${video.client} video`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="mt-2 text-center text-sm uppercase tracking-[0.2em] text-foreground/85 md:hidden">
                {video.client}
              </p>
            </article>
          ))}
        </div>

        {/* Fixed Title Container - Left side (Desktop only) */}
        <div className="fixed left-6 top-1/2 z-40 hidden h-6 w-48 -translate-y-1/2 overflow-hidden text-foreground/85 md:block lg:left-16">
          <div className="relative h-full w-full">
            {videoItems.map((video) => {
              const isActive = activeVideoId === video.id;
              return (
                <div
                  key={`title-${video.id}`}
                  className={cn(
                    "absolute left-0 top-0 flex h-full w-full items-center text-sm uppercase tracking-[0.2em] transition-transform duration-500 will-change-transform",
                    isActive ? "translate-y-0" : "translate-y-full"
                  )}
                  aria-hidden={!isActive}
                >
                  {video.client}
                </div>
              );
            })}
          </div>
        </div>

        <aside
          className="fixed right-12 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
          aria-label="Video mini map"
        >
          <ul className="flex flex-col gap-3">
            {videoItems.map((video) => (
              <li key={`mini-${video.id}`}>
                <button
                  ref={(node) => setMiniMapItemRef(video.id, node)}
                  type="button"
                  onClick={() => scrollToVideo(video.id)}
                  className="overflow-hidden rounded-sm border border-border/70 bg-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Go to ${video.client} video`}
                  aria-current={activeVideoId === video.id ? "true" : undefined}
                >
                  <Image
                    src={video.thumbnailUrl}
                    alt={`${video.client} thumbnail`}
                    width={84}
                    height={48}
                    className="h-12 w-[84px] object-cover"
                    unoptimized
                  />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
