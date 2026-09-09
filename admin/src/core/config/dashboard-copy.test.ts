import { describe, expect, it } from "vitest";

import { dashboardModules } from "@/core/authorization/dashboard-modules";
import { validateClientEnvironment } from "@/core/env/client";
import {
  dashboardCopy,
  resolveDashboardModuleLabels,
  withoutArabicDefiniteArticle,
} from "./dashboard-copy";

describe("dashboardCopy", () => {
  it("keeps navigation, permissions, and derived page titles aligned", () => {
    const booksModule = dashboardModules.find(
      (item) => item.permission === "books.manage",
    );

    expect(booksModule?.navigationLabel).toBe("إدارة الحوكمة");
    expect(dashboardCopy.modules.books.pages.detail).toContain(
      dashboardCopy.modules.books.singular,
    );
    expect(dashboardCopy.modules.books.pages.create).toBe("إضافة كتاب");
  });

  it("keeps technical routes independent from configurable labels", () => {
    expect(
      dashboardModules.find((item) => item.permission === "visuals.manage")
        ?.route,
    ).toBe("/dashboard/visuals");
    expect(
      dashboardModules.find((item) => item.permission === "sections.manage")
        ?.route,
    ).toBe("/dashboard/sections");
  });

  it("resolves one deployment label per public-site module with safe fallbacks", () => {
    const defaults = resolveDashboardModuleLabels(
      validateClientEnvironment({}),
    );
    expect(defaults).toEqual({
      articles: "إدارة المقالات",
      library: "المصنَّفات والمكتبة البكرية",
      dissertations: "الإنتاج الأكاديمي والإشراف العلمي",
      listening: "مجالس السماع والمواد الصوتية",
      hadithCards: "البطاقات الحديثية",
      scientificFatwas: "الفتاوى والمسائل الحديثة",
      scientificVideos: "المرئيات واللقاءات العلمية",
      libraryIndexes: "فهارس المكتبة وسجلات الزوار",
      comments: "إدارة التعليقات",
    });

    const customized = resolveDashboardModuleLabels(
      validateClientEnvironment({
        NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL: "محتوى المقالات",
        NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL: "الخزانة العلمية",
        NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL: "السجل الأكاديمي",
        NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL: "المجالس الصوتية",
        NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL: "البطاقات المصوّرة",
        NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL: "المسائل العلمية",
        NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL: "المكتبة المرئية",
        NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL: "سجلات المكتبة",
        NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL: "مراجعة المشاركات",
      }),
    );

    expect(customized).toEqual({
      articles: "محتوى المقالات",
      library: "الخزانة العلمية",
      dissertations: "السجل الأكاديمي",
      listening: "المجالس الصوتية",
      hadithCards: "البطاقات المصوّرة",
      scientificFatwas: "المسائل العلمية",
      scientificVideos: "المكتبة المرئية",
      libraryIndexes: "سجلات المكتبة",
      comments: "مراجعة المشاركات",
    });
  });

  it("formats Arabic indefinite copy without changing custom labels", () => {
    expect(withoutArabicDefiniteArticle("الكتب")).toBe("كتب");
    expect(withoutArabicDefiniteArticle("مكتبة رقمية")).toBe("مكتبة رقمية");
  });
});
