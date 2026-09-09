import type { DashboardPermission } from "../../features/auth/domain/auth.contracts";
import { dashboardCopy } from "../config/dashboard-copy";
import type { DashboardFeatureModule } from "../config/dashboard-module-flags";

export type DashboardModuleIntegration =
  "available" | "backend-only" | "deferred";
export type DashboardModuleAccess = DashboardPermission | "admin";
export type DashboardPermissionGroup =
  "base" | "content" | "operations" | "reserved";

export type DashboardModuleMetadata = {
  permission: DashboardPermission;
  label: string;
  group: DashboardPermissionGroup;
  integration: DashboardModuleIntegration;
  delegation: "delegated" | "admin-only";
  route?: string;
  navigationLabel?: string;
  navigationOrder?: number;
  featureFlag?: DashboardFeatureModule;
};

export type DashboardRouteAliasMetadata = {
  id: string;
  label: string;
  route: string;
  permission: DashboardPermission;
  navigationOrder: number;
  featureFlag: DashboardFeatureModule;
};

export type AdminOnlyDashboardModuleMetadata = {
  id: string;
  label: string;
  route: string;
  navigationLabel: string;
  navigationOrder: number;
  featureFlag?: DashboardFeatureModule;
};

export const dashboardModules: readonly DashboardModuleMetadata[] = [
  {
    permission: "dashboard.view",
    label: `دخول ${dashboardCopy.common.dashboard}`,
    group: "base",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard",
    navigationLabel: dashboardCopy.common.dashboard,
    navigationOrder: 0,
  },
  {
    permission: "articles.manage",
    label: dashboardCopy.modules.articles.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/articles",
    navigationLabel: dashboardCopy.modules.articles.navigation,
    navigationOrder: 20,
    featureFlag: "articles",
  },
  {
    permission: "books.manage",
    label: dashboardCopy.modules.books.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/governance",
    navigationLabel: "إدارة الحوكمة",
    navigationOrder: 15,
    featureFlag: "governance",
  },
  {
    permission: "dissertations.manage",
    label: dashboardCopy.modules.dissertations.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/dissertations",
    navigationLabel: dashboardCopy.modules.dissertations.navigation,
    navigationOrder: 17,
    featureFlag: "dissertations",
  },
  {
    permission: "library_indexes.manage",
    label: dashboardCopy.modules.libraryIndexes.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/library-indexes",
    navigationLabel: dashboardCopy.modules.libraryIndexes.navigation,
    navigationOrder: 16.5,
    featureFlag: "libraryIndexes",
  },
  {
    permission: "comments.manage",
    label: dashboardCopy.modules.comments.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/comments",
    navigationLabel: dashboardCopy.modules.comments.navigation,
    navigationOrder: 22,
    featureFlag: "comments",
  },
  {
    permission: "listening.manage",
    label: dashboardCopy.modules.listening.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/listening",
    navigationLabel: dashboardCopy.modules.listening.navigation,
    navigationOrder: 15,
    featureFlag: "listening",
  },
  {
    permission: "hadith_cards.manage",
    label: dashboardCopy.modules.hadithCards.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/hadith-cards",
    navigationLabel: dashboardCopy.modules.hadithCards.navigation,
    navigationOrder: 15.5,
    featureFlag: "hadithCards",
  },
  {
    permission: "visuals.manage",
    label: dashboardCopy.modules.visuals.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/visuals",
    navigationLabel: dashboardCopy.modules.visuals.navigation,
    navigationOrder: 19,
    featureFlag: "legacyVisuals",
  },
  {
    permission: "fatwas.manage",
    label: dashboardCopy.modules.scientificFatwas.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/scientific-fatwas",
    navigationLabel: dashboardCopy.modules.scientificFatwas.navigation,
    navigationOrder: 18,
    featureFlag: "scientificFatwas",
  },
  {
    permission: "fatwas.view",
    label: "عرض صندوق أسئلة الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.view_details",
    label: "عرض تفاصيل أسئلة الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.view_private",
    label: "عرض إجابات الفتاوى الخاصة",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.answer",
    label: "إجابة أسئلة الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.update_answer",
    label: "تعديل إجابات الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.archive",
    label: "أرشفة أسئلة الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "fatwas.restore",
    label: "استعادة أسئلة الفتاوى",
    group: "content",
    integration: "available",
    delegation: "delegated",
  },
  {
    permission: "gallery.manage",
    label: dashboardCopy.modules.gallery.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/gallery-media",
    navigationLabel: dashboardCopy.modules.gallery.navigation,
    navigationOrder: 25,
    featureFlag: "galleryMedia",
  },
  {
    permission: "sections.manage",
    label: dashboardCopy.modules.sections.navigation,
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/sections",
    navigationLabel: dashboardCopy.modules.sections.navigation,
    navigationOrder: 10,
    featureFlag: "sections",
  },
  {
    permission: "pages.view",
    label: "إدارة الصفحات",
    group: "content",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/pages",
    navigationLabel: "إدارة الصفحات",
    navigationOrder: 21,
    featureFlag: "pages",
  },
  {
    permission: "pages.create",
    label: "إنشاء الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.update",
    label: "تعديل الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.publish",
    label: "نشر الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.preview",
    label: "معاينة الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.archive",
    label: "أرشفة الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.restore",
    label: "استعادة الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "pages.delete",
    label: "حذف الصفحات",
    group: "content",
    integration: "backend-only",
    delegation: "delegated",
  },
  {
    permission: "supervisors.manage",
    label: dashboardCopy.modules.supervisors.navigation,
    group: "reserved",
    integration: "available",
    delegation: "admin-only",
    route: "/dashboard/supervisors",
    navigationLabel: dashboardCopy.modules.supervisors.navigation,
    navigationOrder: 30,
  },
  {
    permission: "tour_guides.manage",
    label: "إدارة المرشدين السياحيين السياحيين وطلبات الرحلات",
    group: "operations",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/tour-guides",
    navigationLabel: "إدارة الرحلات السياحية",
    navigationOrder: 33,
    featureFlag: "tourGuides",
  },
  {
    permission: "reports.view",
    label: dashboardCopy.modules.reports.navigation,
    group: "operations",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/reports",
    navigationLabel: dashboardCopy.modules.reports.navigation,
    navigationOrder: 35,
  },
  {
    permission: "seo.manage",
    label: "إدارة SEO",
    group: "reserved",
    integration: "deferred",
    delegation: "admin-only",
  },
  {
    permission: "settings.manage",
    label: dashboardCopy.modules.settings.navigation,
    group: "operations",
    integration: "available",
    delegation: "delegated",
    route: "/dashboard/settings",
    navigationLabel: dashboardCopy.modules.settings.navigation,
    navigationOrder: 40,
  },
];

