import type { DissertationQuery } from "../domain/dissertations.contracts";
import { dissertationQuerySchema } from "../domain/dissertations.schemas";

export function normalizeDissertationQuery(
  input: Record<string, string | string[] | undefined>,
): DissertationQuery {
  const value = (key: string) => {
    const raw = input[key];
    return typeof raw === "string" ? raw : undefined;
  };
  const candidate = Object.fromEntries(
    [
      "search",
      "year",
      "university",
      "specialization",
      "participation_type",
      "degree",
      "is_published",
      "status",
      "page",
      "per_page",
    ]
      .map((key) => [key, value(key)?.trim()])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  const parsed = dissertationQuerySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { page: 1, per_page: 20 };
}

export function dissertationQueryParams(
  query: DissertationQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of [
    "search",
    "year",
    "university",
    "specialization",
    "participation_type",
    "degree",
    "is_published",
    "status",
  ] as const) {
    const value = query[key];
    if (value) params.set(key, value);
  }
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.per_page !== 20) params.set("per_page", String(query.per_page));
  return params;
}

export function dissertationPageHref(
  query: DissertationQuery,
  page: number,
): string {
  const params = dissertationQueryParams({ ...query, page });
  return `/dashboard/dissertations${params.size ? `?${params}` : ""}`;
}
