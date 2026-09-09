import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { DashboardModuleFlags } from "@/core/config/dashboard-module-flags";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import type { CommentsSummary } from "@/features/comments/domain/comments.contracts";
import type { LibraryIndexSubmissionsPage } from "@/features/library-indexes/domain/library-indexes.contracts";

import { resolveDashboardPendingReviewCounts } from "./pending-review-counts.core";

const flags: DashboardModuleFlags = {
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
};

const actor: AdminSummary = {
  id: "7",
  name: "مراجع المحتوى",
  email: "reviewer@example.test",
  role: "editor",
  isActive: true,
  dashboardPermissions: ["library_indexes.manage", "comments.manage"],
};

const libraryIndexesPage: LibraryIndexSubmissionsPage = {
  current_page: 1,
  data: [],
  last_page: 1,
  per_page: 1,
  total: 8,
  stats: {
    total: 8,
    pending: 5,
    approved: 2,
    rejected: 1,
    by_type: {
      golden_visit: { total: 3, pending: 2, approved: 1, rejected: 0 },
      guest: { total: 5, pending: 3, approved: 1, rejected: 1 },
    },
  },
  filter_options: { types: [], statuses: [] },
};

const commentsSummary: CommentsSummary = {
  total: 6,
  pending: 4,
  approved: 2,
};

describe("dashboard pending review counts", () => {
  it("returns only the pending counts for modules the actor can review", async () => {
    const listLibraryIndexSubmissions = vi
      .fn()
      .mockResolvedValue(apiSuccess(libraryIndexesPage));
    const getCommentsStats = vi
      .fn()
      .mockResolvedValue(apiSuccess(commentsSummary));
    const getTourRequestsSummary = vi.fn();

    await expect(
      resolveDashboardPendingReviewCounts(actor, flags, "private-token", {
        listLibraryIndexSubmissions,
        getCommentsStats,
        getTourRequestsSummary,
      }),
    ).resolves.toEqual({ libraryIndexes: 5, comments: 4 });
    expect(listLibraryIndexSubmissions).toHaveBeenCalledWith("private-token");
    expect(getCommentsStats).toHaveBeenCalledWith("private-token");
  });

  it("does not query hidden or unauthorized queues and never substitutes failed counts with zero", async () => {
    const listLibraryIndexSubmissions = vi.fn();
    const getCommentsStats = vi.fn().mockRejectedValue(new Error("offline"));
    const getTourRequestsSummary = vi.fn();

    await expect(
      resolveDashboardPendingReviewCounts(
        { ...actor, dashboardPermissions: ["comments.manage"] },
        { ...flags, libraryIndexes: false },
        "private-token",
        {
          listLibraryIndexSubmissions,
          getCommentsStats,
          getTourRequestsSummary,
        },
      ),
    ).resolves.toEqual({});
    expect(listLibraryIndexSubmissions).not.toHaveBeenCalled();
    expect(getCommentsStats).toHaveBeenCalledTimes(1);
  });

  it("skips all lookups when no server-side session exists", async () => {
    const listLibraryIndexSubmissions = vi.fn();
    const getCommentsStats = vi.fn();
    const getTourRequestsSummary = vi.fn();

    await expect(
      resolveDashboardPendingReviewCounts(actor, flags, undefined, {
        listLibraryIndexSubmissions,
        getCommentsStats,
        getTourRequestsSummary,
      }),
    ).resolves.toEqual({});
    expect(listLibraryIndexSubmissions).not.toHaveBeenCalled();
    expect(getCommentsStats).not.toHaveBeenCalled();
  });

  it("exposes the new tour-request count only when the module and permission are enabled", async () => {
    const listLibraryIndexSubmissions = vi.fn();
    const getCommentsStats = vi.fn();
    const getTourRequestsSummary = vi
      .fn()
      .mockResolvedValue(
        apiSuccess({ requests_total: 9, new: 4, in_progress: 3, completed: 2 }),
      );

    await expect(
      resolveDashboardPendingReviewCounts(
        { ...actor, dashboardPermissions: ["tour_guides.manage"] },
        {
          ...flags,
          libraryIndexes: false,
          comments: false,
          tourGuides: true,
        },
        "private-token",
        {
          listLibraryIndexSubmissions,
          getCommentsStats,
          getTourRequestsSummary,
        },
      ),
    ).resolves.toEqual({ tourRequestsNew: 4 });
    expect(getTourRequestsSummary).toHaveBeenCalledWith("private-token");
  });
});
