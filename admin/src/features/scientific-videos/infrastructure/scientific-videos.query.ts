import {
  scientificVideoQuerySchema,
  type ScientificVideoQuery,
} from "../domain/scientific-videos";

export function normalizeScientificVideoQuery(
  raw: Record<string, string | string[] | undefined>,
): ScientificVideoQuery {
  const value = (key: string) =>
    Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key];
  const parsed = scientificVideoQuerySchema.safeParse({
    search: value("search") || undefined,
    category: value("category") || undefined,
    source_type: value("source_type") || undefined,
    status: value("status") || undefined,
    is_featured: value("is_featured") || undefined,
    page: value("page") || 1,
    per_page: value("per_page") || 20,
  });
  return parsed.success ? parsed.data : scientificVideoQuerySchema.parse({});
}

export function scientificVideoHref(
  query: ScientificVideoQuery,
  changes: Partial<ScientificVideoQuery> = {},
): string {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  Object.entries(next).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return `/dashboard/scientific-videos?${params.toString()}`;
}

export function readScientificVideoId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}
