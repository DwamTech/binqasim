export const commentsBackendEndpoints = {
  list: "/admin/comments",
  options: "/admin/comments/options",
  stats: "/admin/comments/stats",
  detail: (id: string) => `/admin/comments/${encodeURIComponent(id)}`,
  approve: (id: string) => `/admin/comments/${encodeURIComponent(id)}/approve`,
  bulkDelete: "/admin/comments/bulk-delete",
} as const;

export const commentsDashboardApiEndpoints = {
  list: "/api/comments",
  options: "/api/comments/options",
  stats: "/api/comments/stats",
  detail: (id: string | number) =>
    `/api/comments/${encodeURIComponent(String(id))}`,
  approve: (id: string | number) =>
    `/api/comments/${encodeURIComponent(String(id))}/approve`,
  bulkDelete: "/api/comments/bulk-delete",
} as const;
