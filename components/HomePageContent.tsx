"use client";

import Gallery from "@/components/Gallery";
import { useFashionBeautyGalleryQuery } from "@/hooks/useFashionBeautyGalleryQuery";

export default function HomePageContent() {
  const { images, isLoading, isFetchingMore, hasMore, loadMore } =
    useFashionBeautyGalleryQuery();

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
