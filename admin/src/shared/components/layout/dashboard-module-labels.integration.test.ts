import { afterEach, describe, expect, it, vi } from "vitest";

const moduleFlags = {
  articles: true,
  sections: false,
  governance: false,
  programs: false,
  applications: false,
  feedback: false,
  galleryMedia: false,
  legacyVisuals: false,
  library: true,
  dissertations: true,
  listening: true,
  hadithCards: true,
  scientificFatwas: true,
  scientificVideos: true,
  libraryIndexes: true,
  comments: true,
  tourGuides: false,
} as const;

const actor = {
  id: "2",
  name: "Editor",
  email: "editor@example.com",
  role: "editor" as const,
  isActive: true as const,
  dashboardPermissions: [
    "articles.manage",
    "books.manage",
    "dissertations.manage",
    "listening.manage",
    "hadith_cards.manage",
    "fatwas.manage",
    "visuals.manage",
    "library_indexes.manage",
    "comments.manage",
  ] as const,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("deployment module labels", () => {
  it("reuses each environment label in dashboard copy and sidebar navigation", async () => {
    const expected = {
      articles: "مقالات الموقع",
      library: "الخزانة العلمية",
      dissertations: "السجل الأكاديمي",
      listening: "المجالس الصوتية",
      hadithCards: "البطاقات المصوّرة",
      scientificFatwas: "المسائل العلمية",
      scientificVideos: "المكتبة المرئية",
      libraryIndexes: "سجلات المكتبة",
      comments: "مراجعة المشاركات",
    } as const;

    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL",
      expected.articles,
    );
    vi.stubEnv("NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL", expected.library);
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL",
      expected.dissertations,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL",
      expected.listening,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL",
      expected.hadithCards,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL",
      expected.scientificFatwas,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL",
      expected.scientificVideos,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL",
      expected.libraryIndexes,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL",
      expected.comments,
    );

    const [{ dashboardCopy }, { getDashboardNavigation }] = await Promise.all([
      import("@/core/config/dashboard-copy"),
      import("./dashboard-navigation"),
    ]);

    expect({
      articles: dashboardCopy.modules.articles.navigation,
      library: dashboardCopy.modules.library.navigation,
      dissertations: dashboardCopy.modules.dissertations.navigation,
      listening: dashboardCopy.modules.listening.navigation,
      hadithCards: dashboardCopy.modules.hadithCards.navigation,
      scientificFatwas: dashboardCopy.modules.scientificFatwas.navigation,
      scientificVideos: dashboardCopy.modules.scientificVideos.navigation,
      libraryIndexes: dashboardCopy.modules.libraryIndexes.navigation,
      comments: dashboardCopy.modules.comments.navigation,
    }).toEqual(expected);

    expect(
      Object.fromEntries(
        getDashboardNavigation(actor, moduleFlags)
          .filter((item) =>
            [
              "/dashboard/articles",
              "/dashboard/library",
              "/dashboard/dissertations",
              "/dashboard/listening",
              "/dashboard/hadith-cards",
              "/dashboard/scientific-fatwas",
              "/dashboard/scientific-videos",
              "/dashboard/library-indexes",
              "/dashboard/comments",
            ].includes(item.href),
          )
          .map((item) => [item.href, item.label]),
      ),
    ).toEqual({
      "/dashboard/articles": expected.articles,
      "/dashboard/library": expected.library,
      "/dashboard/dissertations": expected.dissertations,
      "/dashboard/listening": expected.listening,
      "/dashboard/hadith-cards": expected.hadithCards,
      "/dashboard/scientific-fatwas": expected.scientificFatwas,
      "/dashboard/scientific-videos": expected.scientificVideos,
      "/dashboard/library-indexes": expected.libraryIndexes,
      "/dashboard/comments": expected.comments,
    });
  });
});
