/**
 * Counts intentionally stay optional: an omitted value means that the module
 * is unavailable to this actor or its auxiliary lookup could not be loaded.
 * That is materially different from a confirmed zero.
 */
export type DashboardPendingReviewCounts = Readonly<{
  libraryIndexes?: number;
  comments?: number;
  tourRequestsNew?: number;
}>;
