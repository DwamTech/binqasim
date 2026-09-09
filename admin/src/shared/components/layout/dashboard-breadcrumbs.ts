import {
  adminOnlyDashboardModules,
  dashboardRouteAliases,
  dashboardModules,
} from "../../../core/authorization/dashboard-modules";
import { dashboardCopy } from "../../../core/config/dashboard-copy";

export type DashboardBreadcrumb = {
  label: string;
  href?: string;
};

const staticRoutes = new Map<string, string>([
  ["/dashboard", dashboardCopy.common.dashboard],
  ["/dashboard/account", dashboardCopy.common.account],
  ["/dashboard/no-access", "غير مصرح"],
]);

const childLabels: Record<
  string,
  { detail: string; create: string; edit: string }
> = {
  sections: {
    detail: dashboardCopy.modules.sections.pages.detail,
    create: dashboardCopy.modules.sections.pages.create,
    edit: dashboardCopy.modules.sections.pages.edit,
  },
  supervisors: {
    detail: dashboardCopy.modules.supervisors.pages.detail,
    create: dashboardCopy.modules.supervisors.pages.create,
    edit: dashboardCopy.modules.supervisors.pages.edit,
  },
  visuals: {
    detail: dashboardCopy.modules.visuals.pages.detail,
    create: dashboardCopy.modules.visuals.pages.create,
    edit: dashboardCopy.modules.visuals.pages.edit,
  },
  articles: {
    detail: dashboardCopy.modules.articles.pages.detail,
    create: dashboardCopy.modules.articles.pages.create,
    edit: dashboardCopy.modules.articles.pages.edit,
  },
  books: {
    detail: dashboardCopy.modules.books.pages.detail,
    create: dashboardCopy.modules.books.pages.create,
    edit: dashboardCopy.modules.books.pages.edit,
  },
  library: {
    detail: "تفاصيل المصنَّف",
    create: "إضافة مصنَّف",
    edit: "تعديل المصنَّف",
  },
  dissertations: {
    detail: "تفاصيل الرسالة العلمية",
    create: "إضافة رسالة علمية",
    edit: "تعديل الرسالة العلمية",
  },
  listening: {
    detail: "تفاصيل سلسلة السماع",
    create: "إضافة سلسلة سماع",
    edit: "تعديل سلسلة السماع",
  },
  "hadith-cards": {
    detail: "إدارة مشروع البطاقات",
    create: "إضافة مشروع بطاقات",
    edit: "تعديل مشروع البطاقات",
  },
  "scientific-fatwas": {
    detail: "تفاصيل المسألة العلمية",
    create: "إضافة مسألة علمية",
    edit: "تعديل المسألة العلمية",
  },
  "scientific-videos": {
    detail: "تفاصيل المادة المرئية",
    create: "إضافة مادة مرئية",
    edit: "تعديل المادة المرئية",
  },
  "library-indexes": {
    detail: "تفاصيل طلب السجل",
    create: "",
    edit: "",
  },
  comments: {
    detail: "تفاصيل التعليق",
    create: "",
    edit: "",
  },
  "tour-guides": {
    detail: "تفاصيل طلب الرحلة",
    create: "إضافة مرشد سياحي",
    edit: "تعديل المرشد السياحي",
  },
  governance: {
    detail: "تفاصيل الكتاب",
    create: "إضافة كتاب",
    edit: "تعديل الكتاب",
  },
  programs: {
    detail: "تفاصيل الكتاب",
    create: "إضافة كتاب",
    edit: "تعديل الكتاب",
  },
};

const applicationLabels: Record<string, string> = {
  members: "عضوية الجمعية",
  volunteers: "متطوعو الجمعية",
  guides: "الإرشاد السياحي",
  jobs: "طلبات التوظيف",
};

const reportLabels: Record<string, string> = {
  content: "المحتوى والنشر",
  users: "المستخدمون",
  support: "الدعم والطلبات",
  feedback: "الرضا والملاحظات",
  files: "الملفات والتخزين",
  seo: "تحسين الظهور",
};