export const dashboardRouteAliases: readonly DashboardRouteAliasMetadata[] = [
  {
    id: "library",
    label: dashboardCopy.modules.library.navigation,
    route: "/dashboard/library",
    permission: "books.manage",
    navigationOrder: 16,
    featureFlag: "library",
  },
  {
    id: "scientific-videos",
    label: dashboardCopy.modules.scientificVideos.navigation,
    route: "/dashboard/scientific-videos",
    permission: "visuals.manage",
    navigationOrder: 19,
    featureFlag: "scientificVideos",
  },
  {
    id: "fatwa-inbox",
    label: "صندوق أسئلة الفتاوى",
    route: "/dashboard/scientific-fatwas/inbox",
    permission: "fatwas.view",
    navigationOrder: 18.5,
    featureFlag: "scientificFatwas",
  },
];

export const adminOnlyDashboardModules: readonly AdminOnlyDashboardModuleMetadata[] =
  [
    {
      id: "feedback",
      label: "إدارة الشكاوى والمقترحات",
      route: "/dashboard/feedback",
      navigationLabel: "الشكاوى والمقترحات",
      navigationOrder: 35,
      featureFlag: "feedback",
    },
    {
      id: "applications",
      label: "إدارة طلبات الانضمام",
      route: "/dashboard/applications",
      navigationLabel: "طلبات الانضمام",
      navigationOrder: 34,
      featureFlag: "applications",
    },
  ];

export const dashboardModuleByPermission = Object.fromEntries(
  dashboardModules.map((dashboardModule) => [
    dashboardModule.permission,
    dashboardModule,
  ]),
) as Record<DashboardPermission, DashboardModuleMetadata>;

export const dashboardPermissionLabels = Object.fromEntries(
  dashboardModules.map((dashboardModule) => [
    dashboardModule.permission,
    dashboardModule.label,
  ]),
) as Record<DashboardPermission, string>;

export function getDashboardModuleStatus(
  permission: DashboardPermission,
): string | null {
  const dashboardModule = dashboardModuleByPermission[permission];
  if (dashboardModule.delegation === "admin-only") {
    return dashboardModule.integration === "deferred"
      ? "محجوزة — التنفيذ مؤجل"
      : "متاحة للمدير فقط";
  }
  if (dashboardModule.integration === "backend-only")
    return "الباك إند جاهز — الواجهة مؤجلة";
  if (dashboardModule.integration === "deferred") return "التنفيذ مؤجل";
  return null;
}
