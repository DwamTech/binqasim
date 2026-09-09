import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const dashboardRoot = resolve(process.cwd(), "src/app/(protected)/dashboard");

function pageSource(relativePath: string): string {
  return readFileSync(resolve(dashboardRoot, relativePath), "utf8");
}

describe("dashboard page integration", () => {
  it.each([
    ["page.tsx", 'requireDashboardPermission("dashboard.view")'],
    ["sections/page.tsx", 'requireDashboardPermission("sections.manage")'],
    ["sections/new/page.tsx", 'requireDashboardPermission("sections.manage")'],
    ["sections/[id]/page.tsx", 'requireDashboardPermission("sections.manage")'],
    [
      "sections/[id]/edit/page.tsx",
      'requireDashboardPermission("sections.manage")',
    ],
    ["settings/page.tsx", 'requireDashboardPermission("settings.manage")'],
    ["articles/page.tsx", 'requireDashboardPermission("articles.manage")'],
    ["articles/new/page.tsx", 'requireDashboardPermission("articles.manage")'],
    ["articles/[id]/page.tsx", 'requireDashboardPermission("articles.manage")'],
    [
      "articles/[id]/edit/page.tsx",
      'requireDashboardPermission("articles.manage")',
    ],
    ["books/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["books/new/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["books/[id]/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["books/[id]/edit/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["books/series/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["library/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["library/new/page.tsx", 'requireDashboardPermission("books.manage")'],
    ["library/[id]/page.tsx", 'requireDashboardPermission("books.manage")'],
    [
      "library/[id]/edit/page.tsx",
      'requireDashboardPermission("books.manage")',
    ],
    [
      "dissertations/page.tsx",
      'requireDashboardPermission("dissertations.manage")',
    ],
    [
      "dissertations/new/page.tsx",
      'requireDashboardPermission("dissertations.manage")',
    ],
    [
      "dissertations/[id]/page.tsx",
      'requireDashboardPermission("dissertations.manage")',
    ],
    [
      "dissertations/[id]/edit/page.tsx",
      'requireDashboardPermission("dissertations.manage")',
    ],
    ["listening/page.tsx", 'requireDashboardPermission("listening.manage")'],
    [
      "scientific-fatwas/page.tsx",
      'requireDashboardPermission("fatwas.manage")',
    ],
    [
      "scientific-fatwas/categories/page.tsx",
      'requireDashboardPermission("fatwas.manage")',
    ],
    [
      "scientific-fatwas/inbox/page.tsx",
      'requireDashboardPermission("fatwas.view")',
    ],
    [
      "scientific-fatwas/inbox/[id]/page.tsx",
      'requireDashboardPermission("fatwas.view_details")',
    ],
    [
      "listening/new/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/[id]/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/[id]/edit/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/sessions/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/sessions/new/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/sessions/[id]/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    [
      "listening/sessions/[id]/edit/page.tsx",
      'requireDashboardPermission("listening.manage")',
    ],
    ["feedback/page.tsx", "requireDashboardAdmin()"],
    ["feedback/[id]/page.tsx", "requireDashboardAdmin()"],
    [
      "library-indexes/page.tsx",
      'requireDashboardPermission("library_indexes.manage")',
    ],
    [
      "library-indexes/[type]/[id]/page.tsx",
      'requireDashboardPermission("library_indexes.manage")',
    ],
    ["comments/page.tsx", 'requireDashboardPermission("comments.manage")'],
    ["comments/[id]/page.tsx", 'requireDashboardPermission("comments.manage")'],
    ["visuals/page.tsx", 'requireDashboardPermission("visuals.manage")'],
    ["visuals/new/page.tsx", 'requireDashboardPermission("visuals.manage")'],
    ["visuals/[id]/page.tsx", 'requireDashboardPermission("visuals.manage")'],
    [
      "visuals/[id]/edit/page.tsx",
      'requireDashboardPermission("visuals.manage")',
    ],
    [
      "scientific-videos/page.tsx",
      'requireDashboardPermission("visuals.manage")',
    ],
    [
      "scientific-videos/new/page.tsx",
      'requireDashboardPermission("visuals.manage")',
    ],
    [
      "scientific-videos/[id]/page.tsx",
      'requireDashboardPermission("visuals.manage")',
    ],
    [
      "scientific-videos/[id]/edit/page.tsx",
      'requireDashboardPermission("visuals.manage")',
    ],
    ["supervisors/page.tsx", "requireDashboardAdmin()"],
    ["supervisors/new/page.tsx", "requireDashboardAdmin()"],
    ["supervisors/[id]/page.tsx", "requireDashboardAdmin()"],
    ["supervisors/[id]/edit/page.tsx", "requireDashboardAdmin()"],
  ])("keeps %s behind %s", (file, expectedGuard) => {
    expect(pageSource(file)).toContain(expectedGuard);
  });

  it("keeps account and no-access under the authenticated parent shell", () => {
    const protectedLayout = readFileSync(
      resolve(dashboardRoot, "../layout.tsx"),
      "utf8",
    );
    expect(protectedLayout).toContain("await requireAdmin()");
    expect(pageSource("account/page.tsx")).toContain("AccountManagementView");
    expect(pageSource("no-access/page.tsx")).toContain("DashboardNoAccessPage");
  });

  it("guards optional route families at their parent layouts", () => {
    expect(pageSource("articles/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("articles")',
    );
    expect(pageSource("governance/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("governance")',
    );
    expect(pageSource("programs/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("programs")',
    );
    expect(pageSource("visuals/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("legacyVisuals")',
    );
    expect(pageSource("library/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("library")',
    );
    expect(pageSource("dissertations/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("dissertations")',
    );
    expect(pageSource("listening/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("listening")',
    );
    expect(pageSource("hadith-cards/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("hadithCards")',
    );
    expect(pageSource("scientific-fatwas/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("scientificFatwas")',
    );
    expect(pageSource("scientific-videos/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("scientificVideos")',
    );
    expect(pageSource("library-indexes/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("libraryIndexes")',
    );
    expect(pageSource("comments/layout.tsx")).toContain(
      'requireDashboardModuleEnabled("comments")',
    );
  });

  it("keeps inbox workflow actions behind their granular permissions", () => {
    const inboxDetail = pageSource("scientific-fatwas/inbox/[id]/page.tsx");
    for (const permission of [
      "fatwas.answer",
      "fatwas.update_answer",
      "fatwas.archive",
      "fatwas.restore",
      "fatwas.view_private",
    ]) {
      expect(inboxDetail).toContain(
        `hasDashboardPermission(actor, "${permission}")`,
      );
    }
  });
});
