import people from "@/data/people.json";

export type PersonImage = {
  src: string;
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
};

export type PeoplePageResponse = {
  page: number;
  limit: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  totalPages: number;
  items: PersonImage[];
};

export const PEOPLE_PAGE_SIZE = 60;
export const MAX_CACHED_PEOPLE_PAGES = 8;

const PEOPLE_PAGE_DELAY_MS = 120;
const peopleData = people as PersonImage[];

export async function fetchPeoplePage(page: number, limit = PEOPLE_PAGE_SIZE): Promise<PeoplePageResponse> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const totalCount = peopleData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
  const safePage = Math.min(Math.max(0, Math.floor(page)), totalPages - 1);
  const startIndex = safePage * safeLimit;
  const endIndex = Math.min(startIndex + safeLimit, totalCount);
  const items = peopleData.slice(startIndex, endIndex);

  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), PEOPLE_PAGE_DELAY_MS);
  });

  return {
    page: safePage,
    limit: safeLimit,
    startIndex,
    endIndex,
    totalCount,
    totalPages,
    items,
  };
}
