import type { CommentsQuery } from "../domain/comments.contracts";
import { normalizeCommentsQuery } from "../domain/comments.schemas";

export const commentsQueryKeys = {
  search: "search",
  status: "status",
  targetType: "target_type",
  page: "page",
  perPage: "per_page",
} as const;

export function commentsQueryFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
): CommentsQuery {
  return normalizeCommentsQuery({
    search: searchParams.get(commentsQueryKeys.search) ?? undefined,
    status: searchParams.get(commentsQueryKeys.status) ?? undefined,
    target_type: searchParams.get(commentsQueryKeys.targetType) ?? undefined,
    page: searchParams.get(commentsQueryKeys.page) ?? 1,
    per_page: searchParams.get(commentsQueryKeys.perPage) ?? 20,
  });
}

export function commentsQueryToSearchParams(
  query: CommentsQuery,
): URLSearchParams {
  const normalized = normalizeCommentsQuery(query);
  const params = new URLSearchParams({
    [commentsQueryKeys.page]: String(normalized.page),
    [commentsQueryKeys.perPage]: String(normalized.per_page),
  });
  if (normalized.search)
    params.set(commentsQueryKeys.search, normalized.search);
  if (normalized.status)
    params.set(commentsQueryKeys.status, normalized.status);
  if (normalized.target_type)
    params.set(commentsQueryKeys.targetType, normalized.target_type);
  return params;
}

export function commentsQueryToBackend(query: CommentsQuery) {
  const normalized = normalizeCommentsQuery(query);
  return {
    ...(normalized.search ? { search: normalized.search } : {}),
    ...(normalized.status ? { status: normalized.status } : {}),
    ...(normalized.target_type ? { target_type: normalized.target_type } : {}),
    page: normalized.page,
    per_page: normalized.per_page,
  };
}
