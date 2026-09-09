import type {
  ListeningSeries,
  ListeningSession,
} from "../domain/listening.contracts";

export type ListeningWorkspaceStatus = "all" | "published" | "draft";

function includesText(values: Array<string | null | undefined>, query: string) {
  const normalized = query.trim().toLocaleLowerCase("ar");
  return (
    normalized === "" ||
    values.some((value) => value?.toLocaleLowerCase("ar").includes(normalized))
  );
}

function matchesStatus(isPublished: boolean, status: ListeningWorkspaceStatus) {
  return (
    status === "all" ||
    (status === "published" && isPublished) ||
    (status === "draft" && !isPublished)
  );
}

export function filterWorkspaceSeries(
  series: ListeningSeries[],
  search: string,
  status: ListeningWorkspaceStatus,
) {
  return series.filter(
    (item) =>
      matchesStatus(item.is_published, status) &&
      includesText(
        [item.title, item.short_title, item.category, item.slug],
        search,
      ),
  );
}

export function filterWorkspaceSessions(
  sessions: ListeningSession[],
  search: string,
  status: ListeningWorkspaceStatus,
) {
  return sessions.filter(
    (item) =>
      matchesStatus(item.is_published, status) &&
      includesText([item.title, item.description, item.date_label], search),
  );
}

export function resolveWorkspaceSeriesId(
  series: ListeningSeries[],
  requestedId?: string,
): string | null {
  if (requestedId && series.some((item) => item.id === requestedId)) {
    return requestedId;
  }
  return series[0]?.id ?? null;
}

export function resolveSeriesAfterDelete(
  series: ListeningSeries[],
  deletedId: string,
  selectedId?: string | null,
): { remaining: ListeningSeries[]; selectedId: string | null } {
  const deletedIndex = series.findIndex((item) => item.id === deletedId);
  const remaining = series.filter((item) => item.id !== deletedId);
  if (remaining.length === 0) return { remaining, selectedId: null };
  if (
    selectedId &&
    selectedId !== deletedId &&
    remaining.some((item) => item.id === selectedId)
  ) {
    return { remaining, selectedId };
  }
  const nearbyIndex =
    deletedIndex < 0 ? 0 : Math.min(deletedIndex, remaining.length - 1);
  return { remaining, selectedId: remaining[nearbyIndex]?.id ?? null };
}

export function upsertWorkspaceRecord<T extends { id: string }>(
  records: T[],
  record: T,
): T[] {
  const index = records.findIndex((item) => item.id === record.id);
  if (index < 0) return [record, ...records];
  return records.map((item) => (item.id === record.id ? record : item));
}

export function updateSeriesSessionCounts(
  series: ListeningSeries[],
  seriesId: string,
  totalDelta: number,
  publishedDelta: number,
): ListeningSeries[] {
  return series.map((item) =>
    item.id === seriesId
      ? {
          ...item,
          sessions_count: Math.max(0, item.sessions_count + totalDelta),
          published_sessions_count: Math.max(
            0,
            item.published_sessions_count + publishedDelta,
          ),
        }
      : item,
  );
}
