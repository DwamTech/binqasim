import "server-only";

import { cookies } from "next/headers";

import type { DashboardModuleFlags } from "@/core/config/dashboard-module-flags";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { CommentsRepository } from "@/features/comments/infrastructure/comments.repository";
import { LibraryIndexesRepository } from "@/features/library-indexes/infrastructure/library-indexes.repository";
import { TourRequestsRepository } from "@/features/tour-guides/infrastructure/tour-requests.repository";
import { sessionCookieName } from "@/server/cookies/session-cookie";

import type { DashboardPendingReviewCounts } from "../domain/pending-review-counts.contracts";
import { resolveDashboardPendingReviewCounts } from "./pending-review-counts.core";

const AUXILIARY_LOOKUP_TIMEOUT_MS = 2_500;

const libraryIndexesRepository = new LibraryIndexesRepository();
const commentsRepository = new CommentsRepository();
const tourRequestsRepository = new TourRequestsRepository();

/**
 * Server-side adapter for sidebar review badges. It uses the existing module
 * endpoints and scoped session token; no new public/backend API is required.
 */
export async function getDashboardPendingReviewCounts(
  actor: AdminSummary,
  moduleFlags: DashboardModuleFlags,
): Promise<DashboardPendingReviewCounts> {
  const token = (await cookies()).get(sessionCookieName)?.value;

  return resolveDashboardPendingReviewCounts(actor, moduleFlags, token, {
    listLibraryIndexSubmissions: (sessionToken) =>
      libraryIndexesRepository.list(
        { status: "pending", page: 1, per_page: 1 },
        sessionToken,
        { timeoutMs: AUXILIARY_LOOKUP_TIMEOUT_MS },
      ),
    getCommentsStats: (sessionToken) =>
      commentsRepository.stats(sessionToken, {
        timeoutMs: AUXILIARY_LOOKUP_TIMEOUT_MS,
      }),
    getTourRequestsSummary: (sessionToken) =>
      tourRequestsRepository.summary(sessionToken, {
        timeoutMs: AUXILIARY_LOOKUP_TIMEOUT_MS,
      }),
  });
}
