import type { AdminBooksQuery, BookType } from "../domain/books.contracts";

type SearchParameters = Record<string, string | string[] | undefined>;

function positiveInteger(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export function readBooksQuery(values: SearchParameters): AdminBooksQuery {
  const query: AdminBooksQuery = {};
  const type = values.type;
  if (type === "single" || type === "part") query.type = type as BookType;

  const sectionId = positiveInteger(values.section_id);
  const seriesId = positiveInteger(values.series_id);
  const page = positiveInteger(values.page);
  if (sectionId !== undefined) query.section_id = sectionId;
  if (seriesId !== undefined) query.series_id = seriesId;
  if (page !== undefined) query.page = page;
  return query;
}

export function readBooksRouteId(value: string): string | undefined {
  const id = positiveInteger(value);
  return id === undefined ? undefined : String(id);
}

export function booksListHref(
  query: AdminBooksQuery,
  page?: number,
  basePath = "/dashboard/books",
): string {
  const parameters = new URLSearchParams();
  if (query.section_id !== undefined)
    parameters.set("section_id", String(query.section_id));
  if (query.series_id !== undefined)
    parameters.set("series_id", String(query.series_id));
  if (query.type !== undefined) parameters.set("type", query.type);
  if (page !== undefined && page > 1) parameters.set("page", String(page));
  const search = parameters.toString();
  return search === "" ? basePath : `${basePath}?${search}`;
}
