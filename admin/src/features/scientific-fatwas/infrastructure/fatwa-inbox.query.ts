import type { FatwaInboxQuery } from "../domain/fatwa-inbox.contracts";
import { fatwaInboxQuerySchema } from "../domain/fatwa-inbox.schemas";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeFatwaInboxQuery(
  values: Record<string, string | string[] | undefined>,
): FatwaInboxQuery {
  const result = fatwaInboxQuerySchema.safeParse(
    Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, first(value)])
        .filter(([, value]) => value !== undefined && value !== ""),
    ),
  );
  return result.success ? result.data : { page: 1, per_page: 20 };
}

export function fatwaInboxPageHref(query: FatwaInboxQuery, page: number) {
  const params = new URLSearchParams();
  for (const key of ["search", "status", "visibility"] as const) {
    const value = query[key];
    if (value) params.set(key, value);
  }
  if (page !== 1) params.set("page", String(page));
  if (query.per_page !== 20) params.set("per_page", String(query.per_page));
  return `/dashboard/scientific-fatwas/inbox${params.size ? `?${params}` : ""}`;
}
