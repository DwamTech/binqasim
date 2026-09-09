import { articleQuerySchema, type ArticleQuery } from "./articles.contracts";

export function normalizeArticleQuery(
  input: Record<string, string | undefined>,
): ArticleQuery {
  const candidate = {
    ...(input.search?.trim() ? { search: input.search.trim() } : {}),
    ...(input.section_id ? { section_id: input.section_id } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.author ? { author: input.author } : {}),
    ...(input.date ? { date: input.date } : {}),
    ...(input.page ? { page: input.page } : {}),
    ...(input.per_page ? { per_page: input.per_page } : {}),
  };
  const parsed = articleQuerySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { page: 1, per_page: 20 };
}

export function articleQueryParams(query: ArticleQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.section_id) params.set("section_id", query.section_id);
  if (query.status) params.set("status", query.status);
  if (query.author) params.set("author", query.author);
  if (query.date) params.set("date", query.date);
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.per_page !== 20) params.set("per_page", String(query.per_page));
  return params;
}
