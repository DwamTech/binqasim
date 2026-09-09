export const commentStatuses = ["pending", "approved"] as const;

export type CommentStatus = (typeof commentStatuses)[number];

export type CommentTarget = {
  type: string;
  label: string;
  id: string;
  locator: string;
  title: string;
  public_path: string | null;
};

export type CommentApprover = {
  id: string;
  name: string;
  email: string | null;
};

export type ContentComment = {
  id: number;
  body: string;
  status: CommentStatus;
  ip_address: string | null;
  target: CommentTarget;
  created_at: string | null;
  created_at_label: string | null;
  approved_at: string | null;
  approver: CommentApprover | null;
};

export type CommentsSummary = {
  total: number;
  pending: number;
  approved: number;
};

export type CommentsPage = {
  data: ContentComment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export type CommentFilterOption = {
  value: string;
  label: string;
};

export type CommentOptions = {
  statuses: CommentFilterOption[];
  target_types: CommentFilterOption[];
};

export type CommentsQuery = {
  search?: string | undefined;
  status?: CommentStatus | undefined;
  target_type?: string | undefined;
  page: number;
  per_page: number;
};

export const commentStatusLabels: Record<CommentStatus, string> = {
  pending: "بانتظار المراجعة",
  approved: "منشور للعامة",
};

export const fallbackCommentOptions: CommentOptions = {
  statuses: commentStatuses.map((value) => ({
    value,
    label: commentStatusLabels[value],
  })),
  target_types: [
    { value: "site_article", label: "المقالات والدراسات" },
    {
      value: "scientific_library_item",
      label: "المصنَّفات والمكتبة الرقمية",
    },
    { value: "dissertation", label: "الإنتاج الأكاديمي والإشراف العلمي" },
    { value: "listening_series", label: "سلسلة مجالس السماع" },
    { value: "listening_session", label: "مجلس سماع" },
    { value: "scientific_fatwa", label: "الفتاوى والمسائل الحديثة" },
    { value: "scientific_video", label: "المرئيات واللقاءات العلمية" },
  ],
};

export function formatCommentDate(
  value: string | null,
  fallback?: string | null,
): string {
  if (!value) return fallback || "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback || value;
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