const moduleRoutes = dashboardModules
  .filter(
    (module) =>
      module.route !== undefined && module.navigationLabel !== undefined,
  )
  .map((module) => ({
    route: module.route as string,
    label: module.navigationLabel as string,
  }))
  .sort((left, right) => right.route.length - left.route.length);

for (const dashboardModule of adminOnlyDashboardModules) {
  moduleRoutes.push({
    route: dashboardModule.route,
    label: dashboardModule.navigationLabel,
  });
}
for (const dashboardModule of dashboardRouteAliases) {
  if (dashboardModule.id === "fatwa-inbox") continue;
  moduleRoutes.push({
    route: dashboardModule.route,
    label: dashboardModule.label,
  });
}
moduleRoutes.push(
  {
    route: "/dashboard/programs",
    label: "إدارة البرامج والأنشطة",
  },
  {
    route: "/dashboard/books",
    label: dashboardCopy.modules.books.navigation,
  },
);
moduleRoutes.sort((left, right) => right.route.length - left.route.length);

export function getDashboardBreadcrumbs(
  pathname: string,
): DashboardBreadcrumb[] {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const staticLabel = staticRoutes.get(normalized);
  if (staticLabel) return [{ label: staticLabel }];

  const parent = moduleRoutes.find(
    (module) =>
      normalized === module.route || normalized.startsWith(`${module.route}/`),
  );
  if (!parent)
    return [{ label: dashboardCopy.common.dashboard, href: "/dashboard" }];
  if (normalized === parent.route) return [{ label: parent.label }];

  const moduleKey = parent.route.split("/").at(-1) ?? "";
  const labels = childLabels[moduleKey];
  const remainder = normalized.slice(parent.route.length + 1).split("/");
  let childLabel = "التفاصيل";

  if (
    (moduleKey === "governance" || moduleKey === "programs") &&
    remainder[0] === "categories"
  ) {
    childLabel = dashboardCopy.modules.sections.navigation;
  } else if (moduleKey === "books" && remainder[0] === "series") {
    childLabel =
      remainder.length > 1
        ? dashboardCopy.modules.books.series.detail
        : dashboardCopy.modules.books.series.manage;
  } else if (moduleKey === "applications") {
    const applicationLabel = applicationLabels[remainder[0] ?? ""] ?? "الطلبات";
    childLabel =
      remainder[1] === "new"
        ? `إضافة — ${applicationLabel}`
        : remainder.at(-1) === "edit"
          ? `تعديل — ${applicationLabel}`
          : remainder.length > 1
            ? `تفاصيل — ${applicationLabel}`
            : applicationLabel;
  } else if (moduleKey === "reports") {
    childLabel = reportLabels[remainder[0] ?? ""] ?? "تفاصيل التقرير";
  } else if (moduleKey === "tour-guides") {
    if (remainder[0] === "guides") {
      childLabel =
        remainder[1] === "new"
          ? "إضافة مرشد سياحي"
          : remainder.at(-1) === "edit"
            ? "تعديل المرشد السياحي"
            : remainder.length > 1
              ? "تفاصيل المرشد السياحي"
              : "إدارة المرشدين السياحيين";
    } else {
      childLabel = remainder.length > 1 ? "تفاصيل طلب الرحلة" : "إدارة الطلبات";
    }
  } else if (moduleKey === "scientific-fatwas" && remainder[0] === "inbox") {
    childLabel = remainder.length > 1 ? "مراجعة سؤال الفتوى" : "صندوق الأسئلة";
  } else if (
    moduleKey === "scientific-fatwas" &&
    remainder[0] === "categories"
  ) {
    childLabel = "إدارة قائمة التصنيفات";
  } else if (remainder[0] === "new") {
    childLabel = labels?.create ?? "إضافة";
  } else if (remainder.at(-1) === "edit") {
    childLabel = labels?.edit ?? "التعديل";
  } else {
    childLabel = labels?.detail ?? "التفاصيل";
  }

  return [{ label: parent.label, href: parent.route }, { label: childLabel }];
}
