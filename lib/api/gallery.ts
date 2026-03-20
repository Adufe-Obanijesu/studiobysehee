import peopleJson from "@/data/people.json";
import fashionBeautyJson from "@/data/fashion_beauty.json";
import { PAGE_SIZE } from "@/components/Gallery/constants";
import type { GalleryImage, GalleryPage } from "@/components/Gallery/types";

type LocalGalleryJsonItem = {
  id?: number;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeLocalImages = (rawJson: LocalGalleryJsonItem[]): GalleryImage[] =>
  rawJson
    .filter((item): item is LocalGalleryJsonItem => Boolean(item?.src))
    .map((item, index) => ({
      id: item.id ?? index + 1,
      src: item.src,
      alt: item.alt ?? "",
      width: item.width ?? item.naturalWidth ?? 1200,
      height: item.height ?? item.naturalHeight ?? 800,
    }));

export const createLocalPageFetcher = (rawJson: LocalGalleryJsonItem[]) => {
  const normalizedImages = normalizeLocalImages(rawJson);

  return async (page: number, pageSize = PAGE_SIZE): Promise<GalleryPage> => {
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;

    await delay(300);

    return {
      images: normalizedImages.slice(start, end),
      nextPage: end >= normalizedImages.length ? null : safePage + 1,
      totalCount: normalizedImages.length,
    };
  };
};

export const fetchPeopleGalleryPage = createLocalPageFetcher(
  peopleJson as LocalGalleryJsonItem[],
);

export const fetchFashionBeautyGalleryPage = createLocalPageFetcher(
  fashionBeautyJson as LocalGalleryJsonItem[],
);
