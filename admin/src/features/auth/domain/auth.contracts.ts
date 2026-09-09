export type AdminRole =
  "admin" | "editor" | "author" | "reviewer" | "super_admin";

export const dashboardPermissions = [
  "dashboard.view",
  "articles.manage",
  "books.manage",
  "dissertations.manage",
  "listening.manage",
  "hadith_cards.manage",
  "visuals.manage",
  "gallery.manage",
  "sections.manage",
  "supervisors.manage",
  "reports.view",
  "seo.manage",
  "settings.manage",
  "pages.view",
  "pages.create",
  "pages.update",
  "pages.publish",
  "pages.preview",
  "pages.archive",
  "pages.restore",
  "pages.delete",
  "fatwas.view",
  "fatwas.view_details",
  "fatwas.view_private",
  "fatwas.manage",
  "fatwas.answer",
  "fatwas.update_answer",
  "fatwas.archive",
  "fatwas.restore",
  "library_indexes.manage",
  "comments.manage",
  "tour_guides.manage",
] as const;
export type DashboardPermission = (typeof dashboardPermissions)[number];

export type AdminSummary = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: true;
  dashboardPermissions: readonly DashboardPermission[];
};

export type LoginCredentials = {
  identity: string;
  password: string;
};

export type AdminSessionResult = {
  admin: AdminSummary;
  /** Laravel Sanctum personal-access token. Server-only; never serialize it. */
  token: string;
};
