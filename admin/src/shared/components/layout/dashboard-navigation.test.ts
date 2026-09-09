import { describe, expect, it } from "vitest";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getDashboardNavigation } from "./dashboard-navigation";

const actor = {
  id: "2",
  name: "Editor",
  email: "editor@example.com",
  role: "editor" as const,
  isActive: true as const,
  dashboardPermissions: [] as const,
};
describe("dashboard navigation", () => {
  it("shows all mapped navigation to admins and filters supervisors", () => {
    const adminRoutes = getDashboardNavigation({
      ...actor,
      role: "admin",
    }).map((item) => item.href);
    expect(adminRoutes).toContain("/dashboard/visuals");
    expect(adminRoutes).toContain("/dashboard/articles");
    expect(adminRoutes).toContain("/dashboard/governance");
    expect(adminRoutes).toContain("/dashboard/programs");
    expect(adminRoutes).not.toContain("/dashboard/books");
    expect(adminRoutes).toContain("/dashboard/feedback");
    expect(adminRoutes).toContain("/dashboard/gallery-media");
    expect(adminRoutes).toContain("/dashboard/reports");
    expect(adminRoutes).toContain("/dashboard/supervisors");
    expect(adminRoutes).toContain("https://mail.albakry.net/");
    expect(getDashboardNavigation(actor)).toHaveLength(0);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["dashboard.view"],
      }).map((item) => item.href),
    ).not.toContain("/dashboard/feedback");
    const permittedNavigation = getDashboardNavigation({
      ...actor,
      dashboardPermissions: ["dashboard.view", "sections.manage"],
    });
    expect(permittedNavigation).toHaveLength(2);
    expect(permittedNavigation.map((item) => item.href)).toContain(
      "/dashboard/sections",
    );
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["articles.manage"],
      }).map((item) => item.href),
    ).toEqual(["/dashboard/articles"]);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["settings.manage"],
      }).map((item) => item.href),
    ).toEqual(["/dashboard/settings"]);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["books.manage"],
      }).map((item) => item.href),
    ).toEqual(["/dashboard/governance", "/dashboard/programs"]);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["gallery.manage"],
      }).map((item) => item.href),
    ).toEqual(["/dashboard/gallery-media"]);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["reports.view"],
      }).map((item) => item.href),
    ).toEqual(["/dashboard/reports"]);
    expect(
      getDashboardNavigation({
        ...actor,
        dashboardPermissions: ["supervisors.manage"],
      }).map((item) => item.href),
    ).toEqual([]);
  });

  it("reveals optional modules only when their deployment flags and permissions allow it", () => {
    const flags = {
      articles: true,
      sections: true,
      governance: true,
      programs: true,
      applications: true,
      feedback: true,
      galleryMedia: true,
      legacyVisuals: true,
      library: true,
      dissertations: true,
      listening: true,
      hadithCards: true,
      scientificFatwas: true,
      scientificVideos: true,
      libraryIndexes: true,
      comments: true,
      tourGuides: true,
    } as const;
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["books.manage"] },
        flags,
      ).map((item) => item.href),
    ).toContain("/dashboard/library");
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["dissertations.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/dissertations"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["dissertations.manage"] },
        { ...flags, dissertations: false },
      ),
    ).toEqual([]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["comments.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/comments"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["comments.manage"] },
        { ...flags, comments: false },
      ),
    ).toEqual([]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["listening.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/listening"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["listening.manage"] },
        flags,
      ).map((item) => item.label),
    ).toEqual([dashboardCopy.modules.listening.navigation]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["hadith_cards.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/hadith-cards"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["hadith_cards.manage"] },
        { ...flags, hadithCards: false },
      ),
    ).toEqual([]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["fatwas.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/scientific-fatwas"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["fatwas.view"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/scientific-fatwas/inbox"]);
    expect(
      getDashboardNavigation(
        {
          ...actor,
          dashboardPermissions: ["fatwas.manage", "fatwas.view"],
        },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/scientific-fatwas"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["visuals.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/visuals", "/dashboard/scientific-videos"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["library_indexes.manage"] },
        flags,
      ).map((item) => item.href),
    ).toEqual(["/dashboard/library-indexes"]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["library_indexes.manage"] },
        { ...flags, libraryIndexes: false },
      ),
    ).toEqual([]);

    const siteFlags = {
      ...flags,
      governance: false,
      programs: false,
      legacyVisuals: false,
    } as const;
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["books.manage"] },
        siteFlags,
      ).map((item) => [item.href, item.label]),
    ).toEqual([
      ["/dashboard/library", dashboardCopy.modules.library.navigation],
    ]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["visuals.manage"] },
        siteFlags,
      ).map((item) => [item.href, item.label]),
    ).toEqual([
      [
        "/dashboard/scientific-videos",
        dashboardCopy.modules.scientificVideos.navigation,
      ],
    ]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["dissertations.manage"] },
        siteFlags,
      ).map((item) => item.label),
    ).toEqual([dashboardCopy.modules.dissertations.navigation]);
  });

  it("attaches pending-review notifications only to visible review modules", () => {
    const flags = {
      articles: false,
      sections: false,
      governance: false,
      programs: false,
      applications: false,
      feedback: false,
      galleryMedia: false,
      legacyVisuals: false,
      library: false,
      dissertations: false,
      listening: false,
      hadithCards: false,
      scientificFatwas: false,
      scientificVideos: false,
      libraryIndexes: true,
      comments: true,
      tourGuides: false,
    } as const;
    const navigation = getDashboardNavigation(
      {
        ...actor,
        dashboardPermissions: ["library_indexes.manage", "comments.manage"],
      },
      flags,
      { libraryIndexes: 3, comments: 7 },
    );

    expect(
      navigation.find((item) => item.id === "library-indexes")?.notification,
    ).toEqual({ count: 3, label: "طلبات بانتظار المراجعة" });
    expect(
      navigation.find((item) => item.id === "comments")?.notification,
    ).toEqual({ count: 7, label: "تعليقات بانتظار المراجعة" });
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: ["comments.manage"] },
        { ...flags, libraryIndexes: false },
        { libraryIndexes: 3, comments: 0 },
      )[0]?.notification,
    ).toBeUndefined();
  });

  it("shows the tour module and puts its new-request counter on the parent and requests child", () => {
    const navigation = getDashboardNavigation(
      { ...actor, dashboardPermissions: ["tour_guides.manage"] },
      {
        articles: false,
        sections: false,
        governance: false,
        programs: false,
        applications: false,
        feedback: false,
        galleryMedia: false,
        legacyVisuals: false,
        library: false,
        dissertations: false,
        listening: false,
        hadithCards: false,
        scientificFatwas: false,
        scientificVideos: false,
        libraryIndexes: false,
        comments: false,
        tourGuides: true,
      },
      { tourRequestsNew: 6 },
    );

    expect(navigation).toHaveLength(1);
    expect(navigation[0]?.href).toBe("/dashboard/tour-guides");
    expect(navigation[0]?.notification).toEqual({
      count: 6,
      label: "طلبات رحلات جديدة",
    });
    expect(
      navigation[0]?.children?.find(
        (child) => child.id === "tour-requests-management",
      )?.notification,
    ).toEqual({ count: 6, label: "طلبات رحلات جديدة" });
  });
});
