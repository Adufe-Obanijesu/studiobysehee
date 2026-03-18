export type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type GalleryPage = {
  images: GalleryImage[];
  nextPage: number | null;
  totalCount: number;
};

export type GalleryProps = {
  images: GalleryImage[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
};
