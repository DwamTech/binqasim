import "server-only";

import type { VisualListQuery } from "../domain/visuals.contracts";
import { VisualsRepository } from "../infrastructure/visuals.repository";
import {
  mapVisualMedia,
  mapVisualPaginatorMedia,
} from "../infrastructure/visuals.mapper";

const repository = new VisualsRepository();

export async function getVisuals(query: VisualListQuery) {
  const result = await repository.list(query);
  return result.success
    ? { ...result, data: mapVisualPaginatorMedia(result.data) }
    : result;
}

export function getVisualSections() {
  return repository.sections();
}

export async function getVisual(id: string) {
  const result = await repository.detail(id);
  return result.success
    ? { ...result, data: mapVisualMedia(result.data) }
    : result;
}
