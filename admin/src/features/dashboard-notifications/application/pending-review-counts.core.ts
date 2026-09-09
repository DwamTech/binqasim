import type { ApiResponse } from "@/core/api/api-response";
import { hasDashboardPermission } from "@/core/authorization/dashboard-access";
import type { DashboardModuleFlags } from "@/core/config/dashboard-module-flags";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import type { CommentsSummary } from "@/features/comments/domain/comments.contracts";
import type { LibraryIndexSubmissionsPage } from "@/features/library-indexes/domain/library-indexes.contracts";
import type { TourRequestsSummary } from "@/features/tour-guides/domain/tour-guides.contracts";

import type { DashboardPendingReviewCounts } from "../domain/pending-review-counts.contracts";

export type PendingReviewCountsDependencies = {
  listLibraryIndexSubmissions: (
    token: string,
  ) => Promise<ApiResponse<LibraryIndexSubmissionsPage>>;
  getCommentsStats: (token: string) => Promise<ApiResponse<CommentsSummary>>;
  getTourRequestsSummary: (
    token: string,
  ) => Promise<ApiResponse<TourRequestsSummary>>;
};

async function safely<T>(
  loader: () => Promise<ApiResponse<T>>,
): Promise<ApiResponse<T> | undefined> {
  try {
    return await loader();
  } catch {
    // Review counters are auxiliary UI. A temporary failure must never make
    // the protected dashboard unavailable or turn an unknown count into zero.
    return undefined;
  }
}

function validPendingCount(value: number): number | undefined {
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

/**
 * Resolves only the review queues visible to the current actor. This prevents
 * leaking workflow volume from a module the actor cannot open, while keeping
 * each module's existing API contract untouched.
 */
export async function resolveDashboardPendingReviewCounts(
  actor: AdminSummary,
  moduleFlags: DashboardModuleFlags,
  token: string | undefined,
  dependencies: PendingReviewCountsDependencies,
): Promise<DashboardPendingReviewCounts> {
  if (!token) return {};

  const canReviewLibraryIndexes =
    moduleFlags.libraryIndexes &&
    hasDashboardPermission(actor, "library_indexes.manage");
  const canReviewComments =
    moduleFlags.comments && hasDashboardPermission(actor, "comments.manage");
  const canReviewTourRequests =
    moduleFlags.tourGuides &&
    hasDashboardPermission(actor, "tour_guides.manage");

  const [libraryIndexesResult, commentsResult, tourRequestsResult] =
    await Promise.all([
      canReviewLibraryIndexes
        ? safely(() => dependencies.listLibraryIndexSubmissions(token))
        : Promise.resolve(undefined),
      canReviewComments
        ? safely(() => dependencies.getCommentsStats(token))
        : Promise.resolve(undefined),
      canReviewTourRequests
        ? safely(() => dependencies.getTourRequestsSummary(token))
        : Promise.resolve(undefined),
    ]);

  const libraryIndexes = libraryIndexesResult?.success
    ? validPendingCount(libraryIndexesResult.data.stats.pending)
    : undefined;
  const comments = commentsResult?.success
    ? validPendingCount(commentsResult.data.pending)
    : undefined;
  const tourRequestsNew = tourRequestsResult?.success
    ? validPendingCount(tourRequestsResult.data.new)
    : undefined;

  return {
    ...(libraryIndexes === undefined ? {} : { libraryIndexes }),
    ...(comments === undefined ? {} : { comments }),
    ...(tourRequestsNew === undefined ? {} : { tourRequestsNew }),
  };
}
