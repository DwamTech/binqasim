import type {
  TourGuidesQuery,
  TourRequestsQuery,
} from "../domain/tour-guides.contracts";

export function tourGuidesQueryToBackend(query: TourGuidesQuery) {
  return {
    search: query.search,
    is_active:
      query.is_active === undefined
        ? undefined
        : query.is_active === "true"
          ? 1
          : 0,
    page: query.page,
    per_page: query.per_page,
  };
}

export function tourRequestsQueryToBackend(query: TourRequestsQuery) {
  return {
    search: query.search,
    status: query.status,
    guide_id: query.guide_id,
    date_from: query.date_from,
    date_to: query.date_to,
    page: query.page,
    per_page: query.per_page,
  };
}
