import type { ScientificFatwaQuery } from "../domain/scientific-fatwas.contracts";
import { scientificFatwaQuerySchema } from "../domain/scientific-fatwas.schemas";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeScientificFatwaQuery(
  values: Record<string, string | string[] | undefined>,
): ScientificFatwaQuery {
  const result = scientificFatwaQuerySchema.safeParse(
    Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, first(value)])
        .filter(([, value]) => value !== undefined && value !== ""),
    ),
  );

  return result.success ? result.data : { page: 1, per_page: 20 };
}

export function scientificFatwaQueryParams(query: ScientificFatwaQuery) {
  const params = new URLSearchParams();
  for (const key of [
    "search",
    "category",
    "status",
    "is_featured",
    "is_listed",
  ] as const) {
    const value = query[key];
    if (value) params.set(key, value);
  }
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.per_page !== 20) params.set("per_page", String(query.per_page));
  return params;
}

export function scientificFatwaPageHref(
  query: ScientificFatwaQuery,
  page: number,
) {
  const params = scientificFatwaQueryParams({ ...query, page });
  return `/dashboard/scientific-fatwas${params.size ? `?${params}` : ""}`;
}
