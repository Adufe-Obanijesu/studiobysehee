"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useGalleryLightboxPortalTarget } from "@/hooks/useGalleryLightboxPortalTarget";
import type { VideoDataItem, VideoItem } from "@/components/Video/types";

function extractYoutubeId(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const paramId = url.searchParams.get("v");
    if (paramId) return paramId;

    const segments = url.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? null;
  } catch {
    return null;
  }
}

export function useVideoStackLayout(videos: VideoDataItem[]) {
  const fixedOverlaysPortalTarget = useGalleryLightboxPortalTarget();
  const portalReady = fixedOverlaysPortalTarget != null;
  const containerRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    videos[0]?.id ?? null,
  );

  const videoItems = useMemo<VideoItem[]>(
    () =>
      videos
        .map((video) => {
          const youtubeId = extractYoutubeId(video.videoUrl);
          if (!youtubeId) return null;

          return {
            ...video,
            youtubeId,
            embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
            thumbnailUrl: video.thumbnail,
          };
        })
        .filter((item): item is VideoItem => item !== null),
    [videos],
  );

  const setSectionRef = useCallback((videoId: string, node: HTMLElement | null) => {
    sectionRefs.current[videoId] = node;
  }, []);

  const scrollToVideo = useCallback((videoId: string) => {
    const section = sectionRefs.current[videoId];
    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  useGSAP(
    () => {
      if (!videoItems.length) return;

      const entries: { trigger: ScrollTrigger; videoId: string }[] = [];

      videoItems.forEach((video) => {
        const section = sectionRefs.current[video.id];
        if (!section) return;

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActiveVideoId(video.id);
          },
        });

        entries.push({ trigger, videoId: video.id });
      });

      ScrollTrigger.refresh();

      const synced = entries.find((e) => e.trigger.isActive);
      if (synced) {
        setActiveVideoId(synced.videoId);
      } else if (videoItems[0]) {
        setActiveVideoId(videoItems[0].id);
      }

      return () => {
        entries.forEach(({ trigger }) => trigger.kill());
      };
    },
    { scope: containerRef, dependencies: [videoItems] },
  );

  useGSAP(
    () => {
      if (!portalReady) return;

      videoItems.forEach((video) => {
        const thumbnail = sectionRefs.current[`mini-${video.id}`];
        if (!thumbnail) return;

        const isActive = activeVideoId === video.id;
        gsap.to(thumbnail, {
          filter: isActive ? "grayscale(0)" : "grayscale(1)",
          scale: isActive ? 1.25 : 1,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    },
    { dependencies: [activeVideoId, videoItems, portalReady] },
  );

  useGSAP(
    () => {
      if (!portalReady) return;
      ScrollTrigger.refresh();
    },
    { dependencies: [portalReady] },
  );

  const setMiniMapItemRef = useCallback((videoId: string, node: HTMLElement | null) => {
    sectionRefs.current[`mini-${videoId}`] = node;
  }, []);

  return {
    containerRef,
    fixedOverlaysPortalTarget,
    videoItems,
    activeVideoId,
    setSectionRef,
    scrollToVideo,
    setMiniMapItemRef,
  };
}
