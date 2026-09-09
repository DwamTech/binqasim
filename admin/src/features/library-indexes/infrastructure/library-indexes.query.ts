import type {
  LibraryIndexSubmissionsQuery,
  LibraryIndexSubmissionStatus,
  LibraryIndexSubmissionType,
} from "../domain/library-indexes.contracts";
import { libraryIndexSubmissionsQuerySchema } from "../domain/library-indexes.schemas";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeLibraryIndexSubmissionsQuery(
  values: Record<string, string | string[] | undefined>,
): LibraryIndexSubmissionsQuery {
  const parsed = libraryIndexSubmissionsQuerySchema.safeParse(
    Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, first(value)])
        .filter(([, value]) => value !== undefined && value !== ""),
    ),
  );
  return parsed.success ? parsed.data : { page: 1, per_page: 20 };
}

export function libraryIndexSubmissionsHref(
  query: LibraryIndexSubmissionsQuery,
  changes: Partial<{
    type: LibraryIndexSubmissionType | "";
    status: LibraryIndexSubmissionStatus | "";
    search: string;
    page: number;
    per_page: number;
  }> = {},
): string {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.status) params.set("status", next.status);
  if (next.search?.trim()) params.set("search", next.search.trim());
  if (next.page !== 1) params.set("page", String(next.page));
  if (next.per_page !== 20) params.set("per_page", String(next.per_page));
  return `/dashboard/library-indexes${params.size ? `?${params}` : ""}`;
}
