import { bookTypeSchema } from "../domain/books.schemas";
import type { AdminBooksQuery } from "../domain/books.contracts";

function positiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

/** Keeps the backend list request limited to its confirmed read contract. */
export function compactBooksQuery(query: AdminBooksQuery): AdminBooksQuery {
  const compacted: AdminBooksQuery = {};
  if (query.area === "governance" || query.area === "programs")
    compacted.area = query.area;
  const sectionId = positiveInteger(query.section_id);
  const seriesId = positiveInteger(query.series_id);
  const page = positiveInteger(query.page);
  const type = bookTypeSchema.safeParse(query.type);

  if (sectionId !== undefined) compacted.section_id = sectionId;
  if (seriesId !== undefined) compacted.series_id = seriesId;
  if (type.success) compacted.type = type.data;
  if (page !== undefined) compacted.page = page;

  return compacted;
}
