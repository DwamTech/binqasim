import { resolveMediaUrl } from "@/core/media/resolve-media-url";
import type { LibraryIndexSubmission } from "../domain/library-indexes.contracts";

export function presentLibraryIndexSubmission(
  item: LibraryIndexSubmission,
  backendApiUrl?: string,
): LibraryIndexSubmission {
  if (!item.image_url || !backendApiUrl) return item;
  return {
    ...item,
    image_url: resolveMediaUrl(item.image_url, backendApiUrl) ?? null,
  };
}
