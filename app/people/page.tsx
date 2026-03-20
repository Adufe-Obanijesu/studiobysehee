"use client";

import Gallery from "@/components/Gallery";
import { usePeopleGalleryQuery } from "@/hooks/usePeopleGalleryQuery";

export default function PeoplePage() {
  const { images, isLoading, isFetchingMore, hasMore, loadMore } =
    usePeopleGalleryQuery();

  return (
    <Gallery
      images={images}
      isLoading={isLoading}
      isFetchingMore={isFetchingMore}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}
