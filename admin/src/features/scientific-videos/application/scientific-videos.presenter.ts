import type { ScientificVideoItem } from "../domain/scientific-videos";

export function presentScientificVideo(
  item: ScientificVideoItem,
): ScientificVideoItem {
  if (item.source_type !== "file") return item;
  const localFileUrl = `/api/scientific-videos/items/${encodeURIComponent(item.id)}/file`;
  return {
    ...item,
    admin_file_url: localFileUrl,
    source_url: localFileUrl,
    watch_url: localFileUrl,
  };
}
