import type { GalleryMediaListQuery } from "../domain/gallery-media.contracts";

export function compactGalleryMediaQuery(query: GalleryMediaListQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  );
}
