import { resolveMediaUrl } from "../../../core/media/resolve-media-url";
import type {
  GalleryMediaItem,
  GalleryMediaPaginator,
} from "../domain/gallery-media.contracts";

export function mapGalleryMediaItem(
  item: GalleryMediaItem,
  backendUrl: string | undefined,
): GalleryMediaItem {
  const source = item.url?.trim() ? item.url : item.path;
  const url =
    backendUrl === undefined ? undefined : resolveMediaUrl(source, backendUrl);
  return { ...item, url: url ?? null };
}
export function mapGalleryMediaPaginator(
  paginator: GalleryMediaPaginator,
  backendUrl: string | undefined,
): GalleryMediaPaginator {
  return {
    ...paginator,
    data: paginator.data.map((item) => mapGalleryMediaItem(item, backendUrl)),
  };
}
