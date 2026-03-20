export const PAGE_SIZE = 20;
export const GALLERY_GRID_IMAGE_SIZES =
  "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw";
export const GALLERY_LIGHTBOX_IMAGE_SIZES = "(max-width: 1024px) 100vw, 1024px";
export const COLUMN_COUNT_MOBILE = 2;
export const COLUMN_COUNT_TABLET = 3;
export const COLUMN_COUNT_DESKTOP = 4;
export const TABLET_BREAKPOINT = 768;
export const DESKTOP_BREAKPOINT = 1280;
export const MAX_RENDERED_IMAGES_MOBILE = 140;
export const MAX_RENDERED_IMAGES_TABLET = 200;
export const MAX_RENDERED_IMAGES_DESKTOP = 240;

export const getResponsiveGalleryConfig = (width: number) => {
  if (width >= DESKTOP_BREAKPOINT) {
    return {
      columnCount: COLUMN_COUNT_DESKTOP,
      maxRenderedImages: MAX_RENDERED_IMAGES_DESKTOP,
    };
  }

  if (width >= TABLET_BREAKPOINT) {
    return {
      columnCount: COLUMN_COUNT_TABLET,
      maxRenderedImages: MAX_RENDERED_IMAGES_TABLET,
    };
  }

  return {
    columnCount: COLUMN_COUNT_MOBILE,
    maxRenderedImages: MAX_RENDERED_IMAGES_MOBILE,
  };
};
