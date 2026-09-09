import { describe, expect, it } from "vitest";

import { getDashboardBreadcrumbs } from "./dashboard-breadcrumbs";

describe("dashboard breadcrumbs", () => {
  it.each([
    ["/dashboard", ["لوحة التحكم"]],
    ["/dashboard/account", ["إدارة الحساب"]],
    ["/dashboard/sections", ["إدارة الأقسام"]],
    ["/dashboard/sections/new", ["إدارة الأقسام", "إضافة قسم"]],
    ["/dashboard/sections/42", ["إدارة الأقسام", "تفاصيل القسم"]],
    ["/dashboard/sections/42/edit", ["إدارة الأقسام", "تعديل القسم"]],
    ["/dashboard/settings", ["إدارة الإعدادات"]],
    ["/dashboard/articles", ["إدارة المقالات"]],
    ["/dashboard/articles/new", ["إدارة المقالات", "إضافة مقال"]],
    ["/dashboard/articles/42", ["إدارة المقالات", "تفاصيل المقال"]],
    ["/dashboard/articles/42/edit", ["إدارة المقالات", "تعديل المقال"]],
    ["/dashboard/library", ["المصنَّفات والمكتبة البكرية"]],
    [
      "/dashboard/library/42/edit",
      ["المصنَّفات والمكتبة البكرية", "تعديل المصنَّف"],
    ],
    [
      "/dashboard/dissertations/new",
      ["الإنتاج الأكاديمي والإشراف العلمي", "إضافة رسالة علمية"],
    ],
    [
      "/dashboard/listening/42",
      ["مجالس السماع والمواد الصوتية", "تفاصيل سلسلة السماع"],
    ],
    [
      "/dashboard/scientific-fatwas/42/edit",
      ["الفتاوى والمسائل الحديثة", "تعديل المسألة العلمية"],
    ],
    [
      "/dashboard/scientific-fatwas/inbox",
      ["الفتاوى والمسائل الحديثة", "صندوق الأسئلة"],
    ],
    [
      "/dashboard/scientific-fatwas/inbox/42",
      ["الفتاوى والمسائل الحديثة", "مراجعة سؤال الفتوى"],
    ],
    [
      "/dashboard/scientific-fatwas/categories",
      ["الفتاوى والمسائل الحديثة", "إدارة قائمة التصنيفات"],
    ],
    [
      "/dashboard/scientific-videos/new",
      ["المرئيات واللقاءات العلمية", "إضافة مادة مرئية"],
    ],
    ["/dashboard/books", ["إدارة الكتب"]],
    ["/dashboard/books/new", ["إدارة الكتب", "إضافة كتاب"]],
    ["/dashboard/books/42", ["إدارة الكتب", "تفاصيل الكتاب"]],
    ["/dashboard/books/42/edit", ["إدارة الكتب", "تعديل الكتاب"]],
    ["/dashboard/books/series", ["إدارة الكتب", "إدارة السلاسل"]],
    ["/dashboard/books/series/4", ["إدارة الكتب", "تفاصيل السلسلة"]],
    ["/dashboard/governance", ["إدارة الحوكمة"]],
    ["/dashboard/governance/categories", ["إدارة الحوكمة", "إدارة الأقسام"]],
    ["/dashboard/governance/42/edit", ["إدارة الحوكمة", "تعديل الكتاب"]],
    ["/dashboard/programs", ["إدارة البرامج والأنشطة"]],
    [
      "/dashboard/programs/categories",
      ["إدارة البرامج والأنشطة", "إدارة الأقسام"],
    ],
    ["/dashboard/feedback", ["الشكاوى والمقترحات"]],
    ["/dashboard/feedback/12", ["الشكاوى والمقترحات", "التفاصيل"]],
    ["/dashboard/comments", ["إدارة التعليقات"]],
    ["/dashboard/comments/12", ["إدارة التعليقات", "تفاصيل التعليق"]],
    ["/dashboard/tour-guides", ["إدارة الرحلات السياحية"]],
    [
      "/dashboard/tour-guides/guides/new",
      ["إدارة الرحلات السياحية", "إضافة مرشد سياحي"],
    ],
    [
      "/dashboard/tour-guides/guides/9/edit",
      ["إدارة الرحلات السياحية", "تعديل المرشد السياحي"],
    ],
    [
      "/dashboard/tour-guides/requests",
      ["إدارة الرحلات السياحية", "إدارة الطلبات"],
    ],
    [
      "/dashboard/tour-guides/requests/12",
      ["إدارة الرحلات السياحية", "تفاصيل طلب الرحلة"],
    ],
    ["/dashboard/supervisors", ["إدارة المشرفين"]],
    ["/dashboard/supervisors/3", ["إدارة المشرفين", "تفاصيل المشرف"]],
    ["/dashboard/visuals", ["إدارة المرئيات"]],
    ["/dashboard/visuals/new", ["إدارة المرئيات", "إضافة مرئية"]],
    ["/dashboard/visuals/9/edit", ["إدارة المرئيات", "تعديل المرئية"]],
    ["/dashboard/reports", ["التقارير والتحليلات"]],
    [
      "/dashboard/reports/feedback",
      ["التقارير والتحليلات", "الرضا والملاحظات"],
    ],
    ["/dashboard/no-access", ["غير مصرح"]],
  ])("maps %s without exposing raw route IDs", (pathname, expected) => {
    const breadcrumbs = getDashboardBreadcrumbs(pathname);
    expect(breadcrumbs.map((item) => item.label)).toEqual(expected);
    expect(breadcrumbs.map((item) => item.label)).not.toContain("42");
  });
});
