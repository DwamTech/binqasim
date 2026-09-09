import { describe, expect, it } from "vitest";

import { validateClientEnvironment } from "./client";

describe("validateClientEnvironment", () => {
  it("uses the default public application name", () => {
    expect(validateClientEnvironment({})).toMatchObject({
      NEXT_PUBLIC_APP_NAME: "CMS Dashboard",
      NEXT_PUBLIC_APP_SHORT_NAME: "CMS",
      NEXT_PUBLIC_APP_VERSION: "1.0.0",
      NEXT_PUBLIC_APP_LANGUAGE: "ar",
      NEXT_PUBLIC_APP_DIRECTION: "rtl",
      NEXT_PUBLIC_SUPPORT_PHONE: "015558558579",
      NEXT_PUBLIC_SUPPORT_WHATSAPP: "2015558558579",
      NEXT_PUBLIC_LOGIN_SHOWCASE_TITLE: "لوحة تحكم وإدارة موقع جمعية مبتكرون",
      NEXT_PUBLIC_LOGIN_SHOWCASE_LOGO: "/logo.png",
      NEXT_PUBLIC_NAV_BOOKS: "إدارة الكتب",
      NEXT_PUBLIC_ENTITY_BOOK_SINGULAR: "الكتاب",
    });
  });

  it("rejects an empty public application name", () => {
    expect(() =>
      validateClientEnvironment({ NEXT_PUBLIC_APP_NAME: "   " }),
    ).toThrow("NEXT_PUBLIC_APP_NAME");
  });

  it("accepts deployment-specific login branding", () => {
    expect(
      validateClientEnvironment({
        NEXT_PUBLIC_LOGIN_SHOWCASE_TITLE: "لوحة إدارة الجمعية",
        NEXT_PUBLIC_LOGIN_SHOWCASE_LOGO: "/association-logo.png",
      }),
    ).toMatchObject({
      NEXT_PUBLIC_LOGIN_SHOWCASE_TITLE: "لوحة إدارة الجمعية",
      NEXT_PUBLIC_LOGIN_SHOWCASE_LOGO: "/association-logo.png",
    });
  });

  it("rejects blank module labels and unsupported font presets", () => {
    expect(() =>
      validateClientEnvironment({ NEXT_PUBLIC_NAV_BOOKS: "   " }),
    ).toThrow("NEXT_PUBLIC_NAV_BOOKS");
    expect(() =>
      validateClientEnvironment({
        NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL: "   ",
      }),
    ).toThrow("NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL");
    expect(() =>
      validateClientEnvironment({ NEXT_PUBLIC_FONT_PRESET: "random-font" }),
    ).toThrow("NEXT_PUBLIC_FONT_PRESET");
  });

  it("accepts deployment-specific labels for every public-site module", () => {
    const environment = validateClientEnvironment({
      NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL: "محتوى المقالات",
      NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL: "الخزانة العلمية",
      NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL: "السجل الأكاديمي",
      NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL: "المجالس الصوتية",
      NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL: "البطاقات المصوّرة",
      NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL: "المسائل العلمية",
      NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL: "المكتبة المرئية",
      NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL: "سجلات المكتبة",
      NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL: "مراجعة المشاركات",
    });

    expect(environment).toMatchObject({
      NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL: "محتوى المقالات",
      NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL: "الخزانة العلمية",
      NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL: "السجل الأكاديمي",
      NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL: "المجالس الصوتية",
      NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL: "البطاقات المصوّرة",
      NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL: "المسائل العلمية",
      NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL: "المكتبة المرئية",
      NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL: "سجلات المكتبة",
      NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL: "مراجعة المشاركات",
    });
  });

  it("rejects support numbers that are unsafe for a WhatsApp link", () => {
    expect(() =>
      validateClientEnvironment({
        NEXT_PUBLIC_SUPPORT_WHATSAPP: "+20 1555 855 8579",
      }),
    ).toThrow("NEXT_PUBLIC_SUPPORT_WHATSAPP");
  });

  it("accepts optional Arabic page-title overrides", () => {
    expect(
      validateClientEnvironment({
        NEXT_PUBLIC_PAGE_BOOKS_CREATE_TITLE: "إضافة إصدار جديد",
      }).NEXT_PUBLIC_PAGE_BOOKS_CREATE_TITLE,
    ).toBe("إضافة إصدار جديد");
  });
});
