import type {
  ListeningSeriesQuery,
  ListeningSessionQuery,
} from "../domain/listening.contracts";
import {
  listeningSeriesQuerySchema,
  listeningSessionQuerySchema,
} from "../domain/listening.schemas";

type RawQuery = Record<string, string | string[] | undefined>;

function candidate(input: RawQuery, keys: readonly string[]) {
  return Object.fromEntries(
    keys
      .map((key) => {
        const raw = input[key];
        return [key, typeof raw === "string" ? raw.trim() : undefined];
      })
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

export function normalizeListeningSeriesQuery(input: RawQuery): ListeningSeriesQuery {
  const result = listeningSeriesQuerySchema.safeParse(
    candidate(input, ["search", "category", "is_published", "page", "per_page"]),
  );
  return result.success ? result.data : { page: 1, per_page: 20 };
}

export function normalizeListeningSessionQuery(
  input: RawQuery,
): ListeningSessionQuery {
  const result = listeningSessionQuerySchema.safeParse(
    candidate(input, ["search", "series_id", "is_published", "page", "per_page"]),
  );
  return result.success ? result.data : { page: 1, per_page: 20 };
}

function queryParams(
  query: ListeningSeriesQuery | ListeningSessionQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (key === "page" && value === 1) continue;
    if (key === "per_page" && value === 20) continue;
    params.set(key, String(value));
  }
  return params;
}

export const listeningSeriesQueryParams = (query: ListeningSeriesQuery) =>
  queryParams(query);
export const listeningSessionQueryParams = (query: ListeningSessionQuery) =>
  queryParams(query);

export function listeningSeriesPageHref(
  query: ListeningSeriesQuery,
  page: number,
) {
  const params = listeningSeriesQueryParams({ ...query, page });
  return `/dashboard/listening${params.size ? `?${params}` : ""}`;
}

export function listeningSessionPageHref(
  query: ListeningSessionQuery,
  page: number,
) {
  const params = listeningSessionQueryParams({ ...query, page });
  return `/dashboard/listening/sessions${params.size ? `?${params}` : ""}`;
}
