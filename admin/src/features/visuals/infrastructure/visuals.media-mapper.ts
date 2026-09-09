import { resolveMediaUrl } from "../../../core/media/resolve-media-url";

import type { Visual, VisualPaginator } from "../domain/visuals.contracts";

/** Maps documented `file_path` and legacy `file` fields to safe, absolute media URLs. */
export function mapVisualMediaWithBackend(
  visual: Visual,
  backendUrl: string | undefined,
): Visual {
  const fileSource = visual.file_path ?? visual.file;
  const hasFileSource =
    visual.file_path !== undefined || visual.file !== undefined;
  const file =
    backendUrl === undefined
      ? undefined
      : resolveMediaUrl(fileSource, backendUrl);
  const thumbnail =
    backendUrl === undefined
      ? undefined
      : resolveMediaUrl(visual.thumbnail, backendUrl);

  return {
    ...visual,
    ...(hasFileSource ? { file: file ?? null, file_path: file ?? null } : {}),
    ...(visual.thumbnail === undefined ? {} : { thumbnail: thumbnail ?? null }),
  };
}

export function mapVisualPaginatorMediaWithBackend(
  paginator: VisualPaginator,
  backendUrl: string | undefined,
): VisualPaginator {
  return {
    ...paginator,
    data: paginator.data.map((visual) =>
      mapVisualMediaWithBackend(visual, backendUrl),
    ),
  };
}
