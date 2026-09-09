import { resolveMediaUrl } from "@/core/media/resolve-media-url";

import type { AdminBookDetailResponse } from "../domain/books.contracts";

export type AdminBookDetailMedia = {
  coverUrl?: string;
  fileUrl?: string;
};

export function mapAdminBookDetailMedia(
  detail: AdminBookDetailResponse,
  backendUrl: string | undefined,
): AdminBookDetailMedia {
  if (backendUrl === undefined) return {};

  const coverUrl = resolveMediaUrl(detail.book.cover_path, backendUrl);
  const fileUrl = resolveMediaUrl(detail.book.file_path, backendUrl);

  return {
    ...(coverUrl === undefined ? {} : { coverUrl }),
    ...(fileUrl === undefined ? {} : { fileUrl }),
  };
}
