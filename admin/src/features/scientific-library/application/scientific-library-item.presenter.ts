import { resolveMediaUrl } from "@/core/media/resolve-media-url";
import type { ScientificLibraryItem } from "../domain/scientific-library.contracts";

export function scientificLibraryPrivateFileHref(
  item: ScientificLibraryItem,
): string | null {
  return item.source_type === "file" &&
    /^[1-9]\d*$/.test(item.id) &&
    (item.file_path || item.admin_file_url)
    ? `/api/scientific-library/items/${item.id}/file`
    : null;
}

export function presentScientificLibraryItem(
  item: ScientificLibraryItem,
  backendApiUrl?: string,
): ScientificLibraryItem {
  const coverUrl =
    item.cover_url ??
    (backendApiUrl
      ? resolveMediaUrl(item.cover_path, backendApiUrl)
      : undefined);
  const privateFileUrl = scientificLibraryPrivateFileHref(item);

  return {
    ...item,
    // The backend storage key is server-internal. Presence and preview are
    // represented by the authenticated local BFF URL instead.
    file_path: null,
    cover_url: coverUrl ?? null,
    admin_file_url: privateFileUrl,
    reader_url: item.source_type === "file" ? privateFileUrl : item.reader_url,
    source_url:
      item.source_type === "file"
        ? privateFileUrl
        : (item.source_url ?? item.source_link),
  };
}
