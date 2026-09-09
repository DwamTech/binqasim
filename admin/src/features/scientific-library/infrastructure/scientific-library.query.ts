import type { ScientificLibraryQuery } from "../domain/scientific-library.contracts";
import { scientificLibraryQuerySchema } from "../domain/scientific-library.schemas";

const queryKeys = [
  "search",
  "content_type",
  "scientific_field",
  "status",
  "source_type",
  "is_featured",
  "page",
  "per_page",
] as const;

type SearchInput = Record<string, string | string[] | undefined>;

export function normalizeScientificLibraryQuery(
  input: SearchInput,
): ScientificLibraryQuery {
  const candidate: Record<string, string> = {};
  for (const key of queryKeys) {
    const raw = input[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value) candidate[key] = value;
  }
  const parsed = scientificLibraryQuerySchema.safeParse(candidate);
  return parsed.success
    ? (parsed.data as ScientificLibraryQuery)
    : { page: 1, per_page: 20 };
}

export function scientificLibraryQueryParams(
  query: ScientificLibraryQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of queryKeys.slice(0, 6)) {
    const value = query[key as keyof ScientificLibraryQuery];
    if (typeof value === "string" && value !== "") params.set(key, value);
  }
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.per_page !== 20) params.set("per_page", String(query.per_page));
  return params;
}

export function scientificLibraryListHref(
  query: ScientificLibraryQuery,
  overrides: Partial<ScientificLibraryQuery> = {},
): string {
  const next = { ...query, ...overrides };
  const params = scientificLibraryQueryParams(next);
  return `/dashboard/library${params.size ? `?${params}` : ""}`;
}

export function readScientificLibraryId(value: string): string | undefined {
  return /^[1-9]\d*$/.test(value) ? value : undefined;
}
