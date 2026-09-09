import "server-only";

import { serverEnv } from "@/core/env/server";

import type { Visual, VisualPaginator } from "../domain/visuals.contracts";
import {
  mapVisualMediaWithBackend,
  mapVisualPaginatorMediaWithBackend,
} from "./visuals.media-mapper";

/** Resolves storage paths on the server so client components never need the backend origin. */
export function mapVisualMedia(visual: Visual): Visual {
  return mapVisualMediaWithBackend(visual, serverEnv.BACKEND_API_URL);
}

export function mapVisualPaginatorMedia(
  paginator: VisualPaginator,
): VisualPaginator {
  return mapVisualPaginatorMediaWithBackend(
    paginator,
    serverEnv.BACKEND_API_URL,
  );
}
