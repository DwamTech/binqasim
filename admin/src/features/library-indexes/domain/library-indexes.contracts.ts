export const libraryIndexSubmissionTypes = ["golden_visit", "guest"] as const;
export const libraryIndexSubmissionStatuses = [
  "pending",
  "approved",
  "rejected",
] as const;

export type LibraryIndexSubmissionType =
  (typeof libraryIndexSubmissionTypes)[number];
export type LibraryIndexSubmissionStatus =
  (typeof libraryIndexSubmissionStatuses)[number];

export type LibraryIndexReviewer = {
  id: number | string;
  name: string;
  email?: string | null | undefined;
};

export type LibraryIndexSubmission = {
  id: number;
  type: LibraryIndexSubmissionType;
  name: string;
  title: string | null;
  visit_date: string | null;
  status: LibraryIndexSubmissionStatus;
  image_url: string | null;
  reviewed_at: string | null;
  reviewer: LibraryIndexReviewer | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at?: string | null | undefined;
};

export type LibraryIndexSubmissionCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type LibraryIndexSubmissionStats = LibraryIndexSubmissionCounts & {
  by_type: Record<LibraryIndexSubmissionType, LibraryIndexSubmissionCounts>;
};

export type LibraryIndexFilterOptions = {
  types: Array<{ value: LibraryIndexSubmissionType; label: string }>;
  statuses: LibraryIndexSubmissionStatus[];
};

export type LibraryIndexSubmissionsPage = {
  current_page: number;
  data: LibraryIndexSubmission[];
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null | undefined;
  to?: number | null | undefined;
  stats: LibraryIndexSubmissionStats;
  filter_options: LibraryIndexFilterOptions;
};

export type LibraryIndexSubmissionsQuery = {
  type?: LibraryIndexSubmissionType | undefined;
  status?: LibraryIndexSubmissionStatus | undefined;
  search?: string | undefined;
  page: number;
  per_page: number;
};

export const libraryIndexSubmissionTypeLabels: Record<
  LibraryIndexSubmissionType,
  string
> = {
  golden_visit: "سجل الزوار الذهبيين",
  guest: "سجل الضيوف",
};

export const libraryIndexSubmissionStatusLabels: Record<
  LibraryIndexSubmissionStatus,
  string
> = {
  pending: "بانتظار المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export function formatLibraryIndexDate(
  value: string | null,
  includeTime = false,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}
