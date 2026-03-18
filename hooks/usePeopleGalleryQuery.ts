"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPeopleGalleryPage } from "@/lib/api/gallery";

export function usePeopleGalleryQuery() {
  const query = useInfiniteQuery({
    queryKey: ["people-gallery"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPeopleGalleryPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const images = useMemo(
    () => query.data?.pages.flatMap((page) => page.images) ?? [],
    [query.data?.pages],
  );

  return {
    images,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      if (!query.hasNextPage || query.isFetchingNextPage) {
        return;
      }
      void query.fetchNextPage();
    },
  };
}
