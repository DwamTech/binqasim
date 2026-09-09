import {
  canAccessDashboardRoute,
  isDashboardAdmin,
} from "../../../core/authorization/dashboard-access";
import {
  adminOnlyDashboardModules,
  dashboardRouteAliases,
  dashboardModules,
} from "../../../core/authorization/dashboard-modules";
import {
  disabledDashboardModuleFlags,
  type DashboardFeatureModule,
  type DashboardModuleFlags,
} from "../../../core/config/dashboard-module-flags";
import type { AdminSummary } from "../../../features/auth/domain/auth.contracts";
import type { DashboardPendingReviewCounts } from "../../../features/dashboard-notifications/domain/pending-review-counts.contracts";

import type { NavigationItem } from "./admin-shell";

const dashboardNavigationEntries: Array<
  NavigationItem & {
    navigationOrder: number | undefined;
    featureFlag?: DashboardFeatureModule;
  }
> = [
  ...dashboardModules
    .filter(
      (module) =>
        module.integration === "available" &&
        module.route !== undefined &&
        module.navigationLabel !== undefined,
    )
    .map((module) => ({
      id: module.route?.split("/").at(-1) ?? module.permission,
      label: module.navigationLabel ?? module.label,
      href: module.route ?? "/dashboard",
      navigationOrder: module.navigationOrder,
      ...(module.featureFlag ? { featureFlag: module.featureFlag } : {}),
      ...(module.permission === "tour_guides.manage"
        ? {
            children: [
              {
                id: "tour-guides-overview",
                label: "نظرة عامة",
                href: "/dashboard/tour-guides",
              },
              {
                id: "tour-guides-management",
                label: "إدارة المرشدين السياحيين",
                href: "/dashboard/tour-guides/guides",
              },
              {
                id: "tour-requests-management",
                label: "إدارة الطلبات",
                href: "/dashboard/tour-guides/requests",
              },
            ],
          }
        : {}),
    })),
  ...dashboardRouteAliases.map((module) => ({
    id: module.id,
    label: module.label,
    href: module.route,
    navigationOrder: module.navigationOrder,
    featureFlag: module.featureFlag,
  })),
  {
    id: "programs",
    label: "إدارة البرامج والأنشطة",
    href: "/dashboard/programs",
    navigationOrder: 16,
    featureFlag: "programs",
  },
  {
    id: "email-management",
    label: "إدارة الإيميل",
    href: "https://mail.albakry.net/",
    external: true,
    navigationOrder: 39,
  },
  ...adminOnlyDashboardModules.map((module) => ({
    id: module.id,
    label: module.navigationLabel,
    href: module.route,
    navigationOrder: module.navigationOrder,
    ...(module.featureFlag ? { featureFlag: module.featureFlag } : {}),
    ...(module.id === "applications"
      ? {
          children: [
            {
              id: "applications-overview",
              label: "نظرة عامة",
              href: module.route,
            },
            {
              id: "applications-members",
              label: "عضوية الجمعية",
              href: `${module.route}/members`,
            },
            {
              id: "applications-volunteers",
              label: "متطوعو الجمعية",
              href: `${module.route}/volunteers`,
            },
            {
              id: "applications-guides",
              label: "الإرشاد السياحي",
              href: `${module.route}/guides`,
            },
            {
              id: "applications-jobs",
              label: "طلبات التوظيف",
              href: `${module.route}/jobs`,
            },
          ],
        }
      : module.id === "reports"
        ? {
            children: [
              {
                id: "reports-overview",
                label: "نظرة عامة",
                href: module.route,
              },
              {
                id: "reports-content",
                label: "المحتوى والنشر",
                href: `${module.route}/content`,
              },
              {
                id: "reports-users",
                label: "المستخدمون",
                href: `${module.route}/users`,
              },
              {
                id: "reports-support",
                label: "الدعم والطلبات",
                href: `${module.route}/support`,
              },
              {
                id: "reports-feedback",
                label: "الرضا والملاحظات",
                href: `${module.route}/feedback`,
              },
              {
                id: "reports-files",
                label: "الملفات والتخزين",
                href: `${module.route}/files`,
              },
              {
                id: "reports-seo",
                label: "تحسين الظهور",
                href: `${module.route}/seo`,
              },
            ],
          }
        : {}),
  })),
];

const dashboardNavigation: readonly (NavigationItem & {
  featureFlag?: DashboardFeatureModule;
})[] = dashboardNavigationEntries
  .sort(
    (left, right) =>
      (left.navigationOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.navigationOrder ?? Number.MAX_SAFE_INTEGER),
  )
  .map(({ id, label, href, children, external, featureFlag }) => ({
    id,
    label,
    href,
    ...(children ? { children } : {}),
    ...(external ? { external } : {}),
    ...(featureFlag ? { featureFlag } : {}),
  }));

function pendingReviewNotification(
  item: Pick<NavigationItem, "id">,
  counts: DashboardPendingReviewCounts,
): NavigationItem["notification"] | undefined {
  const count =
    item.id === "library-indexes"
      ? counts.libraryIndexes
      : item.id === "comments"
        ? counts.comments
        : item.id === "tour-guides"
          ? counts.tourRequestsNew
          : undefined;

  if (typeof count !== "number" || !Number.isSafeInteger(count) || count <= 0)
    return undefined;

  return {
    count,
    label:
      item.id === "comments"
        ? "تعليقات بانتظار المراجعة"
        : item.id === "tour-guides"
          ? "طلبات رحلات جديدة"
          : "طلبات بانتظار المراجعة",
  };
}

function withChildNotifications(
  children: NavigationItem[] | undefined,
  counts: DashboardPendingReviewCounts,
): NavigationItem[] | undefined {
  if (!children) return undefined;
  return children.map((child) => {
    if (
      child.id !== "tour-requests-management" ||
      typeof counts.tourRequestsNew !== "number" ||
      counts.tourRequestsNew <= 0
    ) {
      return child;
    }
    return {
      ...child,
      notification: {
        count: counts.tourRequestsNew,
        label: "طلبات رحلات جديدة",
      },
    };
  });
}

export function getDashboardNavigation(
  actor: AdminSummary,
  moduleFlags: DashboardModuleFlags = disabledDashboardModuleFlags,
  pendingReviewCounts: DashboardPendingReviewCounts = {},
): NavigationItem[] {
  return dashboardNavigation
    .filter(
      (item) =>
        (item.featureFlag === undefined || moduleFlags[item.featureFlag]) &&
        !(
          item.id === "fatwa-inbox" &&
          canAccessDashboardRoute(actor, "/dashboard/scientific-fatwas")
        ) &&
        (item.external
          ? isDashboardAdmin(actor)
          : canAccessDashboardRoute(actor, item.href)),
    )
    .map((item) => {
      const notification = pendingReviewNotification(item, pendingReviewCounts);
      const children = withChildNotifications(
        item.children,
        pendingReviewCounts,
      );
      return {
        id: item.id,
        label: item.label,
        href: item.href,
        ...(notification ? { notification } : {}),
        ...(children ? { children } : {}),
        ...(item.external ? { external: item.external } : {}),
      };
    });
}
